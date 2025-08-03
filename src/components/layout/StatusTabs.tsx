"use client";

import { CustomerStatus } from "@/types";
import { STATUS_LIST, STATUS_OPTIONS } from "@/constants";

interface StatusTabsProps {
  activeStatus: CustomerStatus | "all";
  onStatusChange: (status: CustomerStatus | "all") => void;
}

export default function StatusTabs({
  activeStatus,
  onStatusChange,
}: StatusTabsProps) {
  const tabs = [
    { value: "all" as const, label: "전체" },
    ...STATUS_LIST.map((status) => ({
      value: status,
      label: STATUS_OPTIONS[status].label,
    })),
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = activeStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onStatusChange(tab.value)}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-toss-blue text-toss-blue bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
