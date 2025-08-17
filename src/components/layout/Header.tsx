"use client";

import { useRouter, usePathname } from "next/navigation";
import { User } from "@/types";
import Button from "../common/Button";

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    {
      name: "대시보드",
      path: "/dashboard",
    },
    {
      name: "후속 연락 템플릿", // 추가
      path: "/templates",
    },
    {
      name: "콘텐츠",
      path: "/contents",
    },
    {
      name: "쿠팡리없셀",
      path: "/easycrawl",
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* 로고 및 브랜드 */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-toss-gray flex items-center">
              <img
                src="/favicon.svg"
                alt="Toss Icon"
                className="w-6 h-6 mr-2"
              />
              SA4 고객 관리 헬퍼
            </h1>

            {/* 심플한 네비게이션 */}
            <nav className="ml-10">
              <div className="flex space-x-8">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`relative py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "text-toss-blue"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {item.name}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-toss-blue rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* 사용자 정보 및 로그아웃 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-toss-blue to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.real_name?.charAt(0) || "U"}
                </span>
              </div>
              <span className="text-sm text-gray-700 font-medium hidden sm:block">
                안녕하세요, {user?.real_name}님
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
