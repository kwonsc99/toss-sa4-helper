"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // 클라이언트 사이드에서만 실행되도록 보장
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkAuth = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && parsedUser.id && parsedUser.username) {
            setUser(parsedUser);
          } else {
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        localStorage.removeItem("user");
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [isClient]);

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      setUser(null);
      router.replace("/");
    }
  };

  return {
    user,
    isLoading: isLoading || !isClient,
    logout,
  };
}
