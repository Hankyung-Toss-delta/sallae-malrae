"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CoolingOffCard, calcDaysLeft } from "@/components/ui/Card";
import CoolingOffDetailPanel from "@/components/coolingoff/CoolingOffDetailPanel";

const CAROUSEL_GAP = 16;
const CAROUSEL_VISIBLE = 3;

const FILTERS = [
  { label: "참는중", value: "ongoing" },
  { label: "완료됨", value: "done" },
];

export default function CoolingOffPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("ongoing");
  const [completedSubFilter, setCompletedSubFilter] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselStep, setCarouselStep] = useState(0);
  const [shouldRefetch, setShouldRefetch] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    fetch('/api/items?status=all')
      .then((r) => r.json())
      .then((json) => { if (json.success) setItems(json.data.items); });
  }, [shouldRefetch]);

  const pendingItems = items.filter(
    (item) => calcDaysLeft(item.expire_at) === 0 && item.status === "waiting"
  );

  const maxCarouselIndex = Math.max(0, pendingItems.length - CAROUSEL_VISIBLE);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const compute = () => {
      const w = el.offsetWidth;
      if (w === 0) return;
      setCarouselStep(
        (w - CAROUSEL_GAP * (CAROUSEL_VISIBLE - 1)) / CAROUSEL_VISIBLE + CAROUSEL_GAP
      );
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pendingItems.length]);

  const filtered = items
    .filter((item) => {
      const daysLeft = calcDaysLeft(item.expire_at);
      if (daysLeft === 0 && item.status === "waiting") return false;

      if (filter === "ongoing") return item.status === "waiting" && daysLeft > 0;
      if (filter === "done") {
        if (item.status === "waiting") return false;
        if (completedSubFilter) return item.status === completedSubFilter;
        return true;
      }
      return false;
    })
    .sort((a, b) => calcDaysLeft(a.expire_at) - calcDaysLeft(b.expire_at));

  const handleFilterChange = (value) => {
    setFilter(value);
    if (value !== "done") setCompletedSubFilter(null);
  };

  const handleCardClick = (item) => {
    if (selectedItem?.item_id === item.item_id && isPanelOpen) {
      setIsPanelOpen(false);
      return;
    }
    setSelectedItem(item);
    setIsPanelOpen(true);
  };

  const handlePanelClose = () => setIsPanelOpen(false);

  const handleStatusChange = async (itemId, status) => {
    await fetch(`/api/items/${itemId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setShouldRefetch((n) => n + 1);
    setIsPanelOpen(false);
    setCarouselIndex(0);
  };

  const handlePrev = () => setCarouselIndex((i) => Math.max(0, i - 1));
  const handleNext = () =>
    setCarouselIndex((i) => Math.min(maxCarouselIndex, i + 1));

  return (
    <main className="min-h-screen">
      <Header activeMenu="coolingoff" />

      <section className="max-w-[1100px] mx-auto px-6 py-30">

        {/* 메인 헤더 */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">내 쿨링오프 목록</h1>
            <p className="text-sm text-gray-400 mt-1">
              지금 말고 내일 생각해도 늦지 않아요.
            </p>
          </div>
          <Link
            href="/coolingoff/new"
            className="bg-[#7aaa8a] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#6a9a7a] transition-colors"
          >
            + 등록하기
          </Link>
        </div>

        {/* 결정 대기 섹션 */}
        {pendingItems.length > 0 && (
          <div className="mb-10 p-6 bg-orange-50 rounded-3xl border border-orange-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse inline-block" />
              <h2 className="font-bold text-orange-500 text-base">결정 대기</h2>
              <span className="text-xs text-gray-400 ml-1">
                {pendingItems.length}개의 항목이 결정을 기다리고 있어요
              </span>
            </div>

            {pendingItems.length <= CAROUSEL_VISIBLE ? (
              <div className="grid grid-cols-3 gap-4">
                {pendingItems.map((item) => (
                  <CoolingOffCard key={item.item_id} item={item} onClick={handleCardClick} />
                ))}
              </div>
            ) : (
              <div className="relative">
                {carouselIndex > 0 && (
                  <button
                    onClick={handlePrev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-9 h-9 bg-white rounded-full shadow-md text-gray-500 hover:text-gray-800 flex items-center justify-center text-lg transition-colors"
                  >
                    ‹
                  </button>
                )}
                <div className="overflow-hidden" ref={carouselRef}>
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                      gap: `${CAROUSEL_GAP}px`,
                      transform: `translateX(-${carouselIndex * carouselStep}px)`,
                    }}
                  >
                    {pendingItems.map((item) => (
                      <div
                        key={item.item_id}
                        style={{
                          width: carouselStep > 0
                            ? `${carouselStep - CAROUSEL_GAP}px`
                            : "calc(33.333% - 10.667px)",
                          flexShrink: 0,
                        }}
                      >
                        <CoolingOffCard item={item} onClick={handleCardClick} />
                      </div>
                    ))}
                  </div>
                </div>
                {carouselIndex < maxCarouselIndex && (
                  <button
                    onClick={handleNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-9 h-9 bg-white rounded-full shadow-md text-gray-500 hover:text-gray-800 flex items-center justify-center text-lg transition-colors"
                  >
                    ›
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 필터 */}
        <div className="flex items-end gap-2 mb-6 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f.value
                  ? "bg-gray-700 text-white"
                  : "bg-white text-gray-500 border border-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}

          {filter === "done" && (
            <>
              <button
                onClick={() =>
                  setCompletedSubFilter(
                    completedSubFilter === "passed" ? null : "passed"
                  )
                }
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  completedSubFilter === "passed"
                    ? "bg-blue-500 text-white"
                    : "bg-white border border-blue-200 text-blue-500"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full inline-block ${
                    completedSubFilter === "passed" ? "bg-white" : "bg-blue-400"
                  }`}
                />
                아낌
              </button>
              <button
                onClick={() =>
                  setCompletedSubFilter(
                    completedSubFilter === "bought" ? null : "bought"
                  )
                }
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  completedSubFilter === "bought"
                    ? "bg-red-500 text-white"
                    : "bg-white border border-red-200 text-red-500"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full inline-block ${
                    completedSubFilter === "bought" ? "bg-white" : "bg-red-400"
                  }`}
                />
                구매
              </button>
            </>
          )}
        </div>

        {/* 카드 목록 */}
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((item) => (
            <CoolingOffCard key={item.item_id} item={item} onClick={handleCardClick} />
          ))}
        </div>
      </section>

      <Footer />

      <CoolingOffDetailPanel
        item={selectedItem}
        isOpen={isPanelOpen}
        onClose={handlePanelClose}
        onStatusChange={handleStatusChange}
      />
    </main>
  );
}
