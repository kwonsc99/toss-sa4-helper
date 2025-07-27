"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Users,
  Calendar,
  Eye,
  Download,
  Plus,
  X,
  Phone,
  Mail,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import * as XLSX from "xlsx";

// 기존 인터페이스들 뒤에 추가
interface User {
  id: string;
  username: string;
  password: string;
  created_at: string;
}

interface CallLogHistoryItem {
  id: string;
  call_log_id: string;
  original_data: any;
  modified_data: any;
  modified_by: string;
  modified_at: string;
}

interface Customer {
  id: string;
  name: string;
  company: string;
  business_number: string;
  website: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CallLog {
  id: string;
  customer_id: string;
  connection_status: string;
  follow_up_action: string;
  seller_reaction: string;
  call_content: string;
  follow_up_planning: string;
  special_notes: string;
  created_at: string;
  updated_at?: string; // 추가
  customer?: Customer;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<
    "completed" | "today" | "preview" | "semi"
  >("today");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCallHistoryModal, setShowCallHistoryModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [templateType, setTemplateType] = useState<
    "email" | "kakao" | "both" | ""
  >("");
  const [inputText, setInputText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  // 기존 상태 변수들 뒤에 추가
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    company: "",
    business_number: "",
    website: "",
    email: "",
    phone: "",
  });

  // 배치 선택 관련 상태 추가
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // 체크박스 선택/해제
  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  // 전체 선택/해제
  const toggleAllSelection = () => {
    setSelectedCustomers((prev) =>
      prev.length === customers.length ? [] : customers.map((c) => c.id)
    );
  };

  // 선택된 고객들을 Today로 이동 (Preview에서)
  const moveSelectedToToday = async () => {
    if (selectedCustomers.length === 0) {
      alert("이동할 고객을 선택해주세요.");
      return;
    }

    try {
      const { error } = await supabase
        .from("customers")
        .update({ status: "today", updated_at: new Date().toISOString() })
        .in("id", selectedCustomers);

      if (error) throw error;

      setSelectedCustomers([]);
      setIsSelectMode(false);
      loadCustomers();
      alert(`${selectedCustomers.length}명의 고객이 Today로 이동되었습니다!`);
    } catch (error) {
      console.error("Error moving customers:", error);
      alert("이동 중 오류가 발생했습니다.");
    }
  };

