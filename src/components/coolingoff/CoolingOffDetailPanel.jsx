import { CATEGORY_LABELS, calcDaysLeft } from "@/components/ui/Card";

export default function CoolingOffDetailPanel({
  item,
  isOpen,
  onClose,
  onStatusChange,
}) {
  const daysLeft = item ? calcDaysLeft(item.expire_at) : 0;
  const isDecided = item?.status === "passed" || item?.status === "bought";

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-screen w-[480px] bg-[#f7fbf8] z-50 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {item && (
          <div className="p-7 flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {CATEGORY_LABELS[item.category_id] ?? item.category_id}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4 mt-0.5">
                {daysLeft === 0 ? (
                  <span className="bg-pink-100 text-pink-400 text-xs font-bold px-3 py-1 rounded-full">
                    완료
                  </span>
                ) : (
                  <span className="bg-orange-100 text-orange-500 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    D-{daysLeft} 만료 임박
                  </span>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-1"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="w-full bg-white rounded-2xl overflow-hidden flex items-center justify-center" style={{ minHeight: 220 }}>
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-[220px] bg-gray-100 rounded-2xl" />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">이만큼 사고싶어요!</span>
                <span className="text-gray-500">{item.impulse_score}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#5cbf7e] h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.impulse_score * 10}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-gray-700">등록 당시 메모</p>
              <div className="bg-white rounded-xl px-4 py-3 min-h-[80px]">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.memo || "메모가 없습니다."}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => onStatusChange(item.id, "passed")}
                disabled={isDecided}
                className="flex-1 py-3 rounded-xl bg-[#7aaa8a] text-white font-semibold text-sm hover:bg-[#6a9a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                참았어요
              </button>
              <button
                onClick={() => onStatusChange(item.id, "bought")}
                disabled={isDecided}
                className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                샀어요
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
