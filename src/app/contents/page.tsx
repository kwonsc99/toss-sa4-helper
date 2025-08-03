"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";

// 콘텐츠 타입 정의
interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "link";
  url: string;
  category: string;
  icon: string;
  updatedAt: string;
}

// 카테고리 탭 컴포넌트
const CategoryTabs: React.FC<{
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}> = ({ activeCategory, onCategoryChange }) => {
  const categories = [
    { id: "all", name: "전체", count: 0 },
    { id: "guide", name: "가이드", count: 0 },
    { id: "link", name: "링크", count: 0 },
    { id: "tool", name: "도구", count: 0 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeCategory === category.id
                ? "border-toss-blue text-toss-blue bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

// 공지사항 컴포넌트
const NoticeBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg mb-6">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {/* 공지 아이콘 */}
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                  />
                </svg>
              </div>
            </div>

            {/* 공지 내용 */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  고정
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                토스 퍼블릭 바로가기
              </h3>
              <p className="text-sm text-gray-600">
                <a
                  href="https://tosspublic.notion.site/25-05-185714bbfde78075afb9f8185117a7aa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                >
                  https://tosspublic.notion.site/25-05-185714bbfde78075afb9f8185117a7aa
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 콘텐츠 카드 컴포넌트
const ContentCard: React.FC<{ content: ContentItem }> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(content.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert("링크 복사에 실패했습니다.");
    }
  };

  const handleOpenPdf = () => {
    window.open(content.url, "_blank");
  };

  const getIconComponent = (iconName: string): React.ReactElement => {
    const iconMap: { [key: string]: React.ReactElement } = {
      document: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      link: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      ),
      tool: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    };
    return iconMap[iconName] || iconMap["document"];
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div
              className={`p-3 rounded-lg ${
                content.type === "pdf"
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {getIconComponent(content.icon)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {content.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                {content.description}
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <span>최근 업데이트: {content.updatedAt}</span>
                <span className="mx-2">•</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    content.category === "guide"
                      ? "bg-green-100 text-green-800"
                      : content.category === "link"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {content.category === "guide"
                    ? "가이드"
                    : content.category === "link"
                    ? "링크"
                    : "도구"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            {content.type === "pdf" ? (
              <button
                onClick={handleOpenPdf}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span>PDF 보기</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => window.open(content.url, "_blank")}
                  className="px-4 py-2 bg-toss-blue text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  <span>바로가기</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center space-x-2 ${
                    copied
                      ? "border-green-300 bg-green-50 text-green-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {copied ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>복사됨!</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span>링크 복사</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 검색 바 컴포넌트
const SearchBar: React.FC<{
  searchTerm: string;
  onSearchChange: (term: string) => void;
}> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="콘텐츠를 검색하세요..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-toss-blue focus:border-toss-blue"
        />
      </div>
    </div>
  );
};

const ContentsPage: React.FC = () => {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // 샘플 콘텐츠 데이터
  const contents: ContentItem[] = [
    {
      id: "1",
      title: "개인사업자 입점 가이드",
      description:
        "토스쇼핑 개인사업자 입점을 위한 가이드입니다. 셀러 영업에 활용하세요!",
      type: "pdf",
      url: "/guides/토스페이 신청하기_개인사업자.pdf",
      category: "guide",
      icon: "document",
      updatedAt: "2024.08.03",
    },
    {
      id: "2",
      title: "법인사업자 입점 가이드",
      description:
        "토스쇼핑 법인사업자 입점을 위한 가이드입니다. 셀러 영업에 활용하세요!",
      type: "pdf",
      url: "/guides/토스페이 신청하기_법인.pdf",
      category: "guide",
      icon: "document",
      updatedAt: "2024.08.03",
    },
    {
      id: "3",
      title: "상품등록 가이드",
      description:
        "토스쇼핑 상품등록을 위한 가이드입니다. 셀러 영업에 활용하세요!",
      type: "link",
      url: "https://tosspublic.notion.site/2-0-1e5714bbfde7809ea8f3c4717d1fefc6#1f2714bbfde7808eaff5d8840efed8df",
      category: "link",
      icon: "link",
      updatedAt: "2024.08.03",
    },
    {
      id: "4",
      title: "기획전 참여 안내",
      description: "기획전 참여 페이지입니다. 해당 링크를 셀러에게 공유하세요",
      type: "link",
      url: "https://tosspublic.notion.site/25-08-231714bbfde780bead0ae327ed8444d5",
      category: "link",
      icon: "link",
      updatedAt: "2024.08.03",
    },
    {
      id: "5",
      title: "토스쇼핑 광고 맞춤 컨설팅 신청",
      description:
        "토스쇼핑 광고 맞춤 컨설팅 신청 페이지입니다. 해당 링크를 셀러에게 공유하세요",
      type: "link",
      url: "https://mkt.pay.business.toss.im/tossshopping_ads_consulting",
      category: "link",
      icon: "link",
      updatedAt: "2024.08.03",
    },
  ];

  // 인증 확인
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
      return;
    }
  }, [user, isLoading, router]);

  // 필터링된 콘텐츠
  const filteredContents = contents.filter((content) => {
    const matchesCategory =
      activeCategory === "all" || content.category === activeCategory;
    const matchesSearch =
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-600">
            {isLoading ? "로딩 중..." : "인증 확인 중..."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={logout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">콘텐츠 센터</h1>
          <p className="mt-2 text-gray-600">
            유용한 가이드와 안내사항을 한곳에서 확인하세요
          </p>
        </div>

        {/* 카테고리 탭
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        /> */}
        {/* 공지사항 */}

        <NoticeBar />

        {/* 검색 바 */}
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* 콘텐츠 리스트 */}
        <div className="space-y-4">
          {filteredContents.length > 0 ? (
            filteredContents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                콘텐츠가 없습니다
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                검색 조건을 변경해보세요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentsPage;