  // 전체 Preview를 Today로 이동
  const moveAllPreviewToToday = async () => {
    if (customers.length === 0) {
      alert("이동할 고객이 없습니다.");
      return;
    }

    if (
      !confirm(
        `${customers.length}명의 모든 Preview 고객을 Today로 이동하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("customers")
        .update({ status: "today", updated_at: new Date().toISOString() })
        .eq("status", "preview");

      if (error) throw error;

      loadCustomers();
      alert("모든 Preview 고객이 Today로 이동되었습니다!");
    } catch (error) {
      console.error("Error moving all customers:", error);
      alert("이동 중 오류가 발생했습니다.");
    }
  };

  // Today 작업 종료 - Today의 모든 고객을 Preview로 이동
  const finishTodayWork = async () => {
    if (customers.length === 0) {
      alert("Today에 고객이 없습니다.");
      return;
    }

    if (
      !confirm(
        `${customers.length}명의 모든 Today 고객을 Preview로 이동하시겠습니까?\n(오늘 작업을 종료합니다)`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("customers")
        .update({ status: "preview", updated_at: new Date().toISOString() })
        .eq("status", "today");

      if (error) throw error;

      loadCustomers();
      alert(
        "오늘 작업이 종료되었습니다. 모든 고객이 Preview로 이동되었습니다!"
      );
    } catch (error) {
      console.error("Error finishing today work:", error);
      alert("작업 종료 중 오류가 발생했습니다.");
    }
  };

  // 콜로그 관련 상태
  const [callStep, setCallStep] = useState<
    "connection" | "followup" | "calllog"
  >("connection");
  const [connectionStatus, setConnectionStatus] = useState("");
  const [followUpAction, setFollowUpAction] = useState("");
  const [callLogData, setCallLogData] = useState({
    seller_reaction: "",
    call_content: "",
    follow_up_planning: "",
    special_notes: "",
  });
  const [isSavingCall, setIsSavingCall] = useState(false);

  // 콜로그 편집 관련 상태 추가
  const [showEditCallLogModal, setShowEditCallLogModal] = useState(false);
  const [editingCallLog, setEditingCallLog] = useState<CallLog | null>(null);
  const [editCallLogForm, setEditCallLogForm] = useState({
    connection_status: "",
    follow_up_action: "",
    seller_reaction: "",
    call_content: "",
    follow_up_planning: "",
    special_notes: "",
  });
  const [callLogHistory, setCallLogHistory] = useState<CallLogHistoryItem[]>(
    []
  );
  const [showCallLogHistoryModal, setShowCallLogHistoryModal] = useState(false);

  // Completed 탭 필터링
  const [completedFilter, setCompletedFilter] = useState<
    "all" | "connected" | "not_connected"
  >("all");
  const [selectedDate, setSelectedDate] = useState("");

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
    setUser(JSON.parse(userData));
    loadCustomers();
  }, [activeTab]);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("status", activeTab)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setCustomers((data as Customer[]) || []);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCallLogs = async (customerId?: string) => {
    try {
      let query = supabase
        .from("call_logs")
        .select(
          `
          *,
          customer:customers(*)
        `
        )
        .order("created_at", { ascending: false });

      if (customerId) {
        query = query.eq("customer_id", customerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCallLogs(data || []);
    } catch (error) {
      console.error("Error loading call logs:", error);
    }
  };

  const parseCustomerData = (text: string) => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    const data: Record<string, string> = {}; // ← 이 부분 수정

    const fieldMappings = {
      이름: "name",
      회사: "company",
      사업자번호: "business_number",
      웹사이트: "website",
      이메일: "email",
      전화: "phone",
    };

    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];

      if (fieldMappings[currentLine as keyof typeof fieldMappings]) {
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          if (!Object.keys(fieldMappings).includes(nextLine)) {
            const fieldKey =
              fieldMappings[currentLine as keyof typeof fieldMappings];
            data[fieldKey] = nextLine;
          }
        }
      }
    }

    return data;
  };

  const handleAddCustomer = async () => {
    if (!inputText.trim()) {
      alert("고객 정보를 입력해주세요.");
      return;
    }

    setIsAdding(true);
    try {
      const customerData = parseCustomerData(inputText);

      if (!customerData.name) {
        alert("이름은 필수 입력 항목입니다.");
        return;
      }

      const { error } = await supabase.from("customers").insert([
        {
          ...customerData,
          status: "preview",
        },
      ]);

      if (error) throw error;

      setInputText("");
      setShowAddModal(false);
      loadCustomers();
      alert("고객이 성공적으로 추가되었습니다!");
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("고객 추가 중 오류가 발생했습니다.");
    } finally {
      setIsAdding(false);
    }
  };

  // 고객 상태 변경 함수
  const moveCustomer = async (
    customerId: string,
    newStatus: string,
    statusName: string
  ) => {
    try {
      const { error } = await supabase
        .from("customers")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", customerId);

      if (error) throw error;

      loadCustomers();
      alert(`${statusName}으로 이동되었습니다!`);
    } catch (error) {
      console.error("Error moving customer:", error);
      alert("이동 중 오류가 발생했습니다.");
    }
  };

  // 고객 삭제 함수
  const deleteCustomer = async (customerId: string, customerName: string) => {
    if (!confirm(`정말로 "${customerName}" 고객을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      // 먼저 관련 콜로그 삭제
      const { error: callLogError } = await supabase
        .from("call_logs")
        .delete()
        .eq("customer_id", customerId);

      if (callLogError) throw callLogError;

      // 고객 삭제
      const { error: customerError } = await supabase
        .from("customers")
        .delete()
        .eq("id", customerId);

      if (customerError) throw customerError;

      loadCustomers();
      alert("고객이 삭제되었습니다.");
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 편집 모달 열기
  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditForm({
      name: customer.name || "",
      company: customer.company || "",
      business_number: customer.business_number || "",
      website: customer.website || "",
      email: customer.email || "",
      phone: customer.phone || "",
    });
    setShowEditModal(true);
  };

  // 고객 정보 수정
  const updateCustomer = async () => {
    if (!editForm.name.trim()) {
      alert("이름은 필수 입력 항목입니다.");
      return;
    }

    setIsAdding(true);
    try {
      const { error } = await supabase
        .from("customers")
        .update({
          ...editForm,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingCustomer?.id);

      if (error) throw error;

      setShowEditModal(false);
      loadCustomers();
      alert("고객 정보가 수정되었습니다!");
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setIsAdding(false);
    }
  };

  // 콜로그 편집 모달 열기
  const openEditCallLogModal = (callLog: CallLog) => {
    setEditingCallLog(callLog);
    setEditCallLogForm({
      connection_status: callLog.connection_status,
      follow_up_action: callLog.follow_up_action,
      seller_reaction: callLog.seller_reaction,
      call_content: callLog.call_content,
      follow_up_planning: callLog.follow_up_planning,
      special_notes: callLog.special_notes,
    });
    setShowEditCallLogModal(true);
  };

  // 콜로그 수정
  const updateCallLog = async () => {
    if (
      !editCallLogForm.seller_reaction ||
      !editCallLogForm.call_content ||
      !editCallLogForm.follow_up_planning
    ) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    setIsSavingCall(true);
    try {
      // 기존 데이터를 히스토리에 저장
      const { error: historyError } = await supabase
        .from("call_log_history")
        .insert([
          {
            call_log_id: editingCallLog?.id,
            original_data: {
              connection_status: editingCallLog?.connection_status,
              follow_up_action: editingCallLog?.follow_up_action,
              seller_reaction: editingCallLog?.seller_reaction,
              call_content: editingCallLog?.call_content,
              follow_up_planning: editingCallLog?.follow_up_planning,
              special_notes: editingCallLog?.special_notes,
            },
            modified_data: editCallLogForm,
            modified_by: user?.username,
          },
        ]);

      if (historyError) throw historyError;

      // 콜로그 업데이트
      const { error: updateError } = await supabase
        .from("call_logs")
        .update(editCallLogForm)
        .eq("id", editingCallLog?.id);

      if (updateError) throw updateError;

      setShowEditCallLogModal(false);
      loadCallLogs(selectedCustomer?.id);
      alert("콜로그가 수정되었습니다!");
    } catch (error) {
      console.error("Error updating call log:", error);
      alert("콜로그 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSavingCall(false);
    }
  };

  // 콜로그 히스토리 로드
  const loadCallLogHistory = async (callLogId: string) => {
    try {
      const { data, error } = await supabase
        .from("call_log_history")
        .select("*")
        .eq("call_log_id", callLogId)
        .order("modified_at", { ascending: false });

      if (error) throw error;
      setCallLogHistory(data || []);
    } catch (error) {
      console.error("Error loading call log history:", error);
    }
  };

  // 콜로그 히스토리 보기
  const openCallLogHistoryModal = (callLog: CallLog) => {
    setEditingCallLog(callLog);
    loadCallLogHistory(callLog.id);
    setShowCallLogHistoryModal(true);
  };

  // 콜로그 모달 열기
  const openCallModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCallModal(true);
    setCallStep("connection");
    setConnectionStatus("");
    setFollowUpAction("");
    setCallLogData({
      seller_reaction: "",
      call_content: "",
      follow_up_planning: "",
      special_notes: "",
    });
  };

  // 연결 상태 선택 후 다음 단계
  const handleConnectionNext = () => {
    if (!connectionStatus) {
      alert("통화 연결 여부를 선택해주세요.");
      return;
    }

    if (connectionStatus === "연결") {
      setCallStep("calllog");
    } else {
      setCallStep("followup");
    }
  };

  // 후속 행동 선택 후 콜로그 작성
  const handleFollowUpNext = () => {
    if (!followUpAction) {
      alert("후속 행동을 선택해주세요.");
      return;
    }

    // 템플릿 모달 표시
    if (followUpAction === "이메일로_컨택_유도") {
      setTemplateType("email");
      setShowTemplateModal(true);
    } else if (followUpAction === "카톡_및_문자로_컨택_유도") {
      setTemplateType("kakao");
      setShowTemplateModal(true);
    } else if (followUpAction === "이메일+카톡/문자로_컨택_유도") {
      setTemplateType("both");
      setShowTemplateModal(true);
    }

    // 부재중/즉시 끊음인 경우 기본값 설정
    setCallLogData({
      seller_reaction: "부정",
      call_content:
        connectionStatus === "부재중" ? "부재중" : "연결 후 즉시 끊음",
      follow_up_planning:
        followUpAction === "조치안함"
          ? "조치안함"
          : followUpAction === "이메일로_컨택_유도"
          ? "이메일로 컨택 유도"
          : followUpAction === "카톡_및_문자로_컨택_유도"
          ? "카톡 및 문자로 컨택 유도"
          : "이메일+카톡/문자로 컨택 유도",
      special_notes: "",
    });

    setCallStep("calllog");
  };

  // 콜로그 저장
  const saveCallLog = async () => {
    if (
      !callLogData.seller_reaction ||
      !callLogData.call_content ||
      !callLogData.follow_up_planning
    ) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    setIsSavingCall(true);
    try {
      // 콜로그 저장
      const { error: callLogError } = await supabase.from("call_logs").insert([
        {
          customer_id: selectedCustomer?.id,
          connection_status: connectionStatus,
          follow_up_action: followUpAction,
          seller_reaction: callLogData.seller_reaction,
          call_content: callLogData.call_content,
          follow_up_planning: callLogData.follow_up_planning,
          special_notes: callLogData.special_notes,
        },
      ]);

      if (callLogError) throw callLogError;

      // 고객을 completed로 이동
      const { error: updateError } = await supabase
        .from("customers")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", selectedCustomer?.id);

      if (updateError) throw updateError;

      setShowCallModal(false);
      loadCustomers();
      alert("콜로그가 저장되고 Completed로 이동되었습니다!");
    } catch (error) {
      console.error("Error saving call log:", error);
      alert("콜로그 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSavingCall(false);
    }
  };

  // 엑셀 내보내기
  const exportToExcel = () => {
    const exportData = customers.map((customer) => ({
      이름: customer.name,
      회사: customer.company || "",
      사업자번호: customer.business_number || "",
      웹사이트: customer.website || "",
      이메일: customer.email || "",
      전화: customer.phone || "",
      상태: activeTab,
      생성일: new Date(customer.created_at).toLocaleDateString("ko-KR"),
      수정일: new Date(customer.updated_at).toLocaleDateString("ko-KR"),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${activeTab}_customers`);
    XLSX.writeFile(
      wb,
      `${activeTab}_customers_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // 콜로그 히스토리 보기
  const openCallHistory = (customer: Customer) => {
    setSelectedCustomer(customer);
    loadCallLogs(customer.id);
    setShowCallHistoryModal(true);
  };

  // 필터링된 완료 고객 목록
  const getFilteredCompletedCustomers = () => {
    if (activeTab !== "completed") return customers;

    let filtered = customers;

    // 날짜 필터
    if (selectedDate) {
      filtered = filtered.filter((customer) => {
        const customerDate = new Date(customer.updated_at)
          .toISOString()
          .split("T")[0];
        return customerDate === selectedDate;
      });
    }

    // 연결 상태 필터 (콜로그 기준)
    if (completedFilter !== "all") {
      // 이 부분은 실제로는 콜로그와 조인해서 가져와야 하지만
      // 간단하게 customer 이름으로 구분
      // 실제로는 call_logs 테이블과 조인 쿼리 필요
    }

    return filtered;
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const tabConfig = {
    completed: { label: "Completed", icon: Users, color: "bg-green-500" },
    today: { label: "Today", icon: Calendar, color: "bg-toss-blue" },
    preview: { label: "Preview", icon: Eye, color: "bg-gray-500" },
    semi: { label: "세미입점", icon: ArrowRight, color: "bg-purple-500" },
  };

  // 이메일 템플릿
  const emailTemplate = `안녕하세요, ${selectedCustomer?.name}님

토스페이먼츠입니다.

오늘 연락드렸으나 통화가 어려워 이메일로 연락드립니다.

토스페이먼츠의 간편결제 솔루션에 대해 상담받고 싶으시면 
편하신 시간에 회신 부탁드립니다.

감사합니다.`;

  // 카카오톡/문자 템플릿
  const kakaoTemplate = `[토스페이먼츠] ${selectedCustomer?.name}님 안녕하세요. 오늘 연락드렸으나 통화 어려워 문자드립니다. 토스페이먼츠 간편결제 상담 원하시면 회신 부탁드립니다. 감사합니다.`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-toss-gray">
              토스 SA4 고객 관리 헬퍼
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                안녕하세요, {user?.username}님
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 mb-8">
          {Object.entries(tabConfig).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() =>
                  setActiveTab(
                    key as "completed" | "today" | "preview" | "semi"
                  )
                }
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  isActive
                    ? `${config.color} text-white shadow-md`
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={20} />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Completed 탭 필터 */}
        {activeTab === "completed" && (
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  날짜 필터
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  연결 상태
                </label>
                <select
                  value={completedFilter}
                  onChange={(e) =>
                    setCompletedFilter(
                      e.target.value as "all" | "connected" | "not_connected"
                    )
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue"
                >
                  <option value="all">전체</option>
                  <option value="connected">연결됨</option>
                  <option value="not_connected">연결 안됨</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setSelectedDate("");
                  setCompletedFilter("all");
                }}
                className="mt-6 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                필터 초기화
              </button>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-toss-gray">
            {tabConfig[activeTab].label} 고객 목록
          </h2>
          <div className="flex space-x-3">
            {/* Preview 탭 전용 버튼들 */}
            {activeTab === "preview" && (
              <>
                <button
                  onClick={() => setIsSelectMode(!isSelectMode)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isSelectMode
                      ? "bg-gray-600 text-white hover:bg-gray-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {isSelectMode ? "선택 취소" : "선택 모드"}
                </button>

                {isSelectMode && (
                  <>
                    <button
                      onClick={toggleAllSelection}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                    >
                      {selectedCustomers.length === customers.length
                        ? "전체 해제"
                        : "전체 선택"}
                    </button>
                    <button
                      onClick={moveSelectedToToday}
                      disabled={selectedCustomers.length === 0}
                      className="px-4 py-2 bg-toss-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      선택한 {selectedCustomers.length}개 Today로
                    </button>
                  </>
                )}

                <button
                  onClick={moveAllPreviewToToday}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  전체 Today로 이동
                </button>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={16} />
                  <span>고객 추가</span>
                </button>
              </>
            )}

            {/* Today 탭 전용 버튼 */}
            {activeTab === "today" && (
              <button
                onClick={finishTodayWork}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                오늘은 여기까지
              </button>
            )}

            <button
              onClick={exportToExcel}
              className="flex items-center space-x-2 px-4 py-2 bg-toss-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              <span>엑셀 내보내기</span>
            </button>
          </div>
        </div>

        {/* 고객 목록 */}
        <div className="bg-white rounded-lg shadow-sm border">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">로딩 중...</div>
          ) : getFilteredCompletedCustomers().length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {activeTab === "preview"
                ? "새로운 고객을 추가해보세요."
                : "해당하는 고객이 없습니다."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {/* Preview에서 선택 모드일 때만 체크박스 컬럼 표시 */}
                    {activeTab === "preview" && isSelectMode && (
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedCustomers.length === customers.length &&
                            customers.length > 0
                          }
                          onChange={toggleAllSelection}
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
                    {activeTab === "completed" && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        완료일
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredCompletedCustomers().map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      {/* Preview에서 선택 모드일 때만 체크박스 */}
                      {activeTab === "preview" && isSelectMode && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedCustomers.includes(customer.id)}
                            onChange={() =>
                              toggleCustomerSelection(customer.id)
                            }
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
                      {activeTab === "completed" && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(customer.updated_at).toLocaleDateString(
                            "ko-KR"
                          )}
                        </td>
                      )}

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap gap-2 items-center">
                          {/* 대표 버튼들 */}
                          {activeTab === "preview" && (
                            <button
                              onClick={() =>
                                moveCustomer(customer.id, "today", "Today")
                              }
                              className="px-3 py-1.5 bg-toss-blue text-white rounded-md hover:bg-blue-700 font-medium"
                            >
                              Today로 이동
                            </button>
                          )}

                          {activeTab === "today" && (
                            <>
                              <button
                                onClick={() => openCallModal(customer)}
                                className="px-3 py-1.5 bg-toss-blue text-white rounded-md hover:bg-blue-700 font-medium flex items-center space-x-1"
                              >
                                <Phone size={14} />
                                <span>통화 기록</span>
                              </button>
                              <button
                                onClick={() =>
                                  moveCustomer(
                                    customer.id,
                                    "completed",
                                    "Completed"
                                  )
                                }
                                className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                              >
                                완료처리
                              </button>
                            </>
                          )}

                          {activeTab === "completed" && (
                            <button
                              onClick={() =>
                                moveCustomer(customer.id, "semi", "세미입점")
                              }
                              className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium"
                            >
                              세미입점으로
                            </button>
                          )}

                          {/* 기타 액션 버튼들 - 작은 크기 */}
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEditModal(customer)}
                              className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded hover:bg-blue-50"
                            >
                              편집
                            </button>

                            <button
                              onClick={() =>
                                deleteCustomer(customer.id, customer.name)
                              }
                              className="px-2 py-1 text-xs text-red-600 hover:text-red-800 border border-red-200 rounded hover:bg-red-50"
                            >
                              삭제
                            </button>

                            {/* 다른 상태로 이동 버튼들 */}
                            {activeTab !== "preview" && (
                              <button
                                onClick={() =>
                                  moveCustomer(
                                    customer.id,
                                    "preview",
                                    "Preview"
                                  )
                                }
                                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50"
                              >
                                →Preview
                              </button>
                            )}

                            {activeTab !== "today" &&
                              activeTab !== "preview" && (
                                <button
                                  onClick={() =>
                                    moveCustomer(customer.id, "today", "Today")
                                  }
                                  className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded hover:bg-blue-50"
                                >
                                  →Today
                                </button>
                              )}

                            {activeTab !== "completed" &&
                              activeTab !== "today" && (
                                <button
                                  onClick={() =>
                                    moveCustomer(
                                      customer.id,
                                      "completed",
                                      "Completed"
                                    )
                                  }
                                  className="px-2 py-1 text-xs text-green-600 hover:text-green-800 border border-green-200 rounded hover:bg-green-50"
                                >
                                  →Completed
                                </button>
                              )}

                            {/* Completed 전용 */}
                            {activeTab === "completed" && (
                              <button
                                onClick={() => openCallHistory(customer)}
                                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50"
                              >
                                콜로그
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 고객 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-toss-gray">
                새 고객 추가
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-toss-gray mb-2">
                  고객 정보 입력
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="고객 정보 전체를 여기에 붙여넣어주세요..."
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue focus:border-transparent resize-none"
                />

                {inputText && (
                  <div className="mt-3 p-3 bg-blue-50 rounded border">
                    <div className="text-sm font-medium text-toss-blue mb-2">
                      추출될 정보 미리보기:
                    </div>
                    <div className="text-sm text-gray-700">
                      {(() => {
                        const parsed = parseCustomerData(inputText);
                        return Object.keys(parsed).length > 0 ? (
                          <div className="space-y-1">
                            {parsed.name && <div>• 이름: {parsed.name}</div>}
                            {parsed.company && (
                              <div>• 회사: {parsed.company}</div>
                            )}
                            {parsed.business_number && (
                              <div>• 사업자번호: {parsed.business_number}</div>
                            )}
                            {parsed.website && (
                              <div>• 웹사이트: {parsed.website}</div>
                            )}
                            {parsed.email && (
                              <div>• 이메일: {parsed.email}</div>
                            )}
                            {parsed.phone && <div>• 전화: {parsed.phone}</div>}
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            인식된 정보가 없습니다.
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleAddCustomer}
                  disabled={isAdding}
                  className="px-4 py-2 bg-toss-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isAdding ? "추가 중..." : "고객 추가"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 콜로그 모달 */}
      {showCallModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-toss-gray">
                {selectedCustomer.name} - 통화 기록
              </h3>
              <button
                onClick={() => setShowCallModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* 단계별 진행 */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      callStep === "connection"
                        ? "bg-toss-blue text-white"
                        : ["followup", "calllog"].includes(callStep)
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    1
                  </div>
                  <div
                    className={`h-0.5 w-12 ${
                      ["followup", "calllog"].includes(callStep)
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                  {connectionStatus !== "연결" && (
                    <>
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                          callStep === "followup"
                            ? "bg-toss-blue text-white"
                            : callStep === "calllog"
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        2
                      </div>
                      <div
                        className={`h-0.5 w-12 ${
                          callStep === "calllog"
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                    </>
                  )}
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      callStep === "calllog"
                        ? "bg-toss-blue text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {connectionStatus === "연결" ? "2" : "3"}
                  </div>
                </div>
              </div>

              {/* 1단계: 통화 연결 여부 */}
              {callStep === "connection" && (
                <div className="space-y-4">
                  <h4 className="font-medium text-toss-gray">
                    통화 연결 여부를 선택해주세요
                  </h4>
                  <div className="space-y-3">
                    {["부재중", "연결", "연결 후 즉시 끊음"].map((status) => (
                      <label
                        key={status}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="connection"
                          value={status}
                          checked={connectionStatus === status}
                          onChange={(e) => setConnectionStatus(e.target.value)}
                          className="w-4 h-4 text-toss-blue focus:ring-toss-blue"
                        />
                        <span className="text-gray-700">{status}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleConnectionNext}
                      className="px-6 py-2 bg-toss-blue text-white rounded-lg hover:bg-blue-700"
                    >
                      다음
                    </button>
                  </div>
                </div>
              )}

              {/* 2단계: 후속 행동 */}
              {callStep === "followup" && (
                <div className="space-y-4">
                  <h4 className="font-medium text-toss-gray">
                    후속 행동을 선택해주세요
                  </h4>
                  <div className="space-y-3">
                    {[
                      "조치안함",
                      "이메일로 컨택 유도",
                      "카톡 및 문자로 컨택 유도",
                      "이메일+카톡/문자로 컨택 유도",
                    ].map((action) => (
                      <label
                        key={action}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="followup"
                          value={action.replace(/\s/g, "_")}
                          checked={
                            followUpAction === action.replace(/\s/g, "_")
                          }
                          onChange={(e) => setFollowUpAction(e.target.value)}
                          className="w-4 h-4 text-toss-blue focus:ring-toss-blue"
                        />
                        <span className="text-gray-700">{action}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <button
                      onClick={() => setCallStep("connection")}
                      className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      이전
                    </button>
                    <button
                      onClick={handleFollowUpNext}
                      className="px-6 py-2 bg-toss-blue text-white rounded-lg hover:bg-blue-700"
                    >
                      다음
                    </button>
                  </div>
                </div>
              )}

              {/* 3단계: 콜로그 작성 */}
              {callStep === "calllog" && (
                <div className="space-y-4">
                  <h4 className="font-medium text-toss-gray">
                    콜로그를 작성해주세요
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      셀러 반응 *
                    </label>
                    <div className="flex space-x-4">
                      {["긍정", "부정"].map((reaction) => (
                        <label
                          key={reaction}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="reaction"
                            value={reaction}
                            checked={callLogData.seller_reaction === reaction}
                            onChange={(e) =>
                              setCallLogData({
                                ...callLogData,
                                seller_reaction: e.target.value,
                              })
                            }
                            className="w-4 h-4 text-toss-blue focus:ring-toss-blue"
                          />
                          <span className="text-gray-700">{reaction}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      주요 콜 내용 *
                    </label>
                    <textarea
                      value={callLogData.call_content}
                      onChange={(e) =>
                        setCallLogData({
                          ...callLogData,
                          call_content: e.target.value,
                        })
                      }
                      className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue focus:border-transparent resize-none"
                      placeholder="통화 내용을 입력해주세요..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      후속 컨택 플래닝 *
                    </label>
                    <textarea
                      value={callLogData.follow_up_planning}
                      onChange={(e) =>
                        setCallLogData({
                          ...callLogData,
                          follow_up_planning: e.target.value,
                        })
                      }
                      className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue focus:border-transparent resize-none"
                      placeholder="후속 계획을 입력해주세요..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      특이사항
                    </label>
                    <textarea
                      value={callLogData.special_notes}
                      onChange={(e) =>
                        setCallLogData({
                          ...callLogData,
                          special_notes: e.target.value,
                        })
                      }
                      className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue focus:border-transparent resize-none"
                      placeholder="특이사항이 있으면 입력해주세요..."
                    />
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() =>
                        setCallStep(
                          connectionStatus === "연결"
                            ? "connection"
                            : "followup"
                        )
                      }
                      className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      이전
                    </button>
                    <button
                      onClick={saveCallLog}
                      disabled={isSavingCall}
                      className="px-6 py-2 bg-toss-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSavingCall ? "저장 중..." : "콜로그 저장"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 템플릿 모달 */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-toss-gray">
                {templateType === "email" ? "이메일" : "카카오톡/문자"} 템플릿
              </h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {templateType === "email" ? "이메일" : "카카오톡/문자"} 내용
                </label>
                <div className="bg-gray-50 p-4 rounded border">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {templateType === "email" ? emailTemplate : kakaoTemplate}
                  </pre>
                </div>
              </div>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      templateType === "email" ? emailTemplate : kakaoTemplate
                    );
                    alert("템플릿이 클립보드에 복사되었습니다!");
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-toss-blue text-white rounded-lg hover:bg-blue-700"
                >
                  {templateType === "email" ? (
                    <Mail size={16} />
                  ) : (
                    <MessageSquare size={16} />
                  )}
                  <span>클립보드에 복사</span>
                </button>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 콜로그 히스토리 모달 */}
      {showCallHistoryModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-toss-gray">
                {selectedCustomer.name} - 콜로그 히스토리
              </h3>
              <button
                onClick={() => setShowCallHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {callLogs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  콜로그가 없습니다.
                </div>
              ) : (
                <div className="space-y-4">
                  {callLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              log.connection_status === "연결"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {log.connection_status}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              log.seller_reaction === "긍정"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {log.seller_reaction}
                          </span>
                          {log.updated_at &&
                            log.updated_at !== log.created_at && (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                수정됨
                              </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setShowCallHistoryModal(false);
                              openEditCallLogModal(log);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => openCallLogHistoryModal(log)}
                            className="text-gray-600 hover:text-gray-800 text-xs"
                          >
                            히스토리
                          </button>
                          <span className="text-sm text-gray-500">
                            {new Date(log.created_at).toLocaleString("ko-KR")}
                            {log.updated_at &&
                              log.updated_at !== log.created_at && (
                                <span className="block text-xs text-yellow-600">
                                  수정:{" "}
                                  {new Date(log.updated_at).toLocaleString(
                                    "ko-KR"
                                  )}
                                </span>
                              )}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-700 mb-1">
                            주요 콜 내용
                          </div>
                          <div className="text-gray-600">
                            {log.call_content}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700 mb-1">
                            후속 컨택 플래닝
                          </div>
                          <div className="text-gray-600">
                            {log.follow_up_planning}
                          </div>
                        </div>
                        {log.special_notes && (
                          <div className="md:col-span-2">
                            <div className="font-medium text-gray-700 mb-1">
                              특이사항
                            </div>
                            <div className="text-gray-600">
                              {log.special_notes}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* 고객 편집 모달 */}
      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-toss-gray">
                고객 정보 수정
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 *
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    회사
                  </label>
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={(e) =>
                      setEditForm({ ...editForm, company: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사업자번호
                  </label>
                  <input
                    type="text"
                    value={editForm.business_number}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        business_number: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    웹사이트
                  </label>
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={(e) =>
                      setEditForm({ ...editForm, website: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={updateCustomer}
                  disabled={isAdding}
                  className="px-4 py-2 bg-toss-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isAdding ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 콜로그 편집 모달 */}
      {showEditCallLogModal && editingCallLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-toss-gray">
                콜로그 수정
              </h3>
              <button
                onClick={() => setShowEditCallLogModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  통화 연결 여부
                </label>
                <select
                  value={editCallLogForm.connection_status}
                  onChange={(e) =>
                    setEditCallLogForm({
                      ...editCallLogForm,
                      connection_status: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue"
                >
                  <option value="부재중">부재중</option>
                  <option value="연결">연결</option>
                  <option value="연결 후 즉시 끊음">연결 후 즉시 끊음</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  후속 행동
                </label>
                <select
                  value={editCallLogForm.follow_up_action}
                  onChange={(e) =>
                    setEditCallLogForm({
                      ...editCallLogForm,
                      follow_up_action: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue"
                >
                  <option value="조치안함">조치안함</option>
                  <option value="이메일로_컨택_유도">이메일로 컨택 유도</option>
                  <option value="카톡_및_문자로_컨택_유도">
                    카톡 및 문자로 컨택 유도
                  </option>
                  <option value="이메일+카톡/문자로_컨택_유도">
                    이메일+카톡/문자로 컨택 유도
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  셀러 반응 *
                </label>
                <div className="flex space-x-4">
                  {["긍정", "부정"].map((reaction) => (
                    <label
                      key={reaction}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="edit_reaction"
                        value={reaction}
                        checked={editCallLogForm.seller_reaction === reaction}
                        onChange={(e) =>
                          setEditCallLogForm({
                            ...editCallLogForm,
                            seller_reaction: e.target.value,
                          })
                        }
                        className="w-4 h-4 text-toss-blue focus:ring-toss-blue"
                      />
                      <span className="text-gray-700">{reaction}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주요 콜 내용 *
                </label>
                <textarea
                  value={editCallLogForm.call_content}
                  onChange={(e) =>
                    setEditCallLogForm({
                      ...editCallLogForm,
                      call_content: e.target.value,
                    })
                  }
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue resize-none"
                  placeholder="통화 내용을 입력해주세요..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  후속 컨택 플래닝 *
                </label>
                <textarea
                  value={editCallLogForm.follow_up_planning}
                  onChange={(e) =>
                    setEditCallLogForm({
                      ...editCallLogForm,
                      follow_up_planning: e.target.value,
                    })
                  }
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue resize-none"
                  placeholder="후속 계획을 입력해주세요..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  특이사항
                </label>
                <textarea
                  value={editCallLogForm.special_notes}
                  onChange={(e) =>
                    setEditCallLogForm({
                      ...editCallLogForm,
                      special_notes: e.target.value,
                    })
                  }
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue resize-none"
                  placeholder="특이사항이 있으면 입력해주세요..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditCallLogModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={updateCallLog}
                  disabled={isSavingCall}
                  className="px-4 py-2 bg-toss-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSavingCall ? "저장 중..." : "수정 완료"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 콜로그 수정 히스토리 모달 */}
      {showCallLogHistoryModal && editingCallLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-toss-gray">
                콜로그 수정 히스토리
              </h3>
              <button
                onClick={() => setShowCallLogHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">현재 버전</h4>
                <div className="text-sm text-blue-700">
                  <div>연결상태: {editingCallLog.connection_status}</div>
                  <div>셀러반응: {editingCallLog.seller_reaction}</div>
                  <div>콜내용: {editingCallLog.call_content}</div>
                </div>
              </div>

              {callLogHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  수정 히스토리가 없습니다.
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">수정 히스토리</h4>
                  {callLogHistory.map((history, index) => (
                    <div
                      key={history.id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          수정 #{callLogHistory.length - index}
                        </span>
                        <div className="text-sm text-gray-500">
                          {history.modified_by} •{" "}
                          {new Date(history.modified_at).toLocaleString(
                            "ko-KR"
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-red-700 mb-2">
                            수정 전
                          </div>
                          <div className="space-y-1 text-red-600">
                            <div>
                              연결상태:{" "}
                              {history.original_data.connection_status}
                            </div>
                            <div>
                              셀러반응: {history.original_data.seller_reaction}
                            </div>
                            <div>
                              콜내용: {history.original_data.call_content}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-green-700 mb-2">
                            수정 후
                          </div>
                          <div className="space-y-1 text-green-600">
                            <div>
                              연결상태:{" "}
                              {history.modified_data.connection_status}
                            </div>
                            <div>
                              셀러반응: {history.modified_data.seller_reaction}
                            </div>
                            <div>
                              콜내용: {history.modified_data.call_content}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
