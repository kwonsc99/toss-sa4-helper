"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CallLog, CallLogHistory, CallLogFormData } from "@/types";

export function useCallLogs() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [callLogHistory, setCallLogHistory] = useState<CallLogHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 현재 사용자 정보 가져오기
  const getCurrentUser = () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };

  const loadCallLogs = async (customerId?: string) => {
    setIsLoading(true);
    try {
      const currentUser = getCurrentUser();
      if (!currentUser?.id) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }

      let query = supabase
        .from("call_logs")
        .select(
          `
          *,
          customer:customers(*)
        `
        )
        .eq("user_id", currentUser.id) // 사용자별 필터링
        .order("created_at", { ascending: false });

      if (customerId) {
        query = query.eq("customer_id", customerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCallLogs(data || []);
    } catch (error) {
      console.error("Error loading call logs:", error);
      setCallLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateFollowUpAction = (actions: string[]): boolean => {
    const validActions = [
      "조치안함",
      "이메일로_컨택_유도",
      "카톡으로_컨택_유도",
      "문자로_컨택_유도",
    ];
    return actions.every((action) => validActions.includes(action));
  };

  const createCallLog = async (callLogData: Partial<CallLog>) => {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    // 후속 행동 유효성 검증
    if (
      callLogData.follow_up_action &&
      !validateFollowUpAction(callLogData.follow_up_action)
    ) {
      throw new Error("유효하지 않은 후속 행동이 포함되어 있습니다.");
    }

    const { data, error } = await supabase
      .from("call_logs")
      .insert([
        {
          ...callLogData,
          user_id: currentUser.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateCallLog = async (id: string, updates: Partial<CallLog>) => {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    // 기존 데이터 가져오기 (본인 데이터만)
    const { data: originalData, error: fetchError } = await supabase
      .from("call_logs")
      .select("*")
      .eq("id", id)
      .eq("user_id", currentUser.id)
      .single();

    if (fetchError) throw fetchError;

    // 히스토리에 저장
    const { error: historyError } = await supabase
      .from("call_log_history")
      .insert([
        {
          call_log_id: id,
          original_data: originalData,
          modified_data: updates,
          modified_by: currentUser.username,
          user_id: currentUser.id,
        },
      ]);

    if (historyError) throw historyError;

    // 콜로그 업데이트 (본인 데이터만)
    const { error } = await supabase
      .from("call_logs")
      .update(updates)
      .eq("id", id)
      .eq("user_id", currentUser.id);

    if (error) throw error;
  };

  const loadCallLogHistory = async (callLogId: string) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser?.id) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }

      const { data, error } = await supabase
        .from("call_log_history")
        .select("*")
        .eq("call_log_id", callLogId)
        .eq("user_id", currentUser.id) // 사용자별 필터링
        .order("modified_at", { ascending: false });

      if (error) throw error;
      setCallLogHistory(data || []);
    } catch (error) {
      console.error("Error loading call log history:", error);
      setCallLogHistory([]);
    }
  };

  return {
    callLogs,
    callLogHistory,
    isLoading,
    loadCallLogs,
    createCallLog,
    updateCallLog,
    loadCallLogHistory,
  };
}
