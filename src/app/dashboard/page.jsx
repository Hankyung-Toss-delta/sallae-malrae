import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import { getDashboardData } from "@/lib/dashboard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const { user_id } = jwt.decode(token);

  const data = await getDashboardData(user_id);

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
