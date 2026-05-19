import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import { query } from "@/lib/db";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const { user_id } = jwt.decode(token);

  const [userRows, statsRows, recentItems, expiredRows, chartRows] = await Promise.all([
    query("SELECT nickname, level FROM users WHERE id = ?", [user_id]),
    query(
      `SELECT COALESCE(SUM(passed_count), 0) AS passed_count,
              COALESCE(SUM(bought_count), 0)  AS bought_count,
              COALESCE(SUM(saved_amount), 0)  AS saved_amount
       FROM user_monthly_stats
       WHERE user_id = ? AND year = YEAR(NOW()) AND month = MONTH(NOW())`,
      [user_id],
    ),
    query(
      `SELECT i.id AS item_id, i.name, i.price, i.expire_at, i.image,
              i.category_id, c.name AS category_name,
              GREATEST(0, FLOOR(TIMESTAMPDIFF(SECOND, NOW(), i.expire_at) / 86400)) AS days_left
       FROM items i JOIN categories c ON i.category_id = c.id
       WHERE i.user_id = ? AND i.status = 'waiting' AND i.expire_at >= NOW()
       ORDER BY i.expire_at ASC LIMIT 3`,
      [user_id],
    ),
    query(
      `SELECT COUNT(*) AS expired_count FROM items
       WHERE user_id = ? AND status = 'waiting' AND expire_at < NOW()`,
      [user_id],
    ),
    query(
      `SELECT c.name, COUNT(*) AS count
       FROM items i JOIN categories c ON i.category_id = c.id
       WHERE i.user_id = ? AND i.status = 'passed'
         AND YEAR(i.decided_at) = YEAR(NOW()) AND MONTH(i.decided_at) = MONTH(NOW())
       GROUP BY i.category_id, c.name
       ORDER BY count DESC`,
      [user_id],
    ),
  ]);

  const { nickname, level } = userRows[0];
  const stats = statsRows[0];
  const passedCount = Number(stats.passed_count);
  const boughtCount = Number(stats.bought_count);
  const savedAmount = Number(stats.saved_amount);

  const total = passedCount + boughtCount;
  const successRate = total === 0 ? 0 : Math.round((passedCount / total) * 1000) / 10;

  const categoryChart = chartRows.map((row) => ({
    name: row.name,
    count: Number(row.count),
    ratio: passedCount === 0 ? 0 : Math.round((Number(row.count) / passedCount) * 1000) / 10,
  }));

  const data = {
    user: { nickname, level },
    summary: { passed_count: passedCount, bought_count: boughtCount, saved_amount: savedAmount, success_rate: successRate },
    recentItems,
    expired_count: Number(expiredRows[0].expired_count),
    categoryChart,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header activeMenu="dashboard" />

      <main className="flex min-h-screen flex-col px-4 pb-6 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col">
          <p className="mb-2 text-xs font-semibold tracking-[0.24em] text-[#8FA58D]">
            DASHBOARD
          </p>
          <DashboardContent data={data} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
