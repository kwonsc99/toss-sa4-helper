"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Users, Calendar, Eye, Download, Plus, X, Phone } from "lucide-react";

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
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"completed" | "today" | "preview">(
    "today"
  );
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [inputText, setInputText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

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
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const parseCustomerData = (text: string) => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    const data: any = {};

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

  const moveToToday = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from("customers")
        .update({ status: "today" })
        .eq("id", customerId);

      if (error) throw error;

      loadCustomers();
      alert("Today로 이동되었습니다!");
    } catch (error) {
      console.error("Error moving customer:", error);
      alert("이동 중 오류가 발생했습니다.");
    }
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
      // 연결된 경우 바로 콜로그 작성으로
      setCallStep("calllog");
    } else {
      // 부재중이나 즉시 끊음인 경우 후속 행동 선택으로
      setCallStep("followup");
    }
  };

  // 후속 행동 선택 후 콜로그 작성
  const handleFollowUpNext = () => {
    if (!followUpAction) {
      alert("후속 행동을 선택해주세요.");
      return;
    }

    // 부재중/즉시 끊음인 경우 기본값 설정
    setCallLogData({
      seller_reaction: "부정",
      call_content:
        connectionStatus === "부재중" ? "부재중" : "연결 후 즉시 끊음",
      follow_up_planning:
        followUpAction === "조치안함"
          ? "조치안함"
          : followUpAction === "이메일_컨택_유도"
          ? "이메일로 컨택 유도"
          : "카톡 및 문자로 컨택 유도",
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

      // 고객을 completed로 이동 (필요시)
      // 일단은 today에 그대로 두고, 나중에 completed 이동 로직 추가 가능

      setShowCallModal(false);
      alert("콜로그가 성공적으로 저장되었습니다!");
    } catch (error) {
      console.error("Error saving call log:", error);
      alert("콜로그 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSavingCall(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const exportToExcel = () => {
    alert("엑셀 내보내기 기능을 구현 예정입니다.");
  };

  const tabConfig = {
    completed: { label: "Completed", icon: Users, color: "bg-green-500" },
    today: { label: "Today", icon: Calendar, color: "bg-toss-blue" },
    preview: { label: "Preview", icon: Eye, color: "bg-gray-500" },
  };

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
                onClick={() => setActiveTab(key as any)}
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

        {/* 액션 버튼 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-toss-gray">
            {tabConfig[activeTab].label} 고객 목록
          </h2>
          <div className="flex space-x-3">
            {activeTab === "preview" && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={16} />
                <span>고객 추가</span>
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
          ) : customers.length === 0 ? (
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      회사
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사업자번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      연락처
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      웹사이트
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.company || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.business_number || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.phone || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.email || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.website ? (
                          <a
                            href={customer.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-toss-blue hover:underline"
                          >
                            링크
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {activeTab === "today" && (
                          <button
                            onClick={() => openCallModal(customer)}
                            className="flex items-center space-x-1 text-toss-blue hover:text-blue-800"
                          >
                            <Phone size={16} />
                            <span>통화 기록</span>
                          </button>
                        )}
                        {activeTab === "preview" && (
                          <button
                            onClick={() => moveToToday(customer.id)}
                            className="text-toss-blue hover:text-blue-800"
                          >
                            Today로 이동
                          </button>
                        )}
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
                <p className="text-sm text-gray-600 mb-3">
                  전체 고객 정보를 붙여넣으면 필요한 정보만 자동으로 추출됩니다.
                </p>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="고객 정보 전체를 여기에 붙여넣어주세요. 필요한 정보만 자동으로 추출됩니다."
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-toss-blue focus:border-transparent resize-none"
                />

                {/* 미리보기 */}
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
                  className="px-4 py-2 bg-toss-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
              {/* 단계별 진행 표시 */}
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

              {/* 2단계: 후속 행동 (부재중/즉시 끊음인 경우만) */}
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
                      className="px-6 py-2 bg-toss-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}
