"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Card from "@/components/ui/Card";
import ErrorAlert from "@/components/ui/ErrorAlert";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default function DashboardPage() {
  const router = useRouter();
  const { fetchWithRefresh } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetchWithRefresh("/api/dashboard");
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }

        const body = await res.json();
        if (cancelled) return;

        if (!body.success) {
          setErrorMessage("대시보드 정보를 불러오지 못했어요.");
          return;
        }

        setData(body.data);
      } catch {
        if (!cancelled) {
          setErrorMessage(
            "네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchWithRefresh, router]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header activeMenu="dashboard" />

      <main className="flex min-h-screen flex-col px-4 pb-6 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col">
          <p className="mb-2 text-xs font-semibold tracking-[0.24em] text-[#8FA58D]">
            DASHBOARD
          </p>

          {isLoading && <DashboardSkeleton />}

          {!isLoading && errorMessage && (
            <Card className="p-6">
              <ErrorAlert message={errorMessage} />
            </Card>
          )}

          {!isLoading && !errorMessage && data && (
            <DashboardContent data={data} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
