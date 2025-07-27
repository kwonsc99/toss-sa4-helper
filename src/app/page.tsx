"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        router.push("/dashboard");
      } else {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  // 로딩 중이면 로딩 화면 표시
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-xl font-semibold text-toss-gray">로딩 중...</div>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single();

      if (error || !data) {
        setError("아이디 또는 비밀번호가 잘못되었습니다.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data));
      router.push("/dashboard");
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-toss-gray mb-2">
            토스 SA4 고객 관리 헬퍼
          </h1>
          <p className="text-gray-600">로그인하여 시작하세요</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-toss-gray mb-2"
            >
              아이디
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-toss-gray mb-2"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-toss-blue text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-toss-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
