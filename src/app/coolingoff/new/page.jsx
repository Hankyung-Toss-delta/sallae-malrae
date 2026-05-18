"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { ERROR_MESSAGES } from "@/constants/errors";
import { CATEGORY_OPTIONS } from "@/constants/categories";
import RegisterSuccessModal from "./RegisterSuccessModal";

const CALENDAR_WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

const TIME_PERIOD_OPTIONS = ["오전", "오후"];
const TIME_HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);
const IMPULSE_LEVEL_OPTIONS = Array.from(
  { length: 10 },
  (_, index) => index + 1,
);

function getCalendarWeeks(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function formatDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function buildExpireAt(dateStr, period, hour) {
  const h = parseInt(hour, 10);
  let hour24;
  if (period === "오전") {
    hour24 = h === 12 ? 0 : h;
  } else {
    hour24 = h === 12 ? 12 : h + 12;
  }
  return new Date(`${dateStr}T${String(hour24).padStart(2, "0")}:00:00+09:00`).toISOString();
}

function FieldLabel({ children, required = true }) {
  return (
    <div className="mb-2 flex items-center gap-1">
      <label className="text-sm font-semibold text-[#1F2A1F]">{children}</label>

      {required && <span className="text-red-500">*</span>}
    </div>
  );
}

function SelectChevron({ className = "", isOpen = false }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 flex items-center text-[#7E8A7C] ${className}`}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#E2E8E0] bg-white shadow-sm">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.5 7.75 10 12.25l4.5-4.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
}

function DropdownField({
  id,
  name,
  options,
  placeholder = "선택",
  defaultValue = "",
  value: controlledValue,
  onChange: onChangeProp,
  disabledValues = [],
  suffix = "",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const selectedValue = isControlled ? controlledValue : internalValue;
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const displayLabel = selectedValue
    ? `${selectedValue}${suffix}`
    : placeholder;

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <input name={name} type="hidden" value={selectedValue} />

      <button
        id={id}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((open) => !open)}
        className={`flex h-12 w-full items-center rounded-xl border border-[#D6DDD4] bg-white px-4 text-left text-sm font-medium outline-none transition-[border-color,box-shadow,background-color] focus:border-[#8EAA92] focus:ring-4 focus:ring-[#E8F1E9] ${
          suffix ? "pr-18" : "pr-14"
        } ${selectedValue ? "text-[#1F2A1F]" : "text-[#9AA49A]"}`}
      >
        <span className="truncate">{displayLabel}</span>
      </button>

      {suffix && selectedValue && (
        <span className="pointer-events-none absolute inset-y-0 right-12 flex items-center text-sm font-medium text-[#7E8A7C]">
          {suffix}
        </span>
      )}

      <SelectChevron className="right-3" isOpen={isOpen} />

      {isOpen && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-[#D6DDD4] bg-white shadow-[0_18px_40px_-22px_rgba(49,66,49,0.45)]">
          <ul
            role="listbox"
            aria-labelledby={id}
            className="max-h-56 overflow-y-auto p-2"
          >
            {options.map((option) => {
              const isSelected = option === selectedValue;

              return (
                <li key={option}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      if (disabledValues.includes(option)) return;
                      if (isControlled) { onChangeProp?.(option); } else { setInternalValue(option); }
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      disabledValues.includes(option)
                        ? "text-[#C5CCC3] cursor-not-allowed"
                        : isSelected
                        ? "bg-[#E8F1E9] text-[#38503E]"
                        : "text-[#314231] hover:bg-[#F6FAF5]"
                    }`}
                  >
                    <span>{suffix ? `${option}${suffix}` : option}</span>

                    {isSelected && (
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className="h-4 w-4 text-[#5D7A62]"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="m3.5 8 2.5 2.5L12.5 4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function PageTitle() {
  return (
    <div className="w-full max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8FA58D]">
        Cooling Off
      </p>

      <h1 className="mt-3 text-3xl font-bold text-[#1F2A1F]">잠깐 멈춰봐요.</h1>

      <p className="mt-2 text-sm leading-6 text-[#7E8A7C]">
        지금 등록하고, 조금만 기다린 뒤 다시 결정해요.
      </p>
    </div>
  );
}

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function ImageUploadBox() {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleImageChange(event) {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      return;
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.has(nextFile.type)) {
      setImageError("JPG, PNG, WEBP, GIF 형식만 올릴 수 있어요.");
      event.target.value = "";
      return;
    }

    if (nextFile.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError("이미지는 5MB 이하만 올릴 수 있어요.");
      event.target.value = "";
      return;
    }

    setImageError("");

    const nextPreviewUrl = URL.createObjectURL(nextFile);

    setPreviewUrl((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }

      return nextPreviewUrl;
    });
    setFileName(nextFile.name);
  }

  return (
    <>
      <FieldLabel required={false}>상품 이미지</FieldLabel>

      <div className="rounded-xl border border-[#E2E8E0] bg-[#FBFCFB] px-4 py-3">
        <input
          ref={fileInputRef}
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl border border-[#D6DDD4] bg-white px-4 text-sm font-medium text-[#314231] transition-colors hover:bg-[#F6FAF5]"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F1E9] text-base text-[#5D7A62]">
              +
            </span>
            사진 업로드
          </button>

          <p
            className={`text-xs ${
              imageError ? "text-[#D96C6C] font-medium" : "text-[#8C968A]"
            }`}
          >
            {imageError ||
              fileName ||
              "5MB 이하 JPG·PNG·WEBP·GIF 이미지를 올릴 수 있어요."}
          </p>
        </div>
        {previewUrl && (
          <div className="mt-3 overflow-hidden rounded-xl border border-[#D6DDD4] bg-white">
            <Image
              src={previewUrl}
              alt="업로드한 상품 이미지 미리보기"
              width={960}
              height={640}
              unoptimized
              className="h-40 w-full object-cover"
            />
          </div>
        )}{" "}
      </div>
    </>
  );
}

function formatPriceWithCommas(digitsOnly) {
  if (!digitsOnly) return "";
  return Number(digitsOnly).toLocaleString("en-US");
}

function ProductInfoCard() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceDisplay, setPriceDisplay] = useState("");

  const handlePriceChange = (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, "");
    setPriceDisplay(formatPriceWithCommas(digitsOnly));
  };

  return (
    <Card className="p-6 sm:p-7">
      <ImageUploadBox />

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_160px] items-end gap-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:gap-4">
        <div className="min-w-0">
          <Input
            id="name"
            name="name"
            label={
              <>
                상품명 <span className="text-red-500">*</span>
              </>
            }
            placeholder="무엇을 사고 싶나요?"
            maxLength={100}
            className="py-3.5"
          />
        </div>

        <div className="relative min-w-0">
          <Input
            id="price"
            name="price"
            type="text"
            inputMode="numeric"
            value={priceDisplay}
            onChange={handlePriceChange}
            label={
              <>
                가격 <span className="text-red-500">*</span>
              </>
            }
            placeholder="320,000"
            className="py-3.5 pr-10"
          />

          <span className="pointer-events-none absolute bottom-[15px] right-4 text-sm text-gray-400">
            원
          </span>
        </div>
      </div>

      <div className="mt-4">
        <FieldLabel>카테고리</FieldLabel>
        <input
          name="category_id"
          type="hidden"
          value={selectedCategory ? String(CATEGORY_OPTIONS.indexOf(selectedCategory) + 1) : ""}
        />

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CATEGORY_OPTIONS.map((category) => {
            const isSelected = category === selectedCategory;

            return (
              <button
                key={category}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedCategory(category)}
                className={`flex h-[54px] items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors ${
                  isSelected
                    ? "border-[#8FA58D] bg-[#E8F1E9] text-[#38503E]"
                    : "border-[#D6DDD4] bg-[#FBFCFB] text-[#5B655D] hover:bg-white"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

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

function CoolingOffTimePicker({ minHour24 }) {
  const [period, setPeriod] = useState("오후");
  const [hour, setHour] = useState("08");

  const effectiveTime =
    minHour24 !== null && toHour24(period, hour) < minHour24
      ? (getMinValidTime(minHour24) ?? { period, hour })
      : { period, hour };

  const disabledPeriods =
    minHour24 !== null
      ? TIME_PERIOD_OPTIONS.filter((p) =>
          TIME_HOUR_OPTIONS.every((h) => toHour24(p, h) < minHour24)
        )
      : [];

  const disabledHours =
    minHour24 !== null
      ? TIME_HOUR_OPTIONS.filter((h) => toHour24(effectiveTime.period, h) < minHour24)
      : [];

  return (
    <div className="mt-4 rounded-[20px] bg-[#FBFCFB] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <label
          htmlFor="decisionPeriod"
          className="text-sm font-semibold text-[#1F2A1F]"
        >
          다시 볼 시간 <span className="text-red-500">*</span>
        </label>

        <span className="text-xs text-[#9AA49A]">
          나를 가장 잘 말릴 수 있는 시간으로 정해보세요.
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

const MONTH_NAMES = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

function getMinHour24() {
  const now = new Date();
  return now.getMinutes() === 0 ? now.getHours() + 1 : now.getHours() + 2;
}

function CoolingOffPeriodPicker() {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const maxDate = new Date(todayDate);
  maxDate.setDate(maxDate.getDate() + 30);

  const defaultDate = new Date(todayDate);
  defaultDate.setDate(defaultDate.getDate() + 7);

  const [viewYear, setViewYear] = useState(defaultDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(defaultDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(defaultDate.getDate());

  const selectedDateStr = selectedDay ? formatDateStr(viewYear, viewMonth, selectedDay) : "";
  const calendarWeeks = getCalendarWeeks(viewYear, viewMonth);

  const todayYear = todayDate.getFullYear();
  const todayMonth = todayDate.getMonth();
  const todayMinHour24 = getMinHour24();

  const isDisabled = (day) => {
    if (!day) return true;
    const d = new Date(viewYear, viewMonth, day);
    if (d < todayDate || d > maxDate) return true;
    if (d.getTime() === todayDate.getTime()) return todayMinHour24 > 23;
    return false;
  };

  const isSelectedToday =
    selectedDay !== null &&
    viewYear === todayYear &&
    viewMonth === todayMonth &&
    selectedDay === todayDate.getDate();

  const canGoPrev = viewYear > todayYear || (viewYear === todayYear && viewMonth > todayMonth);
  const canGoNext = (() => {
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    return new Date(nextYear, nextMonth, 1) <= maxDate;
  })();

  const handlePrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else { setViewMonth((m) => m - 1); }
    setSelectedDay(null);
  };

  const handleNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else { setViewMonth((m) => m + 1); }
    setSelectedDay(null);
  };

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        <label
          htmlFor="decisionDate"
          className="text-sm font-semibold text-[#1F2A1F]"
        >
          쿨링오프 기간 <span className="text-red-500">*</span>
        </label>

        <span className="rounded-full bg-[#EEF3EC] px-3 py-1 text-xs font-medium text-[#7E8A7C]">
          최대 30일
        </span>
      </div>

      <p className="mt-2 text-sm text-[#9AA49A]">
        며칠 후에도 사고 싶다면 그때 구매해요.
      </p>

      <div className="mx-auto mt-4 max-w-xl rounded-[24px] border border-[#E2E8E0] bg-white p-4 sm:p-5">
        <input
          id="decisionDate"
          name="decisionDate"
          type="hidden"
          value={selectedDateStr}
          readOnly
        />

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={!canGoPrev}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D6DDD4] text-base font-semibold text-[#5B655D] transition-colors hover:bg-[#F6FAF5] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="이전 달 보기"
          >
            &#8249;
          </button>

          <p className="text-base font-semibold text-[#1F2A1F] sm:text-lg">
            {viewYear}년 {MONTH_NAMES[viewMonth]}
          </p>

          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D6DDD4] text-base font-semibold text-[#5B655D] transition-colors hover:bg-[#F6FAF5] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="다음 달 보기"
          >
            &#8250;
          </button>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-[#A2AAA0]">
          {CALENDAR_WEEK_DAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="mt-2.5 grid grid-cols-7 gap-1.5">
          {calendarWeeks.flat().map((day, index) =>
            day ? (
              <button
                key={`${day}-${index}`}
                type="button"
                disabled={isDisabled(day)}
                aria-pressed={day === selectedDay}
                onClick={() => setSelectedDay(day)}
                className={`flex h-10 items-center justify-center rounded-xl border text-sm font-medium transition-colors ${
                  day === selectedDay
                    ? "border-[#8FA58D] bg-[#E8F1E9] text-[#38503E]"
                    : isDisabled(day)
                    ? "border-[#D6DDD4] bg-white text-[#C5CCC3] cursor-not-allowed"
                    : "border-[#D6DDD4] bg-white text-[#3B443B] hover:bg-[#F6FAF5]"
                }`}
              >
                {day}
              </button>
            ) : (
              <div
                key={`empty-${index}`}
                aria-hidden="true"
                className="h-10 rounded-xl border border-transparent"
              />
            ),
          )}
        </div>

        <CoolingOffTimePicker minHour24={isSelectedToday ? todayMinHour24 : null} />
      </div>
    </div>
  );
}

function ImpulseSlider() {
  const [impulseLevel, setImpulseLevel] = useState(3);
  const progress =
    ((impulseLevel - 1) / (IMPULSE_LEVEL_OPTIONS.length - 1)) * 100;

  return (
    <div className="rounded-xl border border-[#E2E8E0] bg-white px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[#8C968A]">
          1은 가벼운 관심, 10은 바로 사고 싶은 상태예요.
        </p>

        <span className="text-sm font-semibold text-[#5B655D]">
          {impulseLevel}/10
        </span>
      </div>

      <div className="mt-4">
        <input
          id="impulse_score"
          name="impulse_score"
          type="range"
          min="1"
          max="10"
          step="1"
          value={impulseLevel}
          onChange={(event) => setImpulseLevel(Number(event.target.value))}
          style={{
            background: `linear-gradient(to right, #7F987E 0%, #7F987E ${progress}%, #E3E9E1 ${progress}%, #E3E9E1 100%)`,
          }}
          className="
            h-1.5 w-full cursor-pointer appearance-none rounded-full bg-transparent
            [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full
            [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:bg-[#6D876D] [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(93,122,98,0.22)]
            [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent
            [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white
            [&::-moz-range-thumb]:bg-[#6D876D] [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(93,122,98,0.22)]
          "
        />

        <div className="mt-2 grid grid-cols-10 gap-1.5 px-1">
          {IMPULSE_LEVEL_OPTIONS.map((level) => {
            const isSelected = level === impulseLevel;

            return (
              <button
                key={level}
                type="button"
                onClick={() => setImpulseLevel(level)}
                aria-pressed={isSelected}
                aria-label={`${level}점 선택`}
                className="flex items-center justify-center py-1"
              >
                <span
                  className={`rounded-full transition-all ${
                    isSelected
                      ? "h-2 w-2 bg-[#6D876D]"
                      : "h-1.5 w-1.5 bg-[#D6DDD4]"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#97A096]">
          <span>애매하긴 해</span>
          <span>너무나도 사고 싶어</span>
        </div>
      </div>
    </div>
  );
}

const MEMO_MAX_LENGTH = 500;

function MemoField() {
  const [memo, setMemo] = useState("");
  const length = memo.length;
  const isNearLimit = length >= MEMO_MAX_LENGTH * 0.9;
  const isAtLimit = length >= MEMO_MAX_LENGTH;

  return (
    <div className="mt-6">
      <FieldLabel>이걸 사고 싶은 이유가 있나요?</FieldLabel>

      <div className="relative">
        <textarea
          id="memo"
          name="memo"
          rows="4"
          maxLength={MEMO_MAX_LENGTH}
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          placeholder="지금 당장 필요한 이유를 적어보세요."
          aria-describedby="memo-counter"
          className="w-full resize-none rounded-2xl border border-gray-300 px-5 py-4 pb-9 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-[#8EAA92]"
        />

        <p
          id="memo-counter"
          aria-live="polite"
          className={`pointer-events-none absolute bottom-3 right-4 text-xs tabular-nums ${
            isAtLimit
              ? "text-[#D96C6C] font-medium"
              : isNearLimit
              ? "text-[#A8763A]"
              : "text-[#9AA49A]"
          }`}
        >
          {length}/{MEMO_MAX_LENGTH}
        </p>
      </div>
    </div>
  );
}

function CoolingOffDetailCard() {
  return (
    <Card className="p-6 sm:p-7">
      <FieldLabel>지금 사고 싶은 마음</FieldLabel>

      <ImpulseSlider />

      <MemoField />

      <CoolingOffPeriodPicker />
    </Card>
  );
}


export default function CoolingOffNewPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const raw = new FormData(e.target);
      const decisionDate = raw.get("decisionDate");
      const decisionPeriod = raw.get("decisionPeriod");
      const decisionHour = raw.get("decisionHour");

      if (!decisionDate) {
        setError("쿨링오프 날짜를 선택해주세요.");
        return;
      }

      const formData = new FormData();
      formData.append("name", raw.get("name"));
      formData.append("price", String(raw.get("price")).replace(/,/g, ""));
      formData.append("category_id", raw.get("category_id"));
      formData.append("impulse_score", raw.get("impulse_score"));
      formData.append("expire_at", buildExpireAt(decisionDate, decisionPeriod, decisionHour));
      const memo = raw.get("memo");
      if (memo) formData.append("memo", memo);
      const image = raw.get("image");
      if (image && image.size > 0) formData.append("image", image);

      const res = await fetch("/api/items", { method: "POST", body: formData });
      const json = await res.json();

      if (json.success) {
        setShowSuccessModal(true);
        return;
      }

      if (json.code === 'UNAUTHORIZED') {
        router.push("/auth/login");
        return;
      }

      setError(ERROR_MESSAGES[json.code] ?? "오류가 발생했어요. 다시 시도해주세요.");
    } catch {
      setError("오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#F6FAF5]">
      <Header activeMenu="coolingoff" />

      <section className="flex-1 px-6 pb-16 pt-28">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
          <PageTitle />

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex w-full max-w-2xl flex-col items-center gap-5"
          >
            <div className="flex w-full flex-col gap-5">
              <ProductInfoCard />
              <CoolingOffDetailCard />
            </div>

            <ErrorAlert message={error} className="w-full" />

            <div className="flex w-full gap-3">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                type="button"
                onClick={() => router.push("/coolingoff")}
                className="border-transparent bg-[#D8DDDA] text-[#5B655D] hover:bg-[#CDD4D0]"
              >
                취소
              </Button>

              <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
                등록하고 멈춰보기
              </Button>
            </div>
          </form>
        </div>
      </section>

      <Footer />

      <RegisterSuccessModal
        open={showSuccessModal}
        onConfirm={() => router.push("/coolingoff")}
      />
    </main>
  );
}
