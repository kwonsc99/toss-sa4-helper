"use client";

import { Customer, CustomerStatus } from "@/types";
import { STATUS_LIST, STATUS_OPTIONS } from "@/constants";
import Button from "../common/Button";

interface CustomerActionsProps {
  customer: Customer;
  onStatusChange: (customerId: string, status: CustomerStatus) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string, customerName: string) => void;
  onCallLog: (customer: Customer) => void;
}

export default function CustomerActions({
  customer,
  onStatusChange,
  onEdit,
  onDelete,
  onCallLog,
}: CustomerActionsProps) {
  const handleDelete = () => {
    if (confirm(`정말로 "${customer.name}" 고객을 삭제하시겠습니까?`)) {
      onDelete(customer.id, customer.name);
    }
  };

  const getNextStatusOptions = (currentStatus: CustomerStatus) => {
    const currentIndex = STATUS_LIST.indexOf(currentStatus);
    return STATUS_LIST.filter((_, index) => index !== currentIndex);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* 주요 액션 */}
      <Button size="sm" onClick={() => onCallLog(customer)}>
        콜로그 작성
      </Button>

      <Button size="sm" variant="secondary" onClick={() => onEdit(customer)}>
        편집
      </Button>

      {/* 상태 변경 드롭다운 */}
      <select
        value=""
        onChange={(e) =>
          e.target.value &&
          onStatusChange(customer.id, e.target.value as CustomerStatus)
        }
        className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-toss-blue"
      >
        <option value="">상태 변경</option>
        {getNextStatusOptions(customer.status).map((status) => (
          <option key={status} value={status}>
            → {STATUS_OPTIONS[status].label}
          </option>
        ))}
      </select>

      <Button size="sm" variant="danger" onClick={handleDelete}>
        삭제
      </Button>
    </div>
  );
}
