"use client";

import { useEffect } from "react";
import { CallLog, Customer } from "@/types";
import { STATUS_OPTIONS, FOLLOW_UP_ACTION_OPTIONS } from "@/constants";
import { Edit, History } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";

interface CallLogHistoryProps {
  isOpen: boolean;
  customer: Customer | null;
  callLogs: CallLog[];
  onClose: () => void;
  onEdit: (callLog: CallLog) => void;
  onViewHistory?: (callLogId: string) => void;
}

export default function CallLogHistory({
  isOpen,
  customer,
  callLogs,
  onClose,
  onEdit,
  onViewHistory,
}: CallLogHistoryProps) {
  if (!customer) return null;

  // 후속 행동 배열을 읽기 쉬운 텍스트로 변환하는 함수
  const formatFollowUpActions = (actions: string[] | string) => {
    // 기존 문자열 형태의 데이터 호환성 처리
    if (typeof actions === "string") {
      return actions.replace(/[_+]/g, " ").replace("로 컨택", "로 컨택");
    }

    // 배열 형태의 새로운 데이터 처리
    if (Array.isArray(actions)) {
      return actions
        .map((action) => {
          const option = FOLLOW_UP_ACTION_OPTIONS.find(
            (opt) => opt.value === action
          );
          return option ? option.label : action;
        })
        .join(", ");
    }

    return "알 수 없음";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${customer.name} - 콜로그 히스토리`}
      size="xl"
    >
      <div className="p-6">
        {callLogs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            콜로그가 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {callLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 bg-gray-50">
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
                    {log.updated_at && log.updated_at !== log.created_at && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        수정됨
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onEdit(log)}
                    >
                      <Edit size={14} className="mr-1" />
                      수정
                    </Button>

                    {onViewHistory && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewHistory(log.id)}
                      >
                        <History size={14} className="mr-1" />
                        히스토리
                      </Button>
                    )}

                    <div className="text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString("ko-KR")}
                      {log.updated_at && log.updated_at !== log.created_at && (
                        <div className="text-xs text-yellow-600">
                          수정:{" "}
                          {new Date(log.updated_at).toLocaleString("ko-KR")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-700 mb-1">
                      후속 행동
                    </div>
                    <div className="text-gray-600">
                      {formatFollowUpActions(log.follow_up_action)}
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
                  <div className="md:col-span-2">
                    <div className="font-medium text-gray-700 mb-1">
                      주요 콜 내용
                    </div>
                    <div className="text-gray-600">{log.call_content}</div>
                  </div>
                  {log.special_notes && (
                    <div className="md:col-span-2">
                      <div className="font-medium text-gray-700 mb-1">
                        특이사항
                      </div>
                      <div className="text-gray-600">{log.special_notes}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
