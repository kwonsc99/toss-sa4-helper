"use client";

import { User } from "@/types";
import Button from "../common/Button";

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-xl font-semibold text-toss-gray flex items-center">
            <img src="/tossicon.svg" alt="Toss Icon" className="w-6 h-6 mr-2" />
            SA4 고객 관리 헬퍼
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              안녕하세요, {user?.real_name}님
            </span>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
