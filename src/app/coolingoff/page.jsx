"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CoolingOffCard } from "@/components/ui/Card";
import CoolingOffDetailPanel from "@/components/coolingoff/CoolingOffDetailPanel";
import LevelUpModal from "@/components/coolingoff/LevelUpModal";
import PendingItemsSection from "@/components/coolingoff/PendingItemsSection";
import CoolingOffFilterBar from "@/components/coolingoff/CoolingOffFilterBar";
import { getLevelMeta } from "@/lib/level";

export default function CoolingOffPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [fetchError, setFetchError] = useState(false);
  const [filter, setFilter] = useState("ongoing");
  const [completedSubFilter, setCompletedSubFilter] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState(null);
  const pendingLevelUpRef = useRef(null);
  const [statusError, setStatusError] = useState("");

  const fetchItems = useCallback(() => {
    fetch('/api/items?status=all', { method: 'GET' })
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          if (json.code === 'UNAUTHORIZED') { router.push('/auth/login'); return; }
          setFetchError(true);
          return;
        }
        setFetchError(false);
        setItems(json.data.items.map(item => ({ ...item, days_left: Number(item.days_left) })));
      })
      .catch(() => setFetchError(true));
  }, [router]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const pendingItems = items.filter(
    (item) => item.days_left === 0 && item.status === "waiting"
  );

  const filtered = items
    .filter((item) => {
      const daysLeft = item.days_left;
      if (daysLeft === 0 && item.status === "waiting") return false;
      if (filter === "ongoing") return item.status === "waiting" && daysLeft > 0;
      if (filter === "done") {
        if (item.status === "waiting") return false;
        if (completedSubFilter) return item.status === completedSubFilter;
        return true;
      }
      return false;
    })
    .sort((a, b) => a.days_left - b.days_left);

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

  const handleCelebrationEnd = useCallback(() => {
    if (pendingLevelUpRef.current) {
      setLevelUpInfo(pendingLevelUpRef.current);
      pendingLevelUpRef.current = null;
    }
  }, []);

  const handleDelete = async (itemId) => {
    try {
      await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
    } finally {
      setIsPanelOpen(false);
      fetchItems();
    }
  };

  const handleStatusChange = async (itemId, status) => {
    setStatusError("");
    try {
      const res = await fetch(`/api/items/${itemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success && json.code === 'UNAUTHORIZED') { router.push('/auth/login'); return; }
      if (json.data?.updatedStats?.levelUp) {
        pendingLevelUpRef.current = getLevelMeta(json.data.updatedStats.level);
      }
    } catch {
      setStatusError("네트워크 오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      fetchItems();
      setIsPanelOpen(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header activeMenu="coolingoff" />

      <section className="flex-1 max-w-[1100px] mx-auto px-6 py-30 w-full">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.24em] text-[#8FA58D]">
              COOLING OFF
            </p>
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

        {pendingItems.length > 0 && (
          <PendingItemsSection
            pendingItems={pendingItems}
            onCardClick={handleCardClick}
          />
        )}

        <CoolingOffFilterBar
          filter={filter}
          completedSubFilter={completedSubFilter}
          onFilterChange={handleFilterChange}
          onSubFilterChange={setCompletedSubFilter}
        />

        {fetchError ? (
          <p className="text-sm text-gray-400 text-center py-8">목록을 불러오지 못했어요.</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            {filter === "ongoing" ? "참는 중인 항목이 없어요." : "완료된 항목이 없어요."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <CoolingOffCard key={item.item_id} item={item} onClick={handleCardClick} />
            ))}
          </div>
        )}
      </section>

      <Footer />

      <LevelUpModal levelInfo={levelUpInfo} onClose={() => setLevelUpInfo(null)} />

      {statusError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 px-5 py-3 shadow-lg">
          <p className="text-sm font-medium text-red-500">{statusError}</p>
          <button
            onClick={() => setStatusError("")}
            className="text-red-300 hover:text-red-500 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      <CoolingOffDetailPanel
        item={selectedItem}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onCelebrationEnd={handleCelebrationEnd}
      />
    </main>
  );
}
