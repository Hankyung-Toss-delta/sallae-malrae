import { writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';
import { isPositiveInteger, isNonEmptyString } from '@/lib/validators';

// GET: status 파라미터로 WHERE 조건 + 정렬 결정. SQL 인젝션 방지용 whitelist.
const VALID_STATUS = new Set(['all', 'WAITING', 'BOUGHT', 'PASSED', 'EXPIRED']);

function buildListQuery(userId, statusParam) {
  const conds = ['i.user_id = ?'];
  const vals = [userId];
  let order;

  if (statusParam === 'WAITING') {
    conds.push("i.status = 'waiting'", 'i.expire_at >= NOW()');
    order = 'ORDER BY i.expire_at ASC, i.id ASC';
  } else if (statusParam === 'BOUGHT') {
    conds.push("i.status = 'bought'");
    order = 'ORDER BY i.decided_at DESC, i.id DESC';
  } else if (statusParam === 'PASSED') {
    conds.push("i.status = 'passed'");
    order = 'ORDER BY i.decided_at DESC, i.id DESC';
  } else if (statusParam === 'EXPIRED') {
    conds.push("i.status = 'waiting'", 'i.expire_at < NOW()');
    order = 'ORDER BY i.expire_at ASC, i.id ASC';
  } else {
    // 'all': 만료 미결정 → 진행 중 → 결정됨 (ADR-012)
    order = `ORDER BY
      CASE WHEN i.status = 'waiting' AND i.expire_at < NOW() THEN 0
           WHEN i.status = 'waiting' THEN 1
           ELSE 2 END ASC,
      i.expire_at ASC, i.id ASC`;
  }

  return { where: conds.join(' AND '), vals, order };
}

// GET /api/items — 목록 조회 (탭 필터 + counts + 페이지네이션)
export async function GET(request) {
  const user = getSessionUser(request);
  if (!user) return errorResponse('UNAUTHORIZED');

  const sp = new URL(request.url).searchParams;
  const statusParam = VALID_STATUS.has(sp.get('status')) ? sp.get('status') : 'all';
  const page = Math.max(1, Number(sp.get('page') || 1));
  const limit = Math.max(1, Number(sp.get('limit') || 20));
  const offset = (page - 1) * limit;

  const { where, vals, order } = buildListQuery(user.user_id, statusParam);

  const [items, totalRows, countRows] = await Promise.all([
    query(
      `SELECT i.id AS item_id, i.name, i.price, i.category_id, c.name AS category_name,
              i.status, i.expire_at, i.decided_at, i.memo, i.impulse_score, i.image, i.created_at
       FROM items i JOIN categories c ON i.category_id = c.id
       WHERE ${where} ${order} LIMIT ? OFFSET ?`,
      [...vals, limit, offset],
    ),
    query(`SELECT COUNT(*) AS total FROM items i WHERE ${where}`, vals),
    query(
      `SELECT
         COUNT(*) AS all_count,
         SUM(CASE WHEN status = 'waiting' AND expire_at >= NOW() THEN 1 ELSE 0 END) AS waiting,
         SUM(CASE WHEN status = 'bought'  THEN 1 ELSE 0 END) AS bought,
         SUM(CASE WHEN status = 'passed'  THEN 1 ELSE 0 END) AS passed,
         SUM(CASE WHEN status = 'waiting' AND expire_at < NOW() THEN 1 ELSE 0 END) AS expired
       FROM items WHERE user_id = ?`,
      [user.user_id],
    ),
  ]);

  const c = countRows[0];

  return successResponse(
    {
      items,
      counts: {
        all:     Number(c.all_count),
        waiting: Number(c.waiting),
        bought:  Number(c.bought),
        passed:  Number(c.passed),
        expired: Number(c.expired),
      },
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(Number(totalRows[0].total) / limit),
      },
    },
    '항목 목록을 불러왔습니다.',
  );
}

// expire_at 유효성 검사 — 정각 단위, 현재+1h ~ +30일
function isValidExpireAt(str) {
  const d = new Date(str);
  if (isNaN(d.getTime())) return false;
  if (d.getMinutes() !== 0 || d.getSeconds() !== 0 || d.getMilliseconds() !== 0) return false;
  const now = Date.now();
  return d.getTime() >= now + 60 * 60 * 1000 && d.getTime() <= now + 30 * 24 * 60 * 60 * 1000;
}

const ALLOWED_IMG_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const MAX_IMG_SIZE = 5 * 1024 * 1024; // 5MB

// POST /api/items — 새 항목 등록 (multipart/form-data)
export async function POST(request) {
  const user = getSessionUser(request);
  if (!user) return errorResponse('UNAUTHORIZED');

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse('REQUIRED_FIELD');
  }

  const name         = formData.get('name');
  const priceStr     = formData.get('price');
  const catIdStr     = formData.get('category_id');
  const expireAtStr  = formData.get('expire_at');
  const impulseStr   = formData.get('impulse_score');
  const memo         = formData.get('memo') || null;
  const imageFile    = formData.get('image');

  if (!isNonEmptyString(name) || !priceStr || !catIdStr || !expireAtStr || !impulseStr) {
    return errorResponse('REQUIRED_FIELD');
  }

  if (name.length > 100) return errorResponse('REQUIRED_FIELD');

  const price        = Number(priceStr);
  const categoryId   = Number(catIdStr);
  const impulseScore = Number(impulseStr);

  if (!isPositiveInteger(price))                                    return errorResponse('INVALID_PRICE');
  if (!Number.isInteger(impulseScore) || impulseScore < 1 || impulseScore > 10) return errorResponse('INVALID_IMPULSE_SCORE');
  if (!isValidExpireAt(expireAtStr))                                return errorResponse('INVALID_EXPIRE_AT');

  const cats = await query('SELECT id FROM categories WHERE id = ?', [categoryId]);
  if (cats.length === 0) return errorResponse('INVALID_CATEGORY');

  // 이미지 저장 (/public/uploads)
  let imagePath = null;
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop().toLowerCase();
    if (!ALLOWED_IMG_EXTS.has(ext) || imageFile.size > MAX_IMG_SIZE) return errorResponse('INVALID_IMAGE');
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const filename = `${randomUUID()}.${ext}`;
    await writeFile(path.join(process.cwd(), 'public', 'uploads', filename), buffer);
    imagePath = `/uploads/${filename}`;
  }

  const expireDate = new Date(expireAtStr);

  const result = await query(
    `INSERT INTO items (user_id, category_id, name, price, image, memo, impulse_score, expire_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [user.user_id, categoryId, name, price, imagePath, memo, impulseScore, expireDate],
  );

  const [newItem] = await query(
    `SELECT i.id AS item_id, i.name, i.price, i.category_id, c.name AS category_name,
            i.status, i.expire_at, i.decided_at, i.memo, i.impulse_score, i.image, i.created_at
     FROM items i JOIN categories c ON i.category_id = c.id
     WHERE i.id = ?`,
    [result.insertId],
  );

  return successResponse(newItem, '항목이 등록되었습니다.', 201);
}
