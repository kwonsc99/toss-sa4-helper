"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import {
  ConnectionStatus,
  FollowUpAction,
  FollowUpActionType,
  SellerReaction,
  CustomerStatus,
  CallLogFormData,
} from "@/types";
import {
  STATUS_LIST,
  STATUS_OPTIONS,
  EMAIL_TEMPLATE,
  KAKAO_TEMPLATE,
  SMS_TEMPLATE,
  FOLLOW_UP_ACTION_OPTIONS,
} from "@/constants";
import { Copy } from "lucide-react";
import Button from "../common/Button";
import Modal from "../common/Modal";

interface CallLogFormProps {
  isOpen?: boolean;
  customer: {
    name: string;
    id?: string;
    company?: string | null; // null도 허용하도록 수정
  } | null;
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
  // 현재 사용자 정보 가져오기
  const { user } = useAuth();
  const [step, setStep] = useState<
    "connection" | "followup" | "calllog" | "template"
  >("connection");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>();
  const [followUpActions, setFollowUpActions] = useState<FollowUpActionType[]>(
    []
  );
  const [nextStatus, setNextStatus] = useState<CustomerStatus>();
  const [formData, setFormData] = useState<CallLogFormData>({
    connection_status: "" as ConnectionStatus,
    follow_up_action: [],
    seller_reaction: "" as SellerReaction,
    call_content: "",
    follow_up_planning: "",
    special_notes: "",
  });
  const [showTemplate, setShowTemplate] = useState(false);

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

  const handleFollowUpActionToggle = (action: FollowUpActionType) => {
    setFollowUpActions((prev) => {
      if (action === "조치안함") {
        // 조치안함 선택시 다른 액션들 제거
        return ["조치안함"];
      } else {
        // 다른 액션 선택시 조치안함 제거
        const newActions = prev.filter((a) => a !== "조치안함");
        if (newActions.includes(action)) {
          return newActions.filter((a) => a !== action);
        } else {
          return [...newActions, action];
        }
      }
    });
  };

  const handleFollowUpNext = () => {
    if (followUpActions.length === 0) {
      alert("후속 행동을 선택해주세요.");
      return;
    }

    // 후속 컨택 플래닝 자동 설정
    const planningTexts = followUpActions.map((action) => {
      switch (action) {
        case "조치안함":
          return "조치안함";
        case "이메일로_컨택_유도":
          return "이메일로 컨택 유도";
        case "카톡으로_컨택_유도":
          return "카톡으로 컨택 유도";
        case "문자로_컨택_유도":
          return "문자로 컨택 유도";
        default:
          return action;
      }
    });

    setFormData((prev) => ({
      ...prev,
      follow_up_action: followUpActions,
      follow_up_planning: planningTexts.join(", "),
    }));

    // 템플릿 표시 (조치안함이 아닌 경우)
    if (!followUpActions.includes("조치안함")) {
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
셀러반응: ${formData.seller_reaction}
주요콜내용: ${formData.call_content}
후속행동: ${formData.follow_up_action
      .map(
        (action) =>
          FOLLOW_UP_ACTION_OPTIONS.find((opt) => opt.value === action)?.label ||
          action
      )
      .join(", ")}
특이사항: ${formData.special_notes || "없음"}
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
      <h4 className="font-medium text-toss-gray">
        후속 행동을 선택해주세요 (다중 선택 가능)
      </h4>
      <div className="space-y-3">
        {FOLLOW_UP_ACTION_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={followUpActions.includes(
                option.value as FollowUpActionType
              )}
              onChange={() =>
                handleFollowUpActionToggle(option.value as FollowUpActionType)
              }
              className="w-4 h-4 text-toss-blue focus:ring-toss-blue rounded"
            />
            <span className="text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>

      {followUpActions.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>선택된 후속 행동:</strong>{" "}
            {followUpActions
              .map(
                (action) =>
                  FOLLOW_UP_ACTION_OPTIONS.find((opt) => opt.value === action)
                    ?.label
              )
              .join(", ")}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => setStep("connection")}>
          이전
        </Button>
        <Button onClick={handleFollowUpNext}>다음</Button>
      </div>
    </div>
  );

  // 템플릿 렌더링 부분 수정
  const renderTemplateStep = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-toss-gray">템플릿</h4>

      <div className="space-y-6">
        {/* 이메일 템플릿 */}
        {followUpActions.includes("이메일로_컨택_유도") && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium text-gray-700">이메일 템플릿</h5>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  copyTemplate(
                    EMAIL_TEMPLATE(
                      customer?.company || customer?.name, // companyName 파라미터
                      user || undefined // user 파라미터
                    ),
                    "이메일"
                  )
                }
              >
                복사
              </Button>
            </div>
            <div className="bg-gray-50 p-4 rounded border text-sm">
              <pre className="whitespace-pre-wrap">
                {EMAIL_TEMPLATE(
                  customer?.company || customer?.name,
                  user || undefined
                )}
              </pre>
            </div>
          </div>
        )}

        {/* 카카오톡 템플릿 */}
        {followUpActions.includes("카톡으로_컨택_유도") && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium text-gray-700">카카오톡 템플릿</h5>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  copyTemplate(
                    KAKAO_TEMPLATE(
                      customer?.company || customer?.name,
                      user || undefined
                    ),
                    "카카오톡"
                  )
                }
              >
                복사
              </Button>
            </div>
            <div className="bg-gray-50 p-4 rounded border text-sm">
              <pre className="whitespace-pre-wrap">
                {KAKAO_TEMPLATE(
                  customer?.company || customer?.name,
                  user || undefined
                )}
              </pre>
            </div>
          </div>
        )}

        {/* 문자 템플릿 */}
        {followUpActions.includes("문자로_컨택_유도") && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium text-gray-700">문자 템플릿</h5>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  copyTemplate(
                    SMS_TEMPLATE(
                      customer?.company || customer?.name,
                      user || undefined
                    ),
                    "문자"
                  )
                }
              >
                복사
              </Button>
            </div>
            <div className="bg-gray-50 p-4 rounded border text-sm">
              <pre className="whitespace-pre-wrap">
                {SMS_TEMPLATE(
                  customer?.company || customer?.name,
                  user || undefined
                )}
              </pre>
            </div>
          </div>
        )}
      </div>

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
