"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";

interface AuthData {
  user: User;
  expirationTime: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 클라이언트 사이드에서만 실행되도록 보장
  useEffect(() => {
    setIsClient(true);
  }, []);

  const checkAuthStatus = (): User | null => {
    if (typeof window === "undefined") return null;

    const authDataStr = localStorage.getItem("authData");
    if (!authDataStr) return null;

    try {
      const authData: AuthData = JSON.parse(authDataStr);
      const now = Date.now();

      // 24시간(86400000ms) 후 만료 체크
      if (now >= authData.expirationTime) {
        // 만료됨 - 자동 로그아웃
        localStorage.removeItem("authData");
        return null;
      }

      return authData.user;
    } catch (error) {
      // 파싱 오류 시 데이터 삭제
      localStorage.removeItem("authData");
      return null;
    }
  };

  const handleSessionExpired = () => {
    setUser(null);
    alert("세션이 만료되었습니다. 다시 로그인해주세요.");
    router.replace("/");
  };

  // 초기 인증 상태 확인 (한 번만 실행)
  useEffect(() => {
    if (!isClient) return;

    const currentUser = checkAuthStatus();
    setUser(currentUser);
    setIsLoading(false);
  }, [isClient]);

  // 주기적 세션 체크 (별도 useEffect)
  useEffect(() => {
    if (!isClient || !user) return;

    // 1분마다 만료 시간 체크
    intervalRef.current = setInterval(() => {
      const currentUser = checkAuthStatus();
      if (!currentUser) {
        // 세션이 만료되었을 때
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        handleSessionExpired();
      }
    }, 60000); // 1분

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isClient, user]); // user가 변경될 때만 재설정

  const login = (userData: User) => {
    console.log("Setting user data:", userData); // 디버깅용
    const loginTime = Date.now();
    const expirationTime = loginTime + 24 * 60 * 60 * 1000;

    const authData: AuthData = {
      user: userData,
      expirationTime,
    };

    localStorage.setItem("authData", JSON.stringify(authData));
    setUser(userData);
    console.log("User state should be updated"); // 디버깅용
  };

  const logout = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("authData");
      setUser(null);
      router.replace("/");
    }
  };

  // 남은 시간 확인 (선택사항 - UI에서 사용 가능)
  const getTimeLeft = (): number => {
    if (typeof window === "undefined") return 0;

    const authDataStr = localStorage.getItem("authData");
    if (!authDataStr) return 0;

    try {
      const authData: AuthData = JSON.parse(authDataStr);
      const now = Date.now();
      return Math.max(0, authData.expirationTime - now);
    } catch {
      return 0;
    }
  };

  return {
    user,
    isLoading: isLoading || !isClient,
    login,
    logout,
    getTimeLeft,
  };
}
