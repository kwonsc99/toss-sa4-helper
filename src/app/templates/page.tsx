"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { FOLLOW_UP_TEMPLATES, getTemplatesByType } from "@/constants/templates";
import Header from "@/components/layout/Header";
import TemplateCard from "@/components/templates/TemplateCard";
import { Filter } from "lucide-react";

export default function TemplatesPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [selectedType, setSelectedType] = useState<
    "all" | "kakao" | "sms" | "email"
  >("all");

  // 인증 확인 및 리다이렉트
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
      return;
    }
  }, [user, isLoading, router]);

  // 로딩 중이거나 사용자가 없으면 로딩 화면
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-xl font-semibold text-toss-gray">
            {isLoading ? "로딩 중..." : "인증 확인 중..."}
          </div>
        </div>
      </div>
    );
  }

  const filteredTemplates = getTemplatesByType(selectedType);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={logout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            후속 연락 템플릿
          </h1>
          <p className="text-gray-600">
            상황별 템플릿을 복사해서 사용하세요.
            <span className="font-medium text-toss-blue">
              {user.real_name ? ` (${user.real_name}님으로 자동 적용됨)` : ""}
            </span>
          </p>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">필터:</span>
            </div>

            <div className="flex space-x-2">
              {[
                {
                  value: "all",
                  label: "전체",
                  count: FOLLOW_UP_TEMPLATES.length,
                },
                {
                  value: "kakao",
                  label: "카카오톡",
                  count: getTemplatesByType("kakao").length,
                },
                {
                  value: "sms",
                  label: "문자",
                  count: getTemplatesByType("sms").length,
                },
                {
                  value: "email",
                  label: "이메일",
                  count: getTemplatesByType("email").length,
                },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedType(filter.value as any)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedType === filter.value
                      ? "bg-toss-blue text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 템플릿 목록 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              user={user} // user 전달
            />
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">해당 타입의 템플릿이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
