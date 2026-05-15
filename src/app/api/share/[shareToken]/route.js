import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/response';

// GET /api/share/:shareToken — 인증 없이 공유자 통계 조회.
export async function GET(request, { params }) {
  const { shareToken } = await params;

  const rows = await query(
    'SELECT id, nickname, level FROM users WHERE share_token = ?',
    [shareToken],
  );
  if (rows.length === 0) return errorResponse('INVALID_SHARE_TOKEN');

  const user = rows[0];

  const [statsRows, chartRows] = await Promise.all([
    query(
      `SELECT COALESCE(SUM(passed_count), 0) AS passed_count,
              COALESCE(SUM(bought_count), 0)  AS bought_count,
              COALESCE(SUM(saved_amount), 0)  AS saved_amount
       FROM user_monthly_stats WHERE user_id = ?`,
      [user.id],
    ),
    query(
      `SELECT c.name, COUNT(*) AS count
       FROM items i JOIN categories c ON i.category_id = c.id
       WHERE i.user_id = ? AND i.status = 'passed'
       GROUP BY i.category_id, c.name
       ORDER BY count DESC`,
      [user.id],
    ),
  ]);

  const stats = statsRows[0];
  const passedCount = Number(stats.passed_count);
  const boughtCount = Number(stats.bought_count);
  const savedAmount = Number(stats.saved_amount);

  const total = passedCount + boughtCount;
  const successRate = total === 0 ? 0 : Math.round((passedCount / total) * 1000) / 10;

  const categoryChart = chartRows.map(row => ({
    name: row.name,
    ratio: passedCount === 0 ? 0 : Math.round((Number(row.count) / passedCount) * 1000) / 10,
  }));

  return successResponse(
    {
      nickname: user.nickname,
      level: user.level,
      summary: { passed_count: passedCount, saved_amount: savedAmount, success_rate: successRate },
      categoryChart,
    },
    '공유 페이지를 불러왔습니다.',
  );
}
