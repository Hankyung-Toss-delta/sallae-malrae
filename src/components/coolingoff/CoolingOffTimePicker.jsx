"use client";

import { useState } from "react";
import DropdownField from "./DropdownField";

const TIME_PERIOD_OPTIONS = ["오전", "오후"];
const TIME_HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

function toHour24(period, hourStr) {
  const h = parseInt(hourStr, 10);
  if (period === "오전") return h === 12 ? 0 : h;
  return h === 12 ? 12 : h + 12;
}

function getMinValidTime(minHour24) {
  for (const p of TIME_PERIOD_OPTIONS) {
    for (const h of TIME_HOUR_OPTIONS) {
      if (toHour24(p, h) >= minHour24) return { period: p, hour: h };
    }
  }
  return null;
}

export default function CoolingOffTimePicker({ minHour24 }) {
  const [period, setPeriod] = useState("오후");
  const [hour, setHour] = useState("08");

  const effectiveTime =
    minHour24 !== null && toHour24(period, hour) < minHour24
      ? (getMinValidTime(minHour24) ?? { period, hour })
      : { period, hour };

  const disabledPeriods =
    minHour24 !== null
      ? TIME_PERIOD_OPTIONS.filter((p) =>
          TIME_HOUR_OPTIONS.every((h) => toHour24(p, h) < minHour24),
        )
      : [];

  const disabledHours =
    minHour24 !== null
      ? TIME_HOUR_OPTIONS.filter(
          (h) => toHour24(effectiveTime.period, h) < minHour24,
        )
      : [];

  return (
    <div className="mt-4 rounded-[20px] bg-[#FBFCFB] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="decisionPeriod" className="text-sm font-semibold text-[#1F2A1F]">
          다시 볼 시간 <span className="text-red-500">*</span>
        </label>
        <span className="text-xs text-[#9AA49A]">
          차분히 다시 결정할 수 있는 시간으로 골라보세요.
        </span>
      </div>
      <div className="mt-3 grid gap-2.5 sm:mx-auto sm:max-w-[340px] sm:grid-cols-[104px_minmax(0,1fr)]">
        <DropdownField
          id="decisionPeriod"
          name="decisionPeriod"
          options={TIME_PERIOD_OPTIONS}
          value={effectiveTime.period}
          onChange={setPeriod}
          disabledValues={disabledPeriods}
        />
        <DropdownField
          id="decisionHour"
          name="decisionHour"
          options={TIME_HOUR_OPTIONS}
          value={effectiveTime.hour}
          onChange={setHour}
          suffix="시"
          disabledValues={disabledHours}
        />
      </div>
      <p className="mt-3 text-xs text-[#9AA49A]">
        예: 오후 8시에 다시 생각할 수 있게 설정해요.
      </p>
    </div>
  );
}
