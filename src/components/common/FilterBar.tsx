"use client";

import { useState } from "react";
import { CustomerFilters } from "@/types";
import { SORT_OPTIONS } from "@/constants";
import { Search, Download, Plus, Filter } from "lucide-react";
import Button from "./Button";

interface FilterBarProps {
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
  onAddCustomer: () => void;
  onExport: () => void;
}

export default function FilterBar({
  filters,
  onFiltersChange,
  onAddCustomer,
  onExport,
}: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleDateChange = (date: string) => {
    onFiltersChange({ ...filters, date });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({
      ...filters,
      sortBy: sortBy as CustomerFilters["sortBy"],
    });
  };

  const clearFilters = () => {
    onFiltersChange({ sortBy: "latest" }); // 기본값으로 최신등록순 유지
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* 검색 및 기본 필터 */}
        <div className="flex flex-1 items-center space-x-4">
          {/* 검색창 */}
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="이름, 회사명으로 검색..."
              value={filters.search || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue focus:border-transparent"
            />
          </div>

          {/* 정렬 옵션 */}
          <select
            value={filters.sortBy || "latest"}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue focus:border-transparent bg-white min-w-[140px]"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* 고급 필터 토글 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-gray-600"
          >
            <Filter size={16} className="mr-1" />
            {showAdvanced ? "간단히" : "고급 필터"}
          </Button>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onExport}
            className="flex items-center"
          >
            <Download size={16} className="mr-1" />
            엑셀 다운로드
          </Button>

          <Button onClick={onAddCustomer} className="flex items-center">
            <Plus size={16} className="mr-1" />새 고객 등록
          </Button>
        </div>
      </div>

      {/* 고급 필터 (펼칳/접기) */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            {/* 날짜 필터 */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                등록일:
              </label>
              <input
                type="date"
                value={filters.date || ""}
                onChange={(e) => handleDateChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue"
              />
            </div>

            {/* 필터 초기화 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500"
            >
              필터 초기화
            </Button>

            {/* 현재 필터 상태 표시 */}
            {(filters.search || filters.date) && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>활성 필터:</span>
                {filters.search && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    검색: {filters.search}
                  </span>
                )}
                {filters.date && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                    날짜: {filters.date}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
