"use client";

import { useState, useEffect } from "react";
import {
  CallLog,
  ConnectionStatus,
  FollowUpAction,
  FollowUpActionType,
  SellerReaction,
  CallLogFormData,
} from "@/types";
import { FOLLOW_UP_ACTION_OPTIONS } from "@/constants";
import Modal from "../common/Modal";
import Button from "../common/Button";

interface CallLogEditFormProps {
  isOpen: boolean;
  callLog: CallLog | null;
  onClose: () => void;
  onSubmit: (callLogId: string, updates: Partial<CallLog>) => void;
}

export default function CallLogEditForm({
  isOpen,
  callLog,
  onClose,
  onSubmit,
}: CallLogEditFormProps) {
  const [formData, setFormData] = useState<CallLogFormData>({
    connection_status: "" as ConnectionStatus,
    follow_up_action: [],
    seller_reaction: "" as SellerReaction,
    call_content: "",
    follow_up_planning: "",
    special_notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (callLog) {
      setFormData({
        connection_status: callLog.connection_status,
        follow_up_action: Array.isArray(callLog.follow_up_action)
          ? callLog.follow_up_action
          : [], // 배열이 아닌 경우 빈 배열로 초기화
        seller_reaction: callLog.seller_reaction,
        call_content: callLog.call_content,
        follow_up_planning: callLog.follow_up_planning,
        special_notes: callLog.special_notes || "",
      });
    }
  }, [callLog]);

  const handleFollowUpActionToggle = (action: FollowUpActionType) => {
    setFormData((prev) => {
      const currentActions = prev.follow_up_action || [];

      if (action === "조치안함") {
        // 조치안함 선택시 다른 액션들 제거
        return {
          ...prev,
          follow_up_action: ["조치안함"],
        };
      } else {
        // 다른 액션 선택시 조치안함 제거
        const newActions = currentActions.filter((a) => a !== "조치안함");
        if (newActions.includes(action)) {
          return {
            ...prev,
            follow_up_action: newActions.filter((a) => a !== action),
          };
        } else {
          return {
            ...prev,
            follow_up_action: [...newActions, action],
          };
        }
      }
    });
  };

  // 후속 컨택 플래닝 자동 업데이트
  useEffect(() => {
    if (formData.follow_up_action && formData.follow_up_action.length > 0) {
      const planningTexts = formData.follow_up_action.map((action) => {
        switch (action) {
          case "조치안함":
            return "조치안함";
          case "이메일":
            return "이메일";
          case "카톡":
            return "카톡";
          case "문자":
            return "문자";
          default:
            return action;
        }
      });

      setFormData((prev) => ({
        ...prev,
        follow_up_planning: planningTexts.join(", "),
      }));
    }
  }, [formData.follow_up_action]);

  const handleSubmit = async () => {
    if (
      !formData.seller_reaction ||
      !formData.call_content ||
      !formData.follow_up_planning
    ) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(callLog!.id, formData);
      onClose();
    } catch (error) {
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!callLog) return null;

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>
        취소
      </Button>
      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "저장 중..." : "수정 완료"}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="콜로그 수정"
      size="lg"
      footer={footer}
    >
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            통화 연결 여부
          </label>
          <select
            value={formData.connection_status}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                connection_status: e.target.value as ConnectionStatus,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue"
          >
            <option value="부재중">부재중</option>
            <option value="연결">연결</option>
            <option value="연결 후 즉시 끊음">연결 후 즉시 끊음</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            후속 행동 (다중 선택 가능)
          </label>
          <div className="space-y-3">
            {FOLLOW_UP_ACTION_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={
                    formData.follow_up_action?.includes(
                      option.value as FollowUpActionType
                    ) || false
                  }
                  onChange={() =>
                    handleFollowUpActionToggle(
                      option.value as FollowUpActionType
                    )
                  }
                  className="w-4 h-4 text-toss-blue focus:ring-toss-blue rounded"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>

          {formData.follow_up_action &&
            formData.follow_up_action.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>선택된 후속 행동:</strong>{" "}
                  {formData.follow_up_action
                    .map(
                      (action) =>
                        FOLLOW_UP_ACTION_OPTIONS.find(
                          (opt) => opt.value === action
                        )?.label
                    )
                    .join(", ")}
                </div>
              </div>
            )}
        </div>

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
                  name="edit_reaction"
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
            후속 컨택 플래닝 * (자동 생성됨)
          </label>
          <textarea
            value={formData.follow_up_planning}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                follow_up_planning: e.target.value,
              }))
            }
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue resize-none bg-gray-50"
            placeholder="후속 계획을 입력해주세요..."
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">
            후속 행동 선택에 따라 자동으로 생성됩니다. 필요시 직접 수정
            가능합니다.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            특이사항
          </label>
          <textarea
            value={formData.special_notes}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                special_notes: e.target.value,
              }))
            }
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-toss-blue resize-none"
            placeholder="특이사항이 있으면 입력해주세요..."
          />
        </div>
      </div>
    </Modal>
  );
}
