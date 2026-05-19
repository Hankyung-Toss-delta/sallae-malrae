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
    description: '"와, 이건 사야 해!" 싶은 아이템을 등록하세요.',
    imageSrc: "/images/landing_page/shopping_cart.png",
    imageStyle: { width: "550px", height: "550px", bottom: 15, left: -70},
    isActive: false,
  },
  {
    step: 2,
    title: "식히기",
    subtitle: "Cooling",
    description: "1일? 7일? 당신의 결심만큼 쿨링오프 기간을 설정하세요.",
    imageSrc: "/images/landing_page/clock_calendar.png",
    imageStyle: { width: "370px", height: "370px", top: -25, right: -35},
    isActive: true,
  },
  {
    step: 3,
    title: "결정",
    subtitle: "Clear",
    description: '기간이 끝난 뒤, 집계된 통계를 보며 결정하세요. "아직도 사고 싶나요?"',
    imageSrc: "/images/landing_page/decision.png",
    imageStyle: { width: "280px", height: "280px", top: -5, right: 10},
    isActive: false,
  },
];

export default function Home() {
  const [day, setDay] = useState(3);
  const [hoveredStep, setHoveredStep] = useState(null);

  const incrementDay = () => setDay((d) => Math.min(d + 1, 30));
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
        const isCooling = section.id === "cooling-off-section";
        const bg = section.querySelector(".section-bg");
        const sectionContent = section.querySelector(".section-content");
        const items = section.querySelectorAll(".section-content > *:not(.step-card-fan)");
        const stepCards = [...section.querySelectorAll(".step-card-item")].filter(el => el.offsetParent !== null);
        const heroBills = section.querySelectorAll(".hero-bill");
        const coolingCard = isCooling ? section.querySelector(".cooling-card") : null;
        const coolingDecos = isCooling ? section.querySelectorAll(".cooling-deco") : [];
        const coolingTexts = isCooling ? section.querySelectorAll(".cooling-text") : [];
        if (!bg) return;

        gsap.set(bg, { yPercent: 100 });
        if (isCooling) {
          if (coolingCard) gsap.set(coolingCard, { opacity: 0, y: 40 });
          if (coolingDecos.length) gsap.set(coolingDecos, { opacity: 0, y: 20 });
          if (coolingTexts.length) gsap.set(coolingTexts, { opacity: 0, y: 20 });
        } else {
          if (sectionContent) gsap.set(sectionContent, { opacity: 0, y: 40 });
          gsap.set(items, { opacity: 0, y: 30 });
          if (stepCards.length) gsap.set(stepCards, { opacity: 0, y: 150 });
          if (heroBills.length) gsap.set(heroBills, { opacity: 0, y: 40 });
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            once: true,
          },
        });

        tl.to(bg, { yPercent: 0, duration: 0.45, ease: "power2.out" });

        if (isCooling) {
          if (coolingCard) {
            tl.to(coolingCard, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", clearProps: "transform" }, "+=0.1");
          }
          if (coolingTexts.length) {
            tl.to(coolingTexts, { opacity: 1, y: 0, duration: 0.45, stagger: 0.3, ease: "power2.out", clearProps: "transform" }, "+=0.1");
          }
          if (coolingDecos.length) {
            tl.to(coolingDecos, { opacity: 1, y: 0, duration: 0.45, stagger: 0.3, ease: "power2.out", clearProps: "transform" }, "+=0.1");
          }
        } else {
          if (sectionContent) {
            tl.to(sectionContent, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", clearProps: "transform" }, "+=0.1");
          }
          tl.to(
            items,
            { opacity: 1, y: 0, duration: 0.35, stagger: 0.3, ease: "power2.out", clearProps: "transform" },
            "+=0.1"
          );
          if (heroBills.length) {
            tl.to(
              heroBills,
              { opacity: 0.75, y: 0, duration: 0.7, stagger: 0.4, ease: "power2.out", clearProps: "transform" },
              "-=0.2"
            );
          }
          if (stepCards.length) {
            const isMobile = window.innerWidth < 768;
            tl.to(
              stepCards,
              { opacity: 1, y: 0, duration: 0.5, stagger: isMobile ? 0 : 0.35, ease: "power2.out", clearProps: "transform" },
              "+=0.15"
            );
          }
        }
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
          <div className="section-bg absolute inset-0 bg-gradient-to-b from-[#eefff4] to-[#ffffff]" />

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
          <div className="hero-bill absolute -left-20 bottom-5 w-[250px] h-[225px] opacity-40 pointer-events-none md:top-10 md:w-[500px] md:h-[450px] md:opacity-75">
            <Image
              src="/images/landing_page/landing_bill_left.png"
              alt=""
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 250px, 500px"
            />
          </div>

          {/* 지폐 오른쪽 */}
          <div className="hero-bill absolute -right-5 bottom-15 -translate-y-1/2 w-[180px] h-[120px] opacity-40 pointer-events-none rotate-[-25deg] md:w-[350px] md:h-[240px] md:opacity-75">
            <Image
              src="/images/landing_page/landing_bill_right.png"
              alt=""
              fill
              className="object-contain"
              sizes="(max-width: 768px) 180px, 350px"
            />
          </div>

          <div className="section-content relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-16">
            <p className="text-xl md:text-6xl font-bold text-[#1a3a2e] mb-3">
              오늘 사고 싶은 그거,
            </p>

            <h1 className="text-2xl md:text-6xl font-extrabold text-[#4a9f7e] leading-tight mb-8 flex items-center gap-3 flex-wrap justify-center">
              <span className="inline-flex items-center rounded-xl md:rounded-2xl mb-3 md:mb-0 px-3 md:px-5 py-1.5 mt-4 gap-3 shadow-2xl shadow-gray-500/80 bg-[#F1F1EA] rotate-[-10deg]">
                <span className="text-4xl md:text-6xl">{day}일</span>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={incrementDay}
                    aria-label="일수 늘리기"
                    className="text-[14px] md:text-[25px] leading-tight hover:opacity-60 transition-opacity border rounded-lg md:rounded-xl px-3 bg-[#f4faf6]"
                  >
                    ▲
                  </button>
                  <button
                    onClick={decrementDay}
                    aria-label="일수 줄이기"
                    className="text-[14px] md:text-[25px] leading-tight hover:opacity-60 transition-opacity border rounded-lg md:rounded-xl px-3 bg-[#f4faf6]"
                  >
                    ▼
                  </button>
                </div>
              </span>
              뒤에도 사고 싶을까요?
            </h1>

            <div className="flex flex-col gap-2 text-sm text-[#1a3a2e] mb-12 items-center text-center md:text-xl md:w-128 md:items-stretch md:text-left">
              <p className="md:self-start">
                “내가 정한 <span className="font-bold">쿨링오프</span> 기간,
              </p>
              <p className="md:self-end md:mr-8">
                시간이 지나면 진짜 필요한 물건만 남아요.”
              </p>
            </div>

            <div className="flex gap-3 md:gap-5">
              <Link
                href="/auth/login"
                className="px-5 py-2.5 text-sm border-2 border-[#1a3a2e] text-[#1a3a2e] rounded-full font-bold bg-[#f1f1ea] shadow-xl transform transition-all duration-300 hover:-translate-y-2 hover:-translate-x-1 hover:shadow-lg md:px-8 md:py-4 md:text-lg"
              >
                시작하기
              </Link>
              <button
                onClick={scrollToCoolingOff}
                className="px-5 py-2.5 text-sm bg-[#1a3a2e] text-[#f1f1ea] rounded-full font-bold shadow-xl transform transition-all duration-300 hover:-translate-y-2 hover:-translate-x-1 hover:shadow-lg md:px-8 md:py-4 md:text-lg"
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
          <div className="section-bg absolute inset-0" />
          <div className="section-content relative z-10 text-white text-center px-4 md:px-6 mx-4 md:mx-auto bg-[#1a3a2e] w-[1440px] rounded-3xl py-10 md:py-16">
            <p className="text-[12px] md:text-4xl font-bold leading-relaxed mb-6">
              &ldquo;
              <span className="underline decoration-dotted decoration-1.5 md:decoration-4 underline-offset-6 md:underline-offset-14">
                사고 싶은 마음
              </span>
              은 순간이지만,&nbsp; 
              <span className="underline decoration-dotted decoration-1.5 md:decoration-4 underline-offset-6 md:underline-offset-14">
                텅 빈 잔고
              </span>
              는 한 달을 갑니다.&rdquo;
            </p>
            <p className="text-[12px] md:text-4xl font-bold leading-relaxed">
              당신의 내일을 지키는 냉정하고 차가운 시간,&nbsp;
              <span className="underline decoration-dotted decoration-1.5 md:decoration-4 underline-offset-6 md:underline-offset-14">
                쿨링오프
              </span>.
            </p>
          </div>
        </section>

        {/* ── 3. 쿨링오프 설명 ── */}
        <section
          id="cooling-off-section"
          className="landing-section snap-section relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          <div className="section-bg absolute inset-0" />
          <div className="section-content relative z-10 w-full max-w-4xl mx-auto px-6">
            <div className="cooling-card relative bg-white rounded-3xl px-8 py-10 border border-blue-100 shadow-2xl">
              {/* 아이스큐브 데코 */}
              <div
                aria-hidden="true"
                className="cooling-deco absolute -top-10 -right-9 md:-top-25 md:-right-25 pointer-events-none w-[120px] h-[120px] md:w-[230px] md:h-[230px]"
              >
                <Image src="/images/landing_page/ice_cube.png" alt="" fill className="object-contain" sizes="(max-width: 768px) 110px, 230px" />
              </div>
              {/* 온도계 데코 */}
              <div
                aria-hidden="true"
                className="cooling-deco absolute -bottom-8 -left-10 md:-bottom-25 md:-left-30 pointer-events-none rotate-[-15deg] w-[110px] h-[110px] md:w-[250px] md:h-[250px]"
              >
                <Image src="/images/landing_page/thermometer.png" alt="" fill className="object-contain" sizes="(max-width: 768px) 110px, 250px" />
              </div>

              <p className="cooling-text text-xs text-gray-400 mb-5 font-mono tracking-widest">
                [ cooling - off ]
              </p>
              <h2 className="cooling-text text-xl md:text-4xl font-bold mb-1 leading-snug">
                사고 나서 후회하지 말고,
              </h2>
              <h2 className="cooling-text text-xl md:text-4xl font-bold mb-8 leading-snug">
                사기 전에&nbsp;
                <span className="text-[#2f80e0]">
                  식히세요.
                </span>
              </h2>

              <button className="cooling-text w-full py-4 bg-gray-100 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                쿨링오프 경제학적 의미 설명
              </button>
            </div>
          </div>
        </section>

        {/* ── 4. 3단계 ── */}
        <section
          id="steps"
          className="landing-section snap-section relative min-h-screen flex items-center justify-center md:overflow-hidden"
        >
          <div className="section-bg absolute inset-0" />
          <div className="section-content relative z-10 w-full px-6">
            <div className="text-center mb-10 md:mb-16 gap-4 flex flex-col">
              <h2 className="text-2xl md:text-4xl mt-0 md:mt-5 font-extrabold text-[#1a3a2e] mb-2">
                충동구매를 막는 3단계
              </h2>
              <p className="text-sm md:text-xl text-gray-500">뜨거운 마음, 차가운 결정으로</p>
            </div>

            {/* 모바일: 가로 스크롤 캐러셀 */}
            <div className="step-card-fan md:hidden flex overflow-x-auto snap-x snap-mandatory gap-5 -mx-6 px-4 pb-6">
              {STEPS.map((step) => (
                <div key={step.step} className="step-card-item snap-center flex-shrink-0 relative" style={{ width: "270px", height: "330px" }}>
                  <div className="absolute" style={{ transform: "scale(0.75)", transformOrigin: "top left", width: "360px", height: "440px" }}>
                    <StepCard {...step} />
                  </div>
                </div>
              ))}
            </div>

            {/* 데스크톱: 팬 레이아웃 */}
            <div
              className="step-card-fan hidden md:flex relative justify-center items-center mx-auto"
              style={{ height: "480px" }}
            >
              {STEPS.map((step, i) => {
                const cfg = [
                  { x: -320, y:   0, rotate: -7, z: 1 },
                  { x: 0,    y:   -40, rotate:  6, z: 2 },
                  { x: 320,  y:   0, rotate: -7, z: 3 },
                ][i];
                const isHovered = hoveredStep === i;
                return (
                  <div
                    key={step.step}
                    style={{
                      position: "absolute",
                      transform: isHovered
                        ? `translateX(${cfg.x}px) translateY(${cfg.y - 16}px) rotate(0deg)`
                        : `translateX(${cfg.x}px) translateY(${cfg.y}px) rotate(${cfg.rotate}deg)`,
                      zIndex: isHovered ? 10 : cfg.z,
                      transition: "transform 0.4s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setHoveredStep(i)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    <div className="step-card-item">
                      <StepCard {...step} />
                    </div>
                  </div>
                );
              })}
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
            <p className="text-xl md:text-4xl font-semibold text-[#89928F] mb-3">
              살래말래와 함께
            </p>
            <h2 className="text-2xl md:text-6xl font-black text-[#89928F] mb-12 gap-4 flex items-center justify-center gap-2 flex-wrap">
              딱
              <span className="inline-flex text-3xl md:text-6xl items-center rounded-xl md:rounded-2xl px-3 md:px-5 py-1.5 mt-2 shadow-2xl shadow-gray-500/80 bg-[#F1F1EA] rotate-[-10deg] text-[#4A9F7E]">
                {day}일
              </span>
              만 참아볼까요?
            </h2>
            <div>
              <Link
                href="/auth/login"
                className="px-8 py-5 border-2 border-[#1a3a2e] text-[#1a3a2e] rounded-full text-lg font-bold bg-[#f1f1ea] shadow-xl transform transition-all duration-300 hover:-translate-y-2 hover:-translate-x-1 hover:shadow-lg"
              >
                쿨링오프 시작하기 →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <section className="snap-section">
        <Footer />
      </section>
    </>
  );
}