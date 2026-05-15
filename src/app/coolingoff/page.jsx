"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CoolingOffCard } from "@/components/ui/Card";
import { calcDaysLeft } from "@/components/ui/Card";
import CoolingOffDetailPanel from "@/components/coolingoff/CoolingOffDetailPanel";

const INITIAL_ITEMS = [
  {
    id: 1,
    name: "아디다스 슈퍼스타 2",
    category_id: 1,
    price: 180000,
    expire_at: "2026-05-10T00:00:00.000Z",
    memo: "스트레스 받아서 그냥 지르고 싶어 ㅠㅠ",
    impulse_score: 8,
    image: null,
    status: "waiting",
  },
  {
    id: 2,
    name: "아디다스 슈퍼스타 2",
    category_id: 1,
    price: 180000,
    expire_at: "2026-05-16T00:00:00.000Z",
    memo: "스트레스 받아서 그냥 지르고 싶어 ㅠㅠ",
    impulse_score: 8,
    image: null,
    status: "waiting",
  },
  {
    id: 3,
    name: "아디다스 슈퍼스타 2",
    category_id: 1,
    price: 180000,
    expire_at: "2026-05-20T00:00:00.000Z",
    memo: "스트레스 받아서 그냥 지르고 싶어 ㅠㅠ",
    impulse_score: 8,
    image: null,
    status: "waiting",
  },
  {
    id: 4,
    name: "아디다스 슈퍼스타 2",
    category_id: 1,
    price: 180000,
    expire_at: "2026-05-22T00:00:00.000Z",
    memo: "스트레스 받아서 그냥 지르고 싶어 ㅠㅠ",
    impulse_score: 8,
    image: null,
    status: "waiting",
  },
  {
    id: 5,
    name: "아디다스 슈퍼스타 2",
    category_id: 1,
    price: 180000,
    expire_at: "2026-05-16T00:00:00.000Z",
    memo: "스트레스 받아서 그냥 지르고 싶어 ㅠㅠ",
    impulse_score: 8,
    image: null,
    status: "waiting",
  },
  {
    id: 6,
    name: "아디다스 슈퍼스타 2",
    category_id: 1,
    price: 180000,
    expire_at: "2026-05-16T00:00:00.000Z",
    memo: "스트레스 받아서 그냥 지르고 싶어 ㅠㅠ",
    impulse_score: 8,
    image: null,
    status: "waiting",
  },
  {
    id: 7,
    name: "아디다스 슈퍼스타 2",
    category_id: 1,
    price: 180000,
    expire_at: "2026-05-16T00:00:00.000Z",
    memo: "스트레스 받아서 그냥 지르고 싶어 ㅠㅠ",
    impulse_score: 8,
    image: null,
    status: "waiting",
  },
  {
    id: 8,
    name: "아디다스 슈퍼스타 2",
    category_id: 1,
    price: 180000,
    expire_at: "2026-05-16T00:00:00.000Z",
    memo: "스트레스 받아서 그냥 지르고 싶어 ㅠㅠ",
    impulse_score: 8,
    image: null,
    status: "waiting",
  },
];

const FILTERS = [
  { label: "전체", value: "all" },
  { label: "참는중", value: "ongoing" },
  { label: "완료됨", value: "done" },
];

export default function CoolingOffPage() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [filter, setFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const filtered = items
    .filter((item) => {
      const daysLeft = calcDaysLeft(item.expire_at);
      if (filter === "ongoing") return daysLeft > 0;
      if (filter === "done") return daysLeft === 0;
      return true;
    })
    .sort((a, b) => calcDaysLeft(a.expire_at) - calcDaysLeft(b.expire_at));

  const handleCardClick = (item) => {
    if (selectedItem?.id === item.id && isPanelOpen) {
      setIsPanelOpen(false);
      return;
    }
    setSelectedItem(item);
    setIsPanelOpen(true);
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
  };

  const handleStatusChange = (id, status) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    setSelectedItem((prev) => (prev?.id === id ? { ...prev, status } : prev));
    setIsPanelOpen(false);
  };

  return (
    <main className="min-h-screen">
      <Header activeMenu="coolingoff" />

      <section className="max-w-[1100px] mx-auto px-6 py-30">
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

        <div className="flex gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f.value
                  ? "bg-gray-700 text-white"
                  : "bg-white text-gray-500 border border-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {filtered.map((item) => (
            <CoolingOffCard key={item.id} item={item} onClick={handleCardClick} />
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
