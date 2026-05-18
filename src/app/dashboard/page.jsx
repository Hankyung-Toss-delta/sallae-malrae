"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Card from "@/components/ui/Card";
import ErrorAlert from "@/components/ui/ErrorAlert";
import ShareButton from "./ShareButton";

const CATEGORY_COLORS = [
  "#5F9367",
  "#8EBB96",
  "#D8B458",
  "#C9D2B6",
  "#49624F",
  "#B7C9A8",
];

const LEVEL_LABEL = {
  1: "이제 시작",
  2: "감을 잡는 중",
  3: "흐름을 타는 중",
  4: "이미 잘하고 있어요",
  5: "전설 반열 진입중",
};

function formatWon(value) {
  return new Intl.NumberFormat("ko-KR").format(value ?? 0);
}

function getChartBackground(items) {
  if (items.length === 0) return "#EEF1EA";
  let current = 0;
  return `conic-gradient(${items
    .map((item, idx) => {
      const start = current;
      const end = current + item.ratio;
      current = end;
      const color = item.color ?? CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
      return `${color} ${start}% ${end}%`;
    })
    .join(", ")})`;
}

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
        if (res.status === 401) { router.push("/auth/login"); return; }

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

function DashboardContent({ data }) {
  const { user, summary, recentItems, expired_count, categoryChart } = data;

  const passedCount = summary.passed_count;
  const savedAmount = summary.saved_amount;
  const successRate = summary.success_rate;
  const isEmpty = passedCount === 0 && recentItems.length === 0;

  const summaryCards = [
    {
      label: "참은 횟수",
      value: passedCount.toLocaleString("ko-KR"),
      hint: passedCount === 0 ? "아직 기록이 없어요" : "누적 기준",
    },
    {
      label: "절약 금액",
      value: formatWon(savedAmount),
      hint: "단위 (원)",
    },
    {
      label: "성공률",
      value: `${successRate}%`,
      hint:
        passedCount + summary.bought_count === 0
          ? "아직 결정한 항목이 없어요"
          : "누적 기준",
      progress: successRate,
    },
    {
      label: "레벨",
      value: `Lv.${user.level}`,
      hint: LEVEL_LABEL[user.level] ?? "꾸준히 가는 중",
    },
  ];

  const chartItems = categoryChart.map((item, idx) => ({
    ...item,
    color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
  }));
  const chartBackground = getChartBackground(chartItems);

  return (
    <Card className="flex flex-col gap-3 border border-white/70 p-4 shadow-[0_24px_60px_rgba(33,70,56,0.10)] sm:p-5 lg:gap-4 lg:p-6">
      <div>
        <h1 className="text-[clamp(1.5rem,2vw,1.9rem)] font-bold tracking-tight text-[#1D2A21]">
          안녕하세요, {user.nickname}님
        </h1>

        <p className="mt-1 text-sm text-[#6B766F]">
          {isEmpty ? (
            <>아직 등록한 항목이 없어요. 첫 항목을 등록해보세요.</>
          ) : (
            <>
              벌써{" "}
              <span className="font-semibold text-[#2E7D5B]">
                {formatWon(savedAmount)}원
              </span>
              의 충동구매를 막아냈어요. 정말 대단해요.
            </>
          )}
        </p>

        {expired_count > 0 && (
          <Link
            href="/coolingoff"
            className="group mt-3 flex items-center gap-3 rounded-2xl border border-[#F4C57A] bg-gradient-to-r from-[#FFF4E0] to-[#FFE9C8] px-4 py-3 shadow-[0_6px_18px_rgba(180,113,28,0.10)] transition hover:from-[#FFEFCF] hover:to-[#FFE0B0]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4A93C] text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#8C5311]">
                기한이 지난 항목이 {expired_count}개 있어요
              </p>
              <p className="mt-0.5 text-xs text-[#A8763A]">
                결정하지 않으면 통계에 반영되지 않아요.
              </p>
            </div>

            <span className="flex items-center gap-1 text-xs font-medium text-[#8C5311] transition group-hover:gap-1.5">
              결정하러 가기
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <div
            key={item.label}
            className="relative flex flex-col gap-1.5 rounded-2xl border border-[#EEF1EA] bg-[#F7F8F2] px-4 py-3 shadow-[0_8px_20px_rgba(33,70,56,0.05)]"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#314639]">
                {item.label}
              </p>
              {item.label === "레벨" && (
                <ShareButton user={user} summary={summary} />
              )}
            </div>

            <p className="text-[1.5rem] font-bold leading-none text-[#4A8A72] lg:text-[1.75rem]">
              {item.value}
            </p>

            {item.progress != null ? (
              <div>
                <div className="h-1.5 rounded-full bg-[#DCE6DB]">
                  <div
                    className="h-full rounded-full bg-[#4A8A72] transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[#9BA59D]">{item.hint}</p>
              </div>
            ) : (
              <p className="text-xs text-[#9BA59D]">{item.hint}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-3 xl:grid-cols-[1.12fr_0.88fr]">
        <RecentItemsCard items={recentItems} />
        <CategoryChartCard items={chartItems} background={chartBackground} />
      </div>
    </Card>
  );
}

function RecentItemsCard({ items }) {
  return (
    <div className="flex flex-col rounded-2xl border border-[#EEF1EA] bg-[#F7F8F2] p-4 shadow-[0_10px_28px_rgba(33,70,56,0.06)]">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#24352A]">
          쿨링오프 목록
        </h2>
        <Link
          href="/coolingoff"
          className="text-sm text-[#9BA59D] transition hover:text-[#2E7D5B]"
        >
          더보기
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#D5DBC9] bg-white py-8 text-center">
          <p className="text-sm text-[#6B766F]">
            아직 쿨링오프 중인 항목이 없어요.
          </p>
          <Link
            href="/coolingoff/new"
            className="rounded-full bg-[#8FA58D] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#7C9279]"
          >
            첫 항목 등록하기
          </Link>
        </div>
      ) : (
        <div className="mt-2.5 flex flex-col gap-2">
          {items.map((item) => {
            const daysLeft = item.days_left;
            return (
              <div
                key={item.item_id}
                className="flex items-center gap-3 rounded-2xl border border-[#EEF1EA] bg-white px-3 py-2.5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,#2A473B,#7EA286)] text-[10px] font-semibold text-white">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "ITEM"
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#223329]">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#92A094]">
                    {item.category_name} ·{" "}
                    {daysLeft === 0 ? "오늘 마감" : `남은 ${daysLeft}일`}
                  </p>
                  <p className="text-sm font-semibold text-[#314639]">
                    {formatWon(item.price)}원
                  </p>
                </div>

                <span className="rounded-full bg-[#E8F1E9] px-2.5 py-1 text-xs font-medium text-[#5D7A62]">
                  꾹 참는 중
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CategoryChartCard({ items, background }) {
  const isEmpty = items.length === 0;

  return (
    <div className="flex flex-col rounded-2xl border border-[#EEF1EA] bg-[#F7F8F2] p-4 shadow-[0_10px_28px_rgba(33,70,56,0.06)]">
      <h2 className="text-base font-semibold text-[#24352A]">
        카테고리별 비율
      </h2>

      {isEmpty ? (
        <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#D5DBC9] bg-white py-8 text-center">
          <p className="text-sm text-[#6B766F]">
            참은 항목이 쌓이면 카테고리별 비율을 보여드릴게요.
          </p>
        </div>
      ) : (
        <div className="mt-2.5 flex flex-1 flex-col items-center justify-center gap-6 lg:flex-row lg:justify-center lg:gap-12">
          <div
            className="relative h-36 w-36 shrink-0 rounded-full lg:h-40 lg:w-40"
            style={{ background }}
          >
            <div className="absolute inset-[26%] rounded-full bg-[#F7F8F2]" />
          </div>

          <div className="w-full max-w-[220px] space-y-2 lg:w-[180px] lg:max-w-none">
            {items.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="flex items-center gap-2 text-[#55655A]">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </div>
                <span className="font-semibold text-[#24352A]">
                  {item.ratio}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <Card className="flex flex-col gap-4 border border-white/70 p-4 shadow-[0_24px_60px_rgba(33,70,56,0.10)] sm:p-5 lg:p-6">
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded bg-[#EEF1EA]" />
        <div className="h-4 w-72 animate-pulse rounded bg-[#EEF1EA]" />
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl bg-[#EEF1EA]"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="h-56 animate-pulse rounded-2xl bg-[#EEF1EA]" />
        <div className="h-56 animate-pulse rounded-2xl bg-[#EEF1EA]" />
      </div>
    </Card>
  );
}
