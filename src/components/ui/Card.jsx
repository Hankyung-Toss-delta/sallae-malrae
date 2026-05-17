import Image from 'next/image'

export function calcDaysLeft(expireAt) {
  const diff = new Date(expireAt) - new Date();
  return diff <= 0 ? 0 : Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function Card({
  as: Component = "section",
  children,
  className = "",
}) {
  return (
    <Component className={`rounded-2xl bg-white shadow-sm ${className}`}>
      {children}
    </Component>
  );
}

export function CoolingOffCard({ item, onClick }) {
  const { name, price, category_name, expire_at, memo, impulse_score, image } =
    item;

  const daysLeft = calcDaysLeft(expire_at);

  return (
    <div
      className="w-full bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(item)}
    >
      <div className="bg-[#F1F1EA]">
        <div className="relative flex items-center gap-4 px-4 pt-4 pb-3">
          <div className="absolute top-3 right-3">
            {daysLeft === 0 ? (
              <span className="bg-pink-100 text-pink-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                완료
              </span>
            ) : (
              <span className="bg-orange-100 text-orange-500 text-xs font-bold px-2.5 py-0.5 rounded-full">
                D-{daysLeft}
              </span>
            )}
          </div>

          <div className="relative w-[90px] h-[90px] rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>

          <div className="flex flex-col gap-0.5 pr-10">
            <p className="font-bold text-[15px] text-gray-900 leading-snug">
              {name}
            </p>
            <p className="text-xs text-gray-400">
              {category_name}
            </p>
            <p className="font-bold text-[15px] text-gray-900 mt-1">
              ₩{price.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between">
        <p className="text-sm text-gray-500 truncate mr-4">&quot;{memo ?? "메모 없음"}&quot;</p>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-base">🔥</span>
          <span className="text-sm font-semibold text-gray-700">
            {impulse_score}
          </span>
        </div>
      </div>
    </div>
  );
}
