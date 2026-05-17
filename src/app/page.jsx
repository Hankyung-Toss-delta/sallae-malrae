"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StepCard from "@/components/landing/StepCard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    step: 1,
    title: "담기",
    subtitle: "Hot",
    description: "살래말래에서 마음에 드는 아이템을 위시리스트에 담으세요.",
    isActive: false,
  },
  {
    step: 2,
    title: "식히기",
    subtitle: "Cooling",
    description: "내가 정한 쿨링오프 기간만큼 구매를 잠시 미뤄보세요.",
    isActive: true,
  },
  {
    step: 3,
    title: "결정",
    subtitle: "Clear",
    description: "기간이 지나면 진짜 필요한 물건만 남아 현명한 결정을 하세요.",
    isActive: false,
  },
];

export default function Home() {
  const [day, setDay] = useState(3);

  const incrementDay = () => setDay((d) => Math.min(d + 1, 31));
  const decrementDay = () => setDay((d) => Math.max(d - 1, 1));

  const scrollToCoolingOff = () => {
    document.documentElement.style.scrollSnapType = "none";
    const target = document.getElementById("cooling-off-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        document.documentElement.style.scrollSnapType = "y mandatory";
      }, 1000);
    }
  };

  useEffect(() => {
    document.documentElement.style.scrollSnapType = "y mandatory";
    return () => {
      document.documentElement.style.scrollSnapType = "";
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray(".landing-section");

      sections.forEach((section) => {
        const bg = section.querySelector(".section-bg");
        const items = section.querySelectorAll(".section-content > *");
        if (!bg) return;

        gsap.set(bg, { yPercent: 100 });
        gsap.set(items, { opacity: 0, y: 30 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            once: true,
          },
        });

        tl.to(bg, { yPercent: 0, duration: 0.6, ease: "power2.out" });
        tl.to(
          items,
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.2, ease: "power2.out" },
          "+=0.1"
        );
      });

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Header
        navItems={[]}
        transparent
        rightSlot={
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-[#5D7A62]">
              로그인
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full bg-[#214638] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#1a3529] transition-colors"
            >
              회원가입
            </Link>
          </div>
        }
      />

      <main>
        {/* ── 1. 히어로 ── */}
        <section
          id="hero"
          className="landing-section snap-section relative min-h-screen overflow-hidden"
        >
          <div className="section-bg absolute inset-0 bg-[#edf5ef]" />

          {/* 워터마크 */}
          <div
            aria-hidden="true"
            className="absolute top-[61px] left-0 w-full overflow-hidden pointer-events-none select-none"
          >
            <span
              className="block font-black text-[#4a9f7e] leading-none whitespace-nowrap w-full text-center opacity-8"
              style={{ fontSize: "28vw" }}
            >
              살래말래
            </span>
          </div>

          {/* 지폐 왼쪽 */}
          <div className="absolute left-0 bottom-0 w-52 md:w-72 pointer-events-none">
            <Image
              src="/images/landing_page/landing_bill_left.png"
              alt=""
              width={300}
              height={300}
              className="w-full h-auto"
              priority
            />
          </div>

          {/* 지폐 오른쪽 */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 md:w-48 pointer-events-none rotate-[-25deg]">
            <Image
              src="/images/landing_page/landing_bill_right.png"
              alt=""
              width={250}
              height={250}
              className="w-full h-auto"
            />
          </div>

          <div className="section-content relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-16">
            <p className="text-xl md:text-6xl font-bold text-[#1a3a2e] mb-3">
              오늘 사고 싶은 그거,
            </p>

            <h1 className="text-xl md:text-6xl font-extrabold text-[#4a9f7e] leading-tight mb-8 flex items-center gap-2 flex-wrap justify-center">
              <span className="inline-flex items-center rounded-2xl px-6 py-1 mt-4 gap-5 shadow-md shadow-gray-500/20 bg-[#F1F1EA] rotate-[-10deg]">
                <span>{day}일</span>
                <div className="flex flex-col">
                  <button
                    onClick={incrementDay}
                    aria-label="일수 늘리기"
                    className="text-[#214638] text-[10px] leading-tight hover:opacity-60 transition-opacity"
                  >
                    ▲
                  </button>
                  <button
                    onClick={decrementDay}
                    aria-label="일수 줄이기"
                    className="text-[#214638] text-[10px] leading-tight hover:opacity-60 transition-opacity"
                  >
                    ▼
                  </button>
                </div>
              </span>
              뒤에도 사고 싶을까요?
            </h1>

            <p className="text-sm text-gray-500 leading-relaxed mb-1">
              &ldquo;내가 정한 쿨링오프 기간,
            </p>
            <p className="text-sm text-gray-500 leading-relaxed mb-10">
              시간이 지나면 진짜 필요한 물건만 남아요.&rdquo;
            </p>

            <div className="flex gap-3">
              <Link
                href="/auth/login"
                className="px-6 py-2.5 border border-[#214638] text-[#214638] rounded-full text-sm font-medium hover:bg-[#214638] hover:text-white transition-colors"
              >
                시작하기
              </Link>
              <button
                onClick={scrollToCoolingOff}
                className="px-6 py-3 bg-[#1a3a2e] text-white rounded-full text-sm font-medium hover:bg-[#1a3529] transition-colors"
              >
                쿨링오프가 뭐예요?
              </button>
            </div>
          </div>
        </section>

        {/* ── 2. 문구 ── */}
        <section
          id="quote"
          className="landing-section snap-section relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          <div className="section-bg absolute inset-0 bg-[#214638]" />
          <div className="section-content relative z-10 text-white text-center px-6 max-w-2xl mx-auto">
            <p className="text-xl md:text-2xl font-bold leading-relaxed mb-6">
              &ldquo;사고 싶은 마음은 순간이지만,
              <br />
              텅 빈 잔고는 한 달을 갑니다.&rdquo;
            </p>
            <p className="text-sm md:text-base text-white/80 underline underline-offset-4 decoration-white/40">
              당신의 내일을 지키는 냉정하고 차가운 시간, 쿨링오프.
            </p>
          </div>
        </section>

        {/* ── 3. 쿨링오프 설명 ── */}
        <section
          id="cooling-off-section"
          className="landing-section snap-section relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          <div className="section-bg absolute inset-0 bg-[#edf5ef]" />
          <div className="section-content relative z-10 w-full max-w-lg mx-auto px-6">
            <div className="relative bg-white rounded-3xl px-8 py-10 border border-blue-100 shadow-sm">
              {/* 아이스큐브 데코 */}
              <div
                aria-hidden="true"
                className="absolute -top-10 right-6 text-6xl pointer-events-none"
              >
                🧊
              </div>
              <div
                aria-hidden="true"
                className="absolute -top-5 right-20 text-4xl pointer-events-none opacity-70"
              >
                🧊
              </div>
              {/* 온도계 데코 */}
              <div
                aria-hidden="true"
                className="absolute -bottom-4 -left-5 text-5xl pointer-events-none rotate-12"
              >
                🌡️
              </div>

              <p className="text-xs text-gray-400 mb-5 font-mono tracking-widest">
                [ cooling - off ]
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-[#214638] mb-1 leading-snug">
                사고 나서 후회하지 말고,
              </h2>
              <h2 className="text-xl md:text-2xl font-bold mb-8 leading-snug">
                사기 전에{" "}
                <span className="text-blue-500 underline underline-offset-2">
                  식히세요.
                </span>
              </h2>

              <button className="w-full py-4 bg-gray-100 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                쿨링오프 경제학적 의미 설명
              </button>
            </div>
          </div>
        </section>

        {/* ── 4. 3단계 ── */}
        <section
          id="steps"
          className="landing-section snap-section relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          <div className="section-bg absolute inset-0 bg-[#edf5ef]" />
          <div className="section-content relative z-10 w-full px-6">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-[#214638] mb-2">
                충동구매를 막는 3단계
              </h2>
              <p className="text-sm text-gray-500">뜨거운 마음, 차가운 결정으로</p>
            </div>

            {/* 카드 팬 레이아웃 */}
            <div
              className="relative flex justify-center items-end mx-auto"
              style={{ height: "300px", maxWidth: "400px" }}
            >
              <div
                className="absolute z-0"
                style={{ transform: "translateX(-120px) rotate(-8deg)", bottom: 0 }}
              >
                <StepCard {...STEPS[0]} />
              </div>
              <div className="relative z-10" style={{ bottom: 0 }}>
                <StepCard {...STEPS[1]} />
              </div>
              <div
                className="absolute z-0"
                style={{ transform: "translateX(120px) rotate(8deg)", bottom: 0 }}
              >
                <StepCard {...STEPS[2]} />
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. CTA ── */}
        <section
          id="cta"
          className="landing-section snap-section relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          <div className="section-bg absolute inset-0 bg-[#edf5ef]" />
          <div className="section-content relative z-10 text-center px-6">
            <p className="text-xl md:text-2xl font-semibold text-[#3d3d3d] mb-3">
              살래말래와 함께
            </p>
            <h2 className="text-2xl md:text-4xl font-black text-[#214638] mb-12 flex items-center justify-center gap-2 flex-wrap">
              딱
              <span className="inline-flex items-center bg-white border-2 border-[#214638] rounded-xl px-4 py-1 shadow-sm">
                {day}일
              </span>
              만 참아볼까요?
            </h2>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-3 border border-[#214638] text-[#214638] rounded-full text-sm font-medium hover:bg-[#214638] hover:text-white transition-colors"
            >
              쿨링오프 시작하기 →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
