import { useEffect } from "react";

const LEVEL_EMOJI = {
  1: "🌱",
  2: "💪",
  3: "🏅",
  4: "💰",
  5: "👑",
};

export default function LevelUpModal({ levelInfo, onClose }) {
  useEffect(() => {
    if (!levelInfo) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [levelInfo, onClose]);

  if (!levelInfo) return null;

  return (
    <>
      <style>{`
        @keyframes levelUpPop {
          0%   { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
          80%  { transform: scale(0.95) rotate(-1deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes levelUpFadeUp {
          0%   { transform: translateY(16px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div
        className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      >
        <div style={{ animation: 'levelUpPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
          <span style={{ fontSize: '110px', lineHeight: 1 }}>{LEVEL_EMOJI[levelInfo.level]}</span>
        </div>
        <div
          className="mt-6 flex flex-col items-center gap-2"
          style={{ animation: 'levelUpFadeUp 0.4s 0.35s ease-out both' }}
        >
          <span className="text-yellow-300 text-xs font-bold tracking-[0.3em]">LEVEL UP!</span>
          <p className="text-white text-2xl font-bold mt-1">
            Lv.{levelInfo.level}&nbsp;&nbsp;{levelInfo.name}
          </p>
          <p className="text-white/60 text-sm text-center leading-relaxed whitespace-pre-line mt-1 px-8">
            {levelInfo.description}
          </p>
        </div>
        <p className="mt-10 text-white/35 text-sm">탭하여 닫기</p>
      </div>
    </>
  );
}
