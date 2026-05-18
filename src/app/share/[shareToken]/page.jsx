"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import ErrorAlert from "@/components/ui/ErrorAlert";

const LEVEL_TITLE = {
  1: "이제 시작한 짠돌이",
  2: "감을 잡은 짠돌이",
  3: "흐름을 타는 짠돌이",
  4: "잘하고 있는 짠돌이",
  5: "전설의 짠돌이",
};

const LEVEL_DESCRIPTION = {
  1: "충동구매를 줄여보려는\n첫 걸음을 떼셨어요!",
  2: "조금씩 절약의 감을\n잡아가고 있어요!",
  3: "절약 습관이\n점점 자리잡고 있어요!",
  4: "충동구매를 잘 막아내는\n절약 고수예요!",
  5: "충동구매를 꾸준히 참아낸\n절약의 달인이에요!",
};

export default function SharePage({ params }) {
  const { shareToken } = use(params);

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/share/${shareToken}`);
        const body = await res.json();
        if (cancelled) return;

        if (!body.success) {
          setErrorMessage("유효하지 않거나 만료된 공유 링크예요.");
          return;
        }

        setData(body.data);
      } catch {
        if (!cancelled) {
          setErrorMessage("네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shareToken]);

  return (
    <div className="min-h-screen bg-[#F1F7F0] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <p className="mb-4 text-xs font-medium text-[#8FA58D]">
          레벨 공유 페이지 (링크로 공유되는 페이지)
        </p>

        <div className="rounded-3xl bg-[#EEF6EE] p-6 sm:p-8">
          {isLoading && <ShareSkeleton />}

          {!isLoading && errorMessage && (
            <div className="mx-auto max-w-md">
              <ErrorAlert message={errorMessage} />
            </div>
          )}

          {!isLoading && !errorMessage && data && <ShareContent data={data} />}
        </div>
      </div>
    </div>
  );
}

function ShareContent({ data }) {
  const { nickname, level, summary } = data;
  const title = LEVEL_TITLE[level] ?? "꾸준한 짠돌이";
  const description = LEVEL_DESCRIPTION[level] ?? "꾸준히 절약하고 있어요!";

  const passedCount = summary.passed_count;
  const boughtCount = summary.bought_count;
  const successRate = summary.success_rate;
  const total = passedCount + boughtCount;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
      <LevelCard
        level={level}
        title={title}
        description={description}
        nickname={nickname}
      />

      <div className="flex flex-col gap-4">
        <div className="flex justify-center lg:justify-start">
          <Image
            src="/images/logo.png"
            alt="살래말래"
            width={200}
            height={80}
            priority
            className="h-[72px] w-auto"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CountCard label="참은 횟수" value={passedCount} total={total} />
          <CountCard label="구매 횟수" value={boughtCount} total={total} />
        </div>

        <SuccessRateCard
          rate={successRate}
          passed={passedCount}
          total={total}
        />

        <CTACard />
      </div>
    </div>
  );
}

function LevelCard({ level, title, description, nickname }) {
  return (
    <div className="flex flex-col rounded-3xl border border-[#CBE0CF] bg-white p-6 shadow-[0_18px_40px_rgba(33,70,56,0.08)]">
      <div className="flex flex-col items-center">
        <span className="rounded-full bg-[#4A8A72] px-3 py-1 text-xs font-semibold text-white">
          LV.{level}
        </span>

        <div className="mt-4 flex h-44 w-44 items-center justify-center rounded-3xl bg-[#F7FBF6] text-6xl">
          🏛️
        </div>

        <h2 className="mt-5 text-xl font-bold text-[#1D2A21]">{title}</h2>
        <p className="mt-2 whitespace-pre-line text-center text-sm text-[#55655A]">
          {description}
        </p>

        {nickname && (
          <span className="mt-4 rounded-full bg-[#C9E0CE] px-3 py-1 text-xs font-medium text-[#3F6A4D]">
            @{nickname}의 기록
          </span>
        )}
      </div>

      <div className="mt-6">
        <p className="text-xs text-[#9BA59D]">다음 레벨까지</p>
        <div className="mt-2 h-2 rounded-full bg-[#E4EBE0]">
          <div
            className="h-full rounded-full bg-[#4A8A72]"
            style={{ width: "60%" }}
          />
        </div>
      </div>
    </div>
  );
}

function CountCard({ label, value, total }) {
  return (
    <div className="rounded-2xl border border-[#E4EBE0] bg-white p-5">
      <p className="text-sm font-medium text-[#55655A]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#1D2A21]">
        {value.toLocaleString("ko-KR")}
      </p>
      <p className="mt-1 text-xs text-[#9BA59D]">
        총 {total.toLocaleString("ko-KR")}번 중
      </p>
    </div>
  );
}

function SuccessRateCard({ rate, passed, total }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - rate / 100);

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E4EBE0] bg-white p-5">
      <div>
        <p className="text-sm font-medium text-[#55655A]">쿨링오프 성공률</p>
        <p className="mt-2 text-3xl font-bold text-[#4A8A72]">{rate}%</p>
        <p className="mt-1 text-xs text-[#9BA59D]">
          {total.toLocaleString("ko-KR")}번 중 {passed.toLocaleString("ko-KR")}번 참았어요
        </p>
      </div>

      <div className="relative h-20 w-20 shrink-0">
        <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="#E4EBE0"
            strokeWidth="8"
          />
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="#4A8A72"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-[#4A8A72]">
          {rate}%
        </div>
      </div>
    </div>
  );
}

function CTACard() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E4EBE0] bg-white p-5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#1D2A21]">
          나도 충동구매를 줄여볼까요?
        </p>
        <p className="mt-1 text-xs text-[#6B766F]">
          살래? 말래? 조금만 기다려봐요.
          <br />
          충동구매 브레이크 서비스, 살래말래
        </p>
      </div>
      <Link
        href="/"
        className="shrink-0 rounded-xl bg-[#FBEEC4] px-5 py-3 text-sm font-semibold text-[#7A5A1C] transition hover:bg-[#F6E3A8]"
      >
        시작하기
      </Link>
    </div>
  );
}

function ShareSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="h-[480px] animate-pulse rounded-3xl bg-white/70" />
      <div className="flex flex-col gap-4">
        <div className="h-16 w-48 animate-pulse rounded-xl bg-white/70" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="h-28 animate-pulse rounded-2xl bg-white/70" />
          <div className="h-28 animate-pulse rounded-2xl bg-white/70" />
        </div>
        <div className="h-28 animate-pulse rounded-2xl bg-white/70" />
        <div className="h-24 animate-pulse rounded-2xl bg-white/70" />
      </div>
    </div>
  );
}
