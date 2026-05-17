"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import AuthCard from "@/components/auth/AuthCard";
import Header from "@/components/layout/Header";
import ErrorAlert from "@/components/ui/ErrorAlert";
import Input from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { ERROR_MESSAGES } from "@/constants/errors";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const justSignedUp = searchParams.get("signup") === "success";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage(ERROR_MESSAGES.REQUIRED_FIELD);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();

      if (!body.success) {
        setErrorMessage(ERROR_MESSAGES[body.code] ?? "로그인에 실패했습니다.");
        return;
      }

      login(body.data.user);
      router.push("/dashboard");
    } catch {
      setErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 pt-20 pb-8">
      <Header variant="auth" />

      <AuthCard>
        <h1 className="mt-4 mb-2 text-2xl font-bold">반가워요!</h1>

        <p className="mb-10 text-sm text-gray-400">
          당신의 지갑을 지키는 든든한 습관, 살래말래입니다.
        </p>

        {justSignedUp && (
          <p className="mb-4 text-sm text-[#5D7A62]" role="status">
            회원가입이 완료되었어요. 로그인해주세요.
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-4">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              id="password"
              name="password"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <ErrorAlert message={errorMessage} className="mt-4" />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 inline-flex h-14 w-full cursor-pointer items-center justify-center rounded-[22px] bg-[#8FA58D] px-6 text-base font-medium text-white transition-colors hover:bg-[#81967F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "로그인 중..." : "로그인하기"}
          </button>
        </form>

        <div className="mt-5 mb-5 flex items-center justify-center gap-2 text-xs">
          <span className="text-gray-500">아직 회원이 아니신가요?</span>

          <Link
            href="/auth/signup"
            className="font-medium text-[#8FA58D] hover:underline"
          >
            회원가입
          </Link>
        </div>
      </AuthCard>
    </main>
  );
}
