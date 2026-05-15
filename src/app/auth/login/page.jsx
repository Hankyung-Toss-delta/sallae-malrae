import Link from "next/link";

import AuthCard from "@/components/auth/AuthCard";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Header variant="auth" />

      <AuthCard>
        <h1 className="mt-4 mb-2 text-2xl font-bold">반가워요!</h1>

        <p className="mb-10 text-sm text-gray-400">
          당신의 지갑을 지키는 든든한 습관, 살래말래입니다.
        </p>

        <div className="flex flex-col gap-4">
          <Input id="email" name="email" type="email" placeholder="이메일" />

          <Input
            id="password"
            name="password"
            type="password"
            placeholder="비밀번호"
          />
        </div>

        <Link
          href="/dashboard"
          className="
    mt-8 inline-flex h-14 w-full cursor-pointer items-center justify-center rounded-[22px]
    bg-[#8FA58D] px-6 text-base font-medium text-white transition-colors
    hover:bg-[#81967F]
  "
        >
          로그인하기
        </Link>

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
