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
    { value: "all" as const, label: "전체", color: "bg-gray-500" },
    ...STATUS_LIST.map((status) => ({
      value: status,
      label: STATUS_OPTIONS[status].label,
      color: "bg-toss-blue",
    })),
  ];

  return (
    <div className="flex space-x-1 mb-8">
      {tabs.map((tab) => {
        const isActive = activeStatus === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onStatusChange(tab.value)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isActive
                ? `${tab.color} text-white shadow-md`
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
