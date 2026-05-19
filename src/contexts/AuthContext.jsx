"use client";

import { createContext, useContext, useRef, useState } from "react";

// AT/RT는 HttpOnly 쿠키로만 다뤄짐(미들웨어 보호). 클라이언트는 UI 표시용 user만 보관.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const isRefreshing = useRef(false);

  const login = (userInfo) => setUser(userInfo);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // 네트워크 오류여도 클라이언트 상태는 비움(사용자 의도 보존).
    } finally {
      setUser(null);
    }
  };

  // AT 만료(401) 시 RT로 재발급 후 원래 요청 1회 재시도.
  // 재발급 자체가 401이면 세션 만료로 간주 — 원본 응답 그대로 반환.
  const fetchWithRefresh = async (input, init) => {
    const res = await fetch(input, init);
    if (res.status !== 401) return res;

    // 동시 요청이 여럿일 때 refresh를 중복 호출하지 않도록 플래그로 직렬화.
    if (isRefreshing.current) return res;
    isRefreshing.current = true;

    try {
      const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
      if (!refreshRes.ok) return res; // RT도 만료 — 원본 401 반환
      return fetch(input, init);     // 새 AT 쿠키로 재시도
    } finally {
      isRefreshing.current = false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: user !== null, login, logout, fetchWithRefresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
