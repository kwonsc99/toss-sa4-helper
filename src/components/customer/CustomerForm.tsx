"use client";

import { useState, useEffect } from "react";
import { Customer, CustomerStatus, CallLogFormData } from "@/types";
import { STATUS_LIST, STATUS_OPTIONS } from "@/constants";
import { parseCustomerData } from "@/utils/parseCustomerData";
import Modal from "../common/Modal";
import Button from "../common/Button";
import CallLogForm from "../calllog/CallLogForm";

interface CustomerFormProps {
  isOpen: boolean;
  customer?: Customer | null;
  onClose: () => void;
  onSubmit: (
    customerData: Partial<Customer>,
    callLogData?: CallLogFormData,
    nextStatus?: CustomerStatus
  ) => void;
}

export default function CustomerForm({
  isOpen,
  customer,
  onClose,
  onSubmit,
}: CustomerFormProps) {
  const [step, setStep] = useState<"customer" | "calllog">("customer");
  const [includeCallLog, setIncludeCallLog] = useState(true); // 기본값을 true로 변경
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    business_number: "",
    website: "",
    email: "",
    phone: "",
    status: "검토후연락" as CustomerStatus,
  });
  const [rawInput, setRawInput] = useState("");
  const [callLogData, setCallLogData] = useState<CallLogFormData | null>(null);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        company: customer.company || "",
        business_number: customer.business_number || "",
        website: customer.website || "",
        email: customer.email || "",
        phone: customer.phone || "",
        status: customer.status,
      });
      setIncludeCallLog(false); // 수정 모드에서는 콜로그 체크 해제
      setStep("customer");
    } else {
      setFormData({
        name: "",
        company: "",
        business_number: "",
        website: "",
        email: "",
        phone: "",
        status: "검토후연락",
      });
      setIncludeCallLog(true); // 새 고객 등록시 기본 체크
      setStep("customer");
      setRawInput("");
    }
  }, [customer, isOpen]);

  const handleRawInputChange = (value: string) => {
    setRawInput(value);
    if (value) {
      const parsed = parseCustomerData(value);
      setFormData((prev) => ({
        ...prev,
        ...parsed,
      }));
    }
  };

  const handleCustomerSubmit = () => {
    if (!formData.name.trim()) {
      alert("이름은 필수 입력 항목입니다.");
      return;
    }

    if (includeCallLog && !customer) {
      setStep("calllog");
    } else {
      onSubmit(formData, undefined, formData.status);
    }
  };

  const handleCallLogSubmit = (
    callLog: CallLogFormData,
    nextStatus: CustomerStatus
  ) => {
    onSubmit(formData, callLog, nextStatus);
  };

  const renderCustomerForm = () => (
    <div className="p-6 space-y-6">
      {!customer && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            고객 정보 일괄 입력 (선택사항)
          </label>
          <textarea
            value={rawInput}
            onChange={(e) => handleRawInputChange(e.target.value)}
            placeholder="고객 정보를 붙여넣으면 자동으로 파싱됩니다..."
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue resize-none"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이름 *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            회사
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, company: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            사업자번호
          </label>
          <input
            type="text"
            value={formData.business_number}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                business_number: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            전화번호
          </label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이메일
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            웹사이트
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, website: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            초기 상태
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                status: e.target.value as CustomerStatus,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue"
          >
            {STATUS_LIST.map((status) => (
              <option key={status} value={status}>
                {STATUS_OPTIONS[status].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!customer && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeCallLog"
            checked={includeCallLog}
            onChange={(e) => setIncludeCallLog(e.target.checked)}
            className="w-4 h-4 text-toss-blue focus:ring-toss-blue rounded"
          />
          <label
            htmlFor="includeCallLog"
            className="ml-2 text-sm text-gray-700"
          >
            콜로그도 함께 작성하기
          </label>
        </div>
      )}
    </div>
  );

  const footer =
    step === "customer" ? (
      <>
        <Button variant="secondary" onClick={onClose}>
          취소
        </Button>
        <Button onClick={handleCustomerSubmit}>
          {includeCallLog && !customer ? "다음" : customer ? "수정" : "등록"}
        </Button>
      </>
    ) : (
      <>
        <Button variant="secondary" onClick={() => setStep("customer")}>
          이전
        </Button>
      </>
    );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? "고객 정보 수정" : "새 고객 등록"}
      size="lg"
      footer={footer}
    >
      {step === "customer" ? (
        renderCustomerForm()
      ) : (
        <CallLogForm
          customer={{ name: formData.name }}
          onSubmit={handleCallLogSubmit}
          onCancel={() => setStep("customer")}
          embedded={true}
        />
      )}
    </Modal>
  );
}
