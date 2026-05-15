import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Card from "@/components/ui/Card";
import ShareButton from "./ShareButton";

const SUMMARY_CARDS = [
  {
    label: "참은 횟수",
    value: "42",
    hint: "총 50번 중",
  },
  {
    label: "절약 금액",
    value: "673,700",
    hint: "단위 (원)",
  },
  {
    label: "성공률",
    value: "84%",
    hint: "이번 달 기준",
    progress: 84,
  },
  {
    label: "레벨",
    value: "Lv.5",
    hint: "전설 반열 진입중",
  },
];

const RECENT_ITEMS = [
  {
    name: "아디다스 삼바 OG",
    price: 129000,
    meta: "패션 / 남은 2일",
  },
  {
    name: "레고 아이디어 재즈클럽",
    price: 299000,
    meta: "취미 / 남은 5일",
  },
  {
    name: "소니 WH-1000XM5",
    price: 459000,
    meta: "전자기기 / 남은 1일",
  },
];

const CATEGORY_ITEMS = [
  { name: "패션", ratio: 38, color: "#5F9367" },
  { name: "취미/덕질", ratio: 24, color: "#8EBB96" },
  { name: "식비", ratio: 18, color: "#D8B458" },
  { name: "전자기기", ratio: 14, color: "#C9D2B6" },
  { name: "기타", ratio: 6, color: "#49624F" },
];

function formatWon(value) {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function getChartBackground(items) {
  let current = 0;

  return `conic-gradient(${items
    .map((item) => {
      const start = current;
      const end = current + item.ratio;
      current = end;
      return `${item.color} ${start}% ${end}%`;
    })
    .join(", ")})`;
}

export default function DashboardPage() {
  const chartBackground = getChartBackground(CATEGORY_ITEMS);

  return (
    <div className="flex min-h-screen flex-col">
      <Header activeMenu="dashboard" />

      <main className="flex min-h-screen flex-col px-4 pb-6 pt-20 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col">
          <p className="mb-2 text-xs font-semibold tracking-[0.24em] text-[#8FA58D]">
            DASHBOARD
          </p>

          <Card className="flex flex-col gap-3 border border-white/70 p-4 shadow-[0_24px_60px_rgba(33,70,56,0.10)] sm:p-5 lg:gap-4 lg:p-6">
            <div>
              <h1 className="text-[clamp(1.5rem,2vw,1.9rem)] font-bold tracking-tight text-[#1D2A21]">
                안녕하세요, 예린님
              </h1>

              <p className="mt-1 text-sm text-[#6B766F]">
                벌써{" "}
                <span className="font-semibold text-[#2E7D5B]">673,700원</span>
                의 충동구매를 막아냈어요. 정말 대단해요.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {SUMMARY_CARDS.map((item) => (
                <div
                  key={item.label}
                  className="relative flex flex-col gap-1.5 rounded-2xl border border-[#EEF1EA] bg-[#F7F8F2] px-4 py-3 shadow-[0_8px_20px_rgba(33,70,56,0.05)]"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#314639]">
                      {item.label}
                    </p>

                    {item.label === "레벨" && <ShareButton />}
                  </div>

                  <p className="text-[1.5rem] font-bold leading-none text-[#4A8A72] lg:text-[1.75rem]">
                    {item.value}
                  </p>

                  {item.progress ? (
                    <div>
                      <div className="h-1.5 rounded-full bg-[#DCE6DB]">
                        <div
                          className="h-full rounded-full bg-[#4A8A72]"
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

            <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-[1.12fr_0.88fr]">
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

                <div className="mt-2.5 flex flex-col gap-2">
                  {RECENT_ITEMS.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-3 rounded-2xl border border-[#EEF1EA] bg-white px-3 py-2.5"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#2A473B,#7EA286)] text-[10px] font-semibold text-white">
                        ITEM
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#223329]">
                          {item.name}
                        </p>

                        <p className="text-xs text-[#92A094]">{item.meta}</p>

                        <p className="text-sm font-semibold text-[#314639]">
                          {formatWon(item.price)}
                        </p>
                      </div>

                      <span className="rounded-full bg-[#FDEBEC] px-2.5 py-1 text-xs font-medium text-[#E37C89]">
                        보류중
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col rounded-2xl border border-[#EEF1EA] bg-[#F7F8F2] p-4 shadow-[0_10px_28px_rgba(33,70,56,0.06)]">
                <h2 className="text-base font-semibold text-[#24352A]">
                  카테고리별 비율
                </h2>

                <div className="mt-2.5 flex flex-col items-center justify-center gap-4 lg:flex-row lg:justify-between">
                  <div
                    className="relative h-32 w-32 shrink-0 rounded-full lg:h-36 lg:w-36"
                    style={{ background: chartBackground }}
                  >
                    <div className="absolute inset-[26%] rounded-full bg-[#F7F8F2]" />
                  </div>

                  <div className="w-full space-y-1.5 lg:max-w-[200px]">
                    {CATEGORY_ITEMS.map((item) => (
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
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
