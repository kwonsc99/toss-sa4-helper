"use client";

import { useState } from "react";
import {
  ConnectionStatus,
  FollowUpAction,
  SellerReaction,
  CustomerStatus,
  CallLogFormData,
} from "@/types";
import {
  STATUS_LIST,
  STATUS_OPTIONS,
  EMAIL_TEMPLATE,
  KAKAO_TEMPLATE,
} from "@/constants";
import { Copy } from "lucide-react";
import Button from "../common/Button";
import Modal from "../common/Modal";

interface CallLogFormProps {
  isOpen?: boolean;
  customer: { name: string; id?: string } | null;
  onSubmit: (callLogData: CallLogFormData, nextStatus: CustomerStatus) => void;
  onCancel?: () => void;
  onClose?: () => void;
  embedded?: boolean;
}

export default function CallLogForm({
  isOpen = true,
  customer,
  onSubmit,
  onCancel,
  onClose,
  embedded = false,
}: CallLogFormProps) {
  const [step, setStep] = useState<
    "connection" | "followup" | "calllog" | "template"
  >("connection");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>();
  const [followUpAction, setFollowUpAction] = useState<FollowUpAction>();
  const [nextStatus, setNextStatus] = useState<CustomerStatus>();
  const [formData, setFormData] = useState<CallLogFormData>({
    connection_status: "" as ConnectionStatus,
    follow_up_action: "" as FollowUpAction,
    seller_reaction: "" as SellerReaction,
    call_content: "",
    follow_up_planning: "",
    special_notes: "",
  });
  const [showTemplate, setShowTemplate] = useState(false);
  const [templateType, setTemplateType] = useState<"email" | "kakao" | "both">(
    "email"
  );

  const handleConnectionNext = () => {
    if (!connectionStatus) {
      alert("통화 연결 여부를 선택해주세요.");
      return;
    }

    // 자동으로 주요 콜 내용 설정
    let autoCallContent = "";
    if (connectionStatus === "부재중") {
      autoCallContent = "부재중";
    } else if (connectionStatus === "연결 후 즉시 끊음") {
      autoCallContent = "연결후즉시끊음";
    }

    setFormData((prev) => ({
      ...prev,
      connection_status: connectionStatus,
      call_content: autoCallContent,
    }));
    setStep("followup");
  };

  const handleFollowUpNext = () => {
    if (!followUpAction) {
      alert("후속 행동을 선택해주세요.");
      return;
    }

    // 후속 컨택 플래닝 자동 설정
    let autoFollowUpPlanning = "";
    switch (followUpAction) {
      case "조치안함":
        autoFollowUpPlanning = "조치안함";
        break;
      case "이메일로_컨택_유도":
        autoFollowUpPlanning = "이메일로 컨택 유도";
        break;
      case "카톡_및_문자로_컨택_유도":
        autoFollowUpPlanning = "카톡 및 문자로 컨택 유도";
        break;
      case "이메일+카톡/문자로_컨택_유도":
        autoFollowUpPlanning = "이메일+카톡/문자로 컨택 유도";
        break;
    }

    setFormData((prev) => ({
      ...prev,
      follow_up_action: followUpAction,
      follow_up_planning: autoFollowUpPlanning,
    }));

    // 템플릿 표시
    if (followUpAction.includes("이메일") || followUpAction.includes("카톡")) {
      if (followUpAction === "이메일+카톡/문자로_컨택_유도") {
        setTemplateType("both");
      } else if (followUpAction === "이메일로_컨택_유도") {
        setTemplateType("email");
      } else {
        setTemplateType("kakao");
      }
      setShowTemplate(true);
      setStep("template");
    } else {
      setStep("calllog");
    }
  };

  const handleTemplateNext = () => {
    setShowTemplate(false);
    setStep("calllog");
  };

  const handleSubmit = () => {
    if (
      !formData.seller_reaction ||
      !formData.call_content ||
      !formData.follow_up_planning ||
      !nextStatus
    ) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    onSubmit(formData, nextStatus);
  };

  // 콜로그 내용 복사 기능
  const copyCallLogContent = () => {
    const callLogText = `
[콜로그]
고객명: ${customer?.name || ""}
연결상태: ${formData.connection_status}
후속행동: ${formData.follow_up_action
      .replace(/[_+]/g, " ")
      .replace("로 컨택", "로 컨택")}
셀러반응: ${formData.seller_reaction}
주요콜내용: ${formData.call_content}
후속컨택플래닝: ${formData.follow_up_planning}
특이사항: ${formData.special_notes || "없음"}
다음상태: ${nextStatus ? STATUS_OPTIONS[nextStatus].label : ""}
`.trim();

    navigator.clipboard.writeText(callLogText);
    alert("콜로그 내용이 클립보드에 복사되었습니다!");
  };

  const copyTemplate = (template: string, type: string) => {
    navigator.clipboard.writeText(template);
    alert(`${type} 템플릿이 클립보드에 복사되었습니다!`);
  };

  const renderConnectionStep = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-toss-gray">
        통화 연결 여부를 선택해주세요
      </h4>
      <div className="space-y-3">
        {(["부재중", "연결", "연결 후 즉시 끊음"] as ConnectionStatus[]).map(
          (status) => (
            <label
              key={status}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <input
                type="radio"
                name="connection"
                value={status}
                checked={connectionStatus === status}
                onChange={(e) =>
                  setConnectionStatus(e.target.value as ConnectionStatus)
                }
                className="w-4 h-4 text-toss-blue focus:ring-toss-blue"
              />
              <span className="text-gray-700">{status}</span>
            </label>
          )
        )}
      </div>
      <div className="flex justify-end">
        <Button onClick={handleConnectionNext}>다음</Button>
      </div>
    </div>
  );

  const renderFollowUpStep = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-toss-gray">후속 행동을 선택해주세요</h4>
      <div className="space-y-3">
        {(
          [
            "조치안함",
            "이메일로_컨택_유도",
            "카톡_및_문자로_컨택_유도",
            "이메일+카톡/문자로_컨택_유도",
          ] as FollowUpAction[]
        ).map((action) => (
          <label
            key={action}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <input
              type="radio"
              name="followup"
              value={action}
              checked={followUpAction === action}
              onChange={(e) =>
                setFollowUpAction(e.target.value as FollowUpAction)
              }
              className="w-4 h-4 text-toss-blue focus:ring-toss-blue"
            />
            <span className="text-gray-700">
              {action.replace(/[_+]/g, " ").replace("로 컨택", "로 컨택")}
            </span>
          </label>
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => setStep("connection")}>
          이전
        </Button>
        <Button onClick={handleFollowUpNext}>다음</Button>
      </div>
    </div>
  );

  const renderTemplateStep = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-toss-gray">템플릿</h4>

      {templateType === "both" ? (
        <div className="space-y-6">
          {/* 이메일 템플릿 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium text-gray-700">이메일 템플릿</h5>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  copyTemplate(EMAIL_TEMPLATE(customer?.name || ""), "이메일")
                }
              >
                복사
              </Button>
            </div>
            <div className="bg-gray-50 p-4 rounded border text-sm">
              <pre className="whitespace-pre-wrap">
                {EMAIL_TEMPLATE(customer?.name || "")}
              </pre>
            </div>
          </div>

          {/* 카카오톡/문자 템플릿 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium text-gray-700">
                카카오톡/문자 템플릿
              </h5>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  copyTemplate(
                    KAKAO_TEMPLATE(customer?.name || ""),
                    "카카오톡/문자"
                  )
                }
              >
                복사
              </Button>
            </div>
            <div className="bg-gray-50 p-4 rounded border text-sm">
              <pre className="whitespace-pre-wrap">
                {KAKAO_TEMPLATE(customer?.name || "")}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h5 className="font-medium text-gray-700">
              {templateType === "email" ? "이메일" : "카카오톡/문자"} 템플릿
            </h5>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const template =
                  templateType === "email"
                    ? EMAIL_TEMPLATE(customer?.name || "")
                    : KAKAO_TEMPLATE(customer?.name || "");
                copyTemplate(
                  template,
                  templateType === "email" ? "이메일" : "카카오톡/문자"
                );
              }}
            >
              복사
            </Button>
          </div>
          <div className="bg-gray-50 p-4 rounded border text-sm">
            <pre className="whitespace-pre-wrap">
              {templateType === "email"
                ? EMAIL_TEMPLATE(customer?.name || "")
                : KAKAO_TEMPLATE(customer?.name || "")}
            </pre>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => setStep("followup")}>
          이전
        </Button>
        <Button onClick={handleTemplateNext}>다음</Button>
      </div>
    </div>
  );

  const renderCallLogStep = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-toss-gray">콜로그를 작성해주세요</h4>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          셀러 반응 *
        </label>
        <div className="flex space-x-4">
          {(["긍정", "부정"] as SellerReaction[]).map((reaction) => (
            <label
              key={reaction}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                name="reaction"
                value={reaction}
                checked={formData.seller_reaction === reaction}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seller_reaction: e.target.value as SellerReaction,
                  }))
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
          value={formData.call_content}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, call_content: e.target.value }))
          }
          className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue resize-none"
          placeholder="통화 내용을 입력해주세요..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          후속 컨택 플래닝 *
        </label>
        <textarea
          value={formData.follow_up_planning}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              follow_up_planning: e.target.value,
            }))
          }
          className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue resize-none"
          placeholder="후속 계획을 입력해주세요..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          특이사항
        </label>
        <textarea
          value={formData.special_notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, special_notes: e.target.value }))
          }
          className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue resize-none"
          placeholder="특이사항이 있으면 입력해주세요..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          다음 상태 *
        </label>
        <select
          value={nextStatus || ""}
          onChange={(e) => setNextStatus(e.target.value as CustomerStatus)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue"
        >
          <option value="">상태를 선택해주세요</option>
          {STATUS_LIST.map((status) => (
            <option key={status} value={status}>
              {STATUS_OPTIONS[status].label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => setStep(showTemplate ? "template" : "followup")}
        >
          이전
        </Button>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={copyCallLogContent}
            disabled={
              !formData.seller_reaction ||
              !formData.call_content ||
              !formData.follow_up_planning ||
              !nextStatus
            }
          >
            <Copy size={16} className="mr-1" />
            내용 복사
          </Button>
          <Button onClick={handleSubmit}>콜로그 저장</Button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (step) {
      case "connection":
        return renderConnectionStep();
      case "followup":
        return renderFollowUpStep();
      case "template":
        return renderTemplateStep();
      case "calllog":
        return renderCallLogStep();
      default:
        return renderConnectionStep();
    }
  };

  if (embedded) {
    return <div className="p-6">{renderContent()}</div>;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose || (() => {})}
      title={`${customer?.name} - 콜로그 작성`}
      size="lg"
    >
      <div className="p-6">
        {/* 단계 표시 */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-4">
            {[
              "connection",
              "followup",
              showTemplate ? "template" : null,
              "calllog",
            ]
              .filter(Boolean)
              .map((stepName, index) => (
                <div key={stepName} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      step === stepName
                        ? "bg-toss-blue text-white"
                        : [
                            "connection",
                            "followup",
                            "template",
                            "calllog",
                          ].indexOf(step) > index
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 3 && (
                    <div
                      className={`h-0.5 w-12 ${
                        [
                          "connection",
                          "followup",
                          "template",
                          "calllog",
                        ].indexOf(step) > index
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
          </div>
        </div>

        {renderContent()}
      </div>
    </Modal>
  );
}
