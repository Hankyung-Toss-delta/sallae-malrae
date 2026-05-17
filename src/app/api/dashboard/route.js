import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';

// GET /api/dashboard — 메인 화면 데이터 일괄 조회.
export async function GET(request) {
  const user = getSessionUser(request);
  if (!user) return errorResponse('UNAUTHORIZED');

  const [userRows, statsRows, recentItems, expiredRows, chartRows] = await Promise.all([
    query('SELECT nickname, level FROM users WHERE id = ?', [user.user_id]),
    query(
      `SELECT COALESCE(SUM(passed_count), 0) AS passed_count,
              COALESCE(SUM(bought_count), 0)  AS bought_count,
              COALESCE(SUM(saved_amount), 0)  AS saved_amount
       FROM user_monthly_stats WHERE user_id = ?`,
      [user.user_id],
    ),
    query(
      `SELECT i.id AS item_id, i.name, i.price, i.expire_at, i.image,
              i.category_id, c.name AS category_name
       FROM items i JOIN categories c ON i.category_id = c.id
       WHERE i.user_id = ? AND i.status = 'waiting' AND i.expire_at >= NOW()
       ORDER BY i.expire_at ASC LIMIT 3`,
      [user.user_id],
    ),
    query(
      `SELECT COUNT(*) AS expired_count FROM items
       WHERE user_id = ? AND status = 'waiting' AND expire_at < NOW()`,
      [user.user_id],
    ),
    query(
      `SELECT c.name, COUNT(*) AS count
       FROM items i JOIN categories c ON i.category_id = c.id
       WHERE i.user_id = ? AND i.status = 'passed'
       GROUP BY i.category_id, c.name
       ORDER BY count DESC`,
      [user.user_id],
    ),
  ]);

  const { nickname, level } = userRows[0];
  const stats = statsRows[0];
  const passedCount = Number(stats.passed_count);
  const boughtCount = Number(stats.bought_count);
  const savedAmount = Number(stats.saved_amount);

  const total = passedCount + boughtCount;
  const successRate = total === 0 ? 0 : Math.round((passedCount / total) * 1000) / 10;

  const categoryChart = chartRows.map(row => ({
    name: row.name,
    count: Number(row.count),
    ratio: passedCount === 0 ? 0 : Math.round((Number(row.count) / passedCount) * 1000) / 10,
  }));

  return successResponse(
    {
      user: { nickname, level },
      summary: { passed_count: passedCount, bought_count: boughtCount, saved_amount: savedAmount, success_rate: successRate },
      recentItems,
      expired_count: Number(expiredRows[0].expired_count),
      categoryChart,
    },
    'Dashboard retrieved.',
  );
}
