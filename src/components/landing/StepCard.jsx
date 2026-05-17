export default function StepCard({ step, title, subtitle, description, isActive }) {
  const bg = isActive
    ? "bg-[#3a3a3a] text-white"
    : step === 1
    ? "bg-[#c8e6c9] text-[#3a3a3a]"
    : "bg-[#f0f0f0] text-[#3a3a3a]";

  return (
    <div
      className={`rounded-3xl px-6 py-7 flex flex-col shadow-lg ${bg} ${
        isActive ? "w-44" : "w-40"
      }`}
      style={{ minHeight: "260px" }}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-4 ${
          isActive
            ? "bg-white/20 text-white"
            : "bg-white text-[#3a3a3a] shadow-sm"
        }`}
      >
        0{step}
      </div>
      <div>
        <p className="font-bold text-xl leading-tight">{title}</p>
        <p className={`text-sm mt-0.5 ${isActive ? "text-[#7aaa8a]" : "text-gray-400"}`}>
          {subtitle}
        </p>
      </div>
      <p
        className={`text-xs leading-relaxed mt-auto pt-4 ${
          isActive ? "text-white/70" : "text-gray-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}
