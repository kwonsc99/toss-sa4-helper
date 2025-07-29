"use client";

import { useState } from "react";
import { Customer, CustomerStatus } from "@/types";
import { STATUS_OPTIONS } from "@/constants";
import { Edit, Trash2, Phone, History, ArrowRight } from "lucide-react";
import Button from "../common/Button";

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  selectedCustomers: string[];
  onCustomerSelect: (customerIds: string[]) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string, customerName: string) => void;
  onCallLog: (customer: Customer) => void;
  onViewHistory: (customer: Customer) => void;
  onStatusChange?: (customerId: string, status: CustomerStatus) => void;
}

export default function CustomerTable({
  customers,
  isLoading,
  selectedCustomers,
  onCustomerSelect,
  onEdit,
  onDelete,
  onCallLog,
  onViewHistory,
  onStatusChange,
}: CustomerTableProps) {
  const [isSelectMode, setIsSelectMode] = useState(false);

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      onCustomerSelect([]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      onCustomerSelect([]);
    } else {
      onCustomerSelect(customers.map((c) => c.id));
    }
  };

  const toggleSelectCustomer = (customerId: string) => {
    if (selectedCustomers.includes(customerId)) {
      onCustomerSelect(selectedCustomers.filter((id) => id !== customerId));
    } else {
      onCustomerSelect([...selectedCustomers, customerId]);
    }
  };

  const handleDelete = (customer: Customer) => {
    if (confirm(`정말로 "${customer.name}" 고객을 삭제하시겠습니까?`)) {
      onDelete(customer.id, customer.name);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-gray-500">고객이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* 테이블 헤더 액션 */}
      <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant={isSelectMode ? "primary" : "secondary"}
            size="sm"
            onClick={toggleSelectMode}
          >
            {isSelectMode ? "선택 취소" : "선택 모드"}
          </Button>

          {isSelectMode && (
            <>
              <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
                {selectedCustomers.length === customers.length
                  ? "전체 해제"
                  : "전체 선택"}
              </Button>

              {selectedCustomers.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedCustomers.length}개 선택됨
                </span>
              )}
            </>
          )}
        </div>

        <div className="text-sm text-gray-600">총 {customers.length}명</div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {isSelectMode && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedCustomers.length === customers.length &&
                      customers.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-toss-blue focus:ring-toss-blue rounded"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                회사
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                연락처
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이메일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                수정일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                {isSelectMode && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => toggleSelectCustomer(customer.id)}
                      className="w-4 h-4 text-toss-blue focus:ring-toss-blue rounded"
                    />
                  </td>
                )}

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {customer.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.company || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.phone || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.email || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      STATUS_OPTIONS[customer.status].bgColor
                    } ${STATUS_OPTIONS[customer.status].color}`}
                  >
                    {STATUS_OPTIONS[customer.status].label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(customer.updated_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEdit(customer)}
                      className="text-blue-600 hover:text-blue-800"
                      title="편집"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={() => onCallLog(customer)}
                      className="text-green-600 hover:text-green-800"
                      title="콜로그 작성"
                    >
                      <Phone size={16} />
                    </button>

                    <button
                      onClick={() => onViewHistory(customer)}
                      className="text-gray-600 hover:text-gray-800"
                      title="콜로그 히스토리"
                    >
                      <History size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(customer)}
                      className="text-red-600 hover:text-red-800"
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
