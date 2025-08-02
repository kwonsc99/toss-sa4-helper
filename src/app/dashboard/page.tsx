"use client";

import { useState, useEffect, useMemo } from "react";
import {
  CustomerStatus,
  CustomerFilters,
  Customer,
  CallLog,
  CallLogFormData,
} from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useCustomers } from "@/hooks/useCustomers";
import { useCallLogs } from "@/hooks/useCallLogs";
import { exportCustomersToExcel } from "@/utils/exportExcel";

import Header from "@/components/layout/Header";
import StatusTabs from "@/components/layout/StatusTabs";
import FilterBar from "@/components/common/FilterBar";
import CustomerTable from "@/components/customer/CustomerTable";
import CustomerForm from "@/components/customer/CustomerForm";
import CallLogForm from "@/components/calllog/CallLogForm";
import CallLogHistory from "@/components/calllog/CallLogHistory";
import CallLogEditForm from "@/components/calllog/CallLogEditForm";

export default function Dashboard() {
  // 모든 Hook을 맨 위에 배치 (조건부 실행 없이)
  const { user, logout } = useAuth();
  const {
    customers,
    isLoading,
    loadCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerStatus,
    bulkUpdateStatus,
  } = useCustomers();
  const { callLogs, createCallLog, updateCallLog, loadCallLogs } =
    useCallLogs();

  // 상태 관리
  const [activeStatus, setActiveStatus] = useState<CustomerStatus | "all">(
    "all"
  );
  const [filters, setFilters] = useState<CustomerFilters>({
    sortBy: "latest", // 기본값으로 최신등록순 설정
  });
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  // 모달 상태
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showCallLogForm, setShowCallLogForm] = useState(false);
  const [showCallLogHistory, setShowCallLogHistory] = useState(false);
  const [showCallLogEdit, setShowCallLogEdit] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [editingCallLog, setEditingCallLog] = useState<CallLog | null>(null);

  // 필터 변경 시 고객 데이터 다시 로드
  useEffect(() => {
    if (user) {
      // user가 있을 때만 실행
      loadCustomers({ ...filters, status: activeStatus });
    }
  }, [activeStatus, filters, user]);
  // 필터 적용된 고객 목록 (정렬 포함)
  const filteredCustomers = useMemo(() => {
    let filtered = customers.filter((customer) => {
      if (activeStatus !== "all" && customer.status !== activeStatus)
        return false;
      if (filters.date) {
        const customerDate = new Date(customer.created_at) // updated_at 대신 created_at 사용
          .toISOString()
          .split("T")[0];
        if (customerDate !== filters.date) return false;
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          customer.name.toLowerCase().includes(searchTerm) ||
          customer.company?.toLowerCase().includes(searchTerm)
        );
      }
      return true;
    });

    // 클라이언트 사이드 정렬 (DB에서 이미 정렬되지만 필터링 후 재정렬)
    const sortBy = filters.sortBy || "latest";
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "name_asc":
          return a.name.localeCompare(b.name, "ko");
        case "name_desc":
          return b.name.localeCompare(a.name, "ko");
        case "company_asc":
          return (a.company || "").localeCompare(b.company || "", "ko");
        case "company_desc":
          return (b.company || "").localeCompare(a.company || "", "ko");
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    return filtered;
  }, [customers, activeStatus, filters]);

  const handleCustomerSubmit = async (
    customerData: Partial<Customer>,
    callLogData?: CallLogFormData,
    nextStatus?: CustomerStatus
  ) => {
    try {
      const finalStatus = nextStatus || customerData.status || "입점약속";

      if (selectedCustomer) {
        // 수정
        await updateCustomer(selectedCustomer.id, {
          ...customerData,
          status: finalStatus,
        });
      } else {
        // 새 고객 생성
        const customer = await createCustomer({
          ...customerData,
          status: finalStatus,
        });

        if (callLogData) {
          await createCallLog({ ...callLogData, customer_id: customer.id });
        }
      }

      await loadCustomers({ ...filters, status: activeStatus });
      setShowCustomerForm(false);
      setSelectedCustomer(null);
      alert(
        selectedCustomer
          ? "고객 정보가 수정되었습니다!"
          : "고객이 성공적으로 등록되었습니다!"
      );
    } catch (error) {
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  const handleCallLogSubmit = async (
    callLogData: CallLogFormData,
    nextStatus: CustomerStatus
  ) => {
    try {
      if (selectedCustomer) {
        await createCallLog({
          ...callLogData,
          customer_id: selectedCustomer.id,
        });
        await updateCustomerStatus(selectedCustomer.id, nextStatus);
        await loadCustomers({ ...filters, status: activeStatus });
        setShowCallLogForm(false);
        setSelectedCustomer(null);
        alert("콜로그가 저장되었습니다!");
      }
    } catch (error) {
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const handleCallLogEdit = async (
    callLogId: string,
    updates: Partial<CallLog>
  ) => {
    try {
      await updateCallLog(callLogId, updates);
      if (selectedCustomer) {
        await loadCallLogs(selectedCustomer.id);
      }
      alert("콜로그가 수정되었습니다!");
    } catch (error) {
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteCustomer = async (
    customerId: string,
    customerName: string
  ) => {
    try {
      await deleteCustomer(customerId);
      await loadCustomers({ ...filters, status: activeStatus });
      alert("고객이 삭제되었습니다.");
    } catch (error) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleStatusChange = async (
    customerId: string,
    status: CustomerStatus
  ) => {
    try {
      await updateCustomerStatus(customerId, status);
      await loadCustomers({ ...filters, status: activeStatus });
      alert("상태가 변경되었습니다.");
    } catch (error) {
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  const handleExport = () => {
    exportCustomersToExcel(filteredCustomers, `customers_${activeStatus}`);
  };

  const handleViewHistory = async (customer: Customer) => {
    setSelectedCustomer(customer);
    await loadCallLogs(customer.id);
    setShowCallLogHistory(true);
  };

  // user가 없거나 로딩 중일 때는 로딩 화면 표시 (Hook 순서 변경 없이)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-xl font-semibold text-toss-gray">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={logout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatusTabs
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
        />

        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          onAddCustomer={() => {
            setSelectedCustomer(null);
            setShowCustomerForm(true);
          }}
          onExport={handleExport}
        />

        <CustomerTable
          customers={filteredCustomers}
          isLoading={isLoading}
          selectedCustomers={selectedCustomers}
          onCustomerSelect={setSelectedCustomers}
          onEdit={(customer) => {
            setSelectedCustomer(customer);
            setShowCustomerForm(true);
          }}
          onDelete={handleDeleteCustomer}
          onCallLog={(customer) => {
            setSelectedCustomer(customer);
            setShowCallLogForm(true);
          }}
          onViewHistory={handleViewHistory}
          onStatusChange={handleStatusChange}
        />
      </div>
      {/* 모달들 */}
      <CustomerForm
        isOpen={showCustomerForm}
        customer={selectedCustomer}
        onClose={() => {
          setShowCustomerForm(false);
          setSelectedCustomer(null);
        }}
        onSubmit={handleCustomerSubmit}
      />
      <CallLogForm
        isOpen={showCallLogForm}
        customer={
          selectedCustomer
            ? {
                name: selectedCustomer.name,
                id: selectedCustomer.id,
                company: selectedCustomer.company || undefined, // null을 undefined로 변환
              }
            : null
        }
        onClose={() => {
          setShowCallLogForm(false);
          setSelectedCustomer(null);
        }}
        onSubmit={handleCallLogSubmit}
      />
      <CallLogHistory
        isOpen={showCallLogHistory}
        customer={selectedCustomer}
        callLogs={callLogs}
        onClose={() => {
          setShowCallLogHistory(false);
          setSelectedCustomer(null);
        }}
        onEdit={(callLog) => {
          setEditingCallLog(callLog);
          setShowCallLogEdit(true);
        }}
      />
      <CallLogEditForm
        isOpen={showCallLogEdit}
        callLog={editingCallLog}
        onClose={() => {
          setShowCallLogEdit(false);
          setEditingCallLog(null);
        }}
        onSubmit={handleCallLogEdit}
      />
    </div>
  );
}
