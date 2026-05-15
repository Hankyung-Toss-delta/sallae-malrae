import Link from "next/link";

import AuthCard from "@/components/auth/AuthCard";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Header variant="auth" />

      <AuthCard>
        <h1 className="mt-2 mb-1 text-2xl font-bold">시작해볼까요?</h1>

        <p className="mb-6 text-sm text-gray-400">
          계정을 만들고 살래말래를 경험해보세요.
        </p>

        <div className="flex flex-col gap-3">
          <Input
            id="email"
            name="email"
            type="email"
            label="이메일"
            placeholder="hello@example.com"
            className="py-2"
          />

          <Input
            id="nickname"
            name="nickname"
            label="닉네임"
            className="py-2"
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="비밀번호"
            placeholder="8자 이상"
            className="py-2"
          />

          <Input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            label="비밀번호 확인"
            className="py-2"
          />
        </div>

        <Button className="mt-6" fullWidth size="lg">
          가입하고 시작하기
        </Button>

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
