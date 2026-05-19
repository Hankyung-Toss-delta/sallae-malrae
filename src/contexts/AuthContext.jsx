"use client";

import { createContext, useContext, useRef, useState } from "react";

// AT/RT는 HttpOnly 쿠키로만 다뤄짐(미들웨어 보호). 클라이언트는 UI 표시용 user만 보관.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const refreshPromise = useRef(null);

  const login = (userInfo) => setUser(userInfo);

  // 호출부는 logout 이후 window.location.replace로 전체 새로고침을 트리거함.
  // 새로고침이 React 트리/진행 중 fetch/refreshPromise를 모두 폐기하므로 setUser(null) 불필요.
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } catch {
      // 네트워크 오류여도 호출부는 그대로 진행(사용자 의도 보존).
    }
  };

  // AT 만료(401) 시 RT로 재발급 후 원래 요청 1회 재시도.
  // 재발급 자체가 401이거나 네트워크 오류면 세션 만료로 간주 — 원본 응답 그대로 반환.
  const fetchWithRefresh = async (input, init) => {
    const reqInit = { ...init, credentials: init?.credentials ?? "same-origin" };
    const res = await fetch(input, reqInit);
    if (res.status !== 401) return res;

    // 동시 요청이 여럿이면 모두 같은 refresh Promise를 await 후 각자 재시도.
    if (!refreshPromise.current) {
      refreshPromise.current = fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "same-origin",
      })
        .catch(() => null) // 네트워크 오류 시 null로 흡수 → 아래에서 원본 401 반환
        .finally(() => { refreshPromise.current = null; });
    }

    const refreshRes = await refreshPromise.current;
    if (!refreshRes || !refreshRes.ok) return res; // RT 만료/네트워크 오류 — 원본 401 반환
    return fetch(input, reqInit);                // 새 AT 쿠키로 재시도
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
