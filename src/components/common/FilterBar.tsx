"use client";

import { Plus, Download } from "lucide-react";
import { CustomerFilters, CustomerStatus } from "@/types";
import { ALL_STATUS_OPTIONS } from "@/constants";
import Button from "./Button";

interface FilterBarProps {
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
  onAddCustomer: () => void;
  onExport?: () => void;
  showAddButton?: boolean;
}

export default function FilterBar({
  filters,
  onFiltersChange,
  onAddCustomer,
  onExport,
  showAddButton = true,
}: FilterBarProps) {
  const updateFilter = (key: keyof CustomerFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const resetFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          {/* 상태 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상태
            </label>
            <select
              value={filters.status || "all"}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue focus:border-transparent"
            >
              {ALL_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 날짜 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              날짜
            </label>
            <input
              type="date"
              value={filters.date || ""}
              onChange={(e) => updateFilter("date", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue focus:border-transparent"
            />
          </div>

          {/* 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              검색
            </label>
            <input
              type="text"
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="이름, 회사명으로 검색..."
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue focus:border-transparent"
            />
          </div>

          {/* 필터 초기화 */}
          <div className="mt-6">
            <Button variant="secondary" onClick={resetFilters}>
              필터 초기화
            </Button>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex gap-3">
          {showAddButton && (
            <Button onClick={onAddCustomer}>
              <Plus size={16} className="mr-2" />
              고객 추가
            </Button>
          )}

          {onExport && (
            <Button variant="secondary" onClick={onExport}>
              <Download size={16} className="mr-2" />
              엑셀 내보내기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
