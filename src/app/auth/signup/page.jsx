"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import AuthCard from "@/components/auth/AuthCard";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ERROR_MESSAGES } from "@/constants/errors";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage(ERROR_MESSAGES.PASSWORD_TOO_SHORT);
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nickname, password }),
      });
      const body = await res.json();

      if (!body.success) {
        setErrorMessage(ERROR_MESSAGES[body.code] ?? "회원가입에 실패했습니다.");
        return;
      }

      router.push("/auth/login?signup=success");
    } catch {
      setErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Header variant="auth" />

      <AuthCard>
        <h1 className="mt-2 mb-1 text-2xl font-bold">시작해볼까요?</h1>

        <p className="mb-6 text-sm text-gray-400">
          계정을 만들고 살래말래를 경험해보세요.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-3">
            <Input
              id="email"
              name="email"
              type="email"
              label="이메일"
              placeholder="hello@example.com"
              className="py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              id="nickname"
              name="nickname"
              label="닉네임"
              className="py-2"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              maxLength={20}
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="비밀번호"
              placeholder="8자 이상"
              className="py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />

            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              label="비밀번호 확인"
              className="py-2"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
          </div>

          {errorMessage && (
            <p className="mt-3 text-sm text-red-500" role="alert">
              {errorMessage}
            </p>
          )}

          <Button
            type="submit"
            className="mt-6"
            fullWidth
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "가입 중..." : "가입하고 시작하기"}
          </Button>
        </form>

        <div className="mt-4 mb-2 flex items-center justify-center gap-2 text-xs">
          <span className="text-gray-500">이미 계정이 있으신가요?</span>

          <Link
            href="/auth/login"
            className="font-medium text-[#8FA58D] hover:underline"
          >
            로그인
          </Link>
        </div>
      </AuthCard>
    </main>
  );
}
