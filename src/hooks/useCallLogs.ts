"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CallLog, CallLogHistory, CallLogFormData } from "@/types";
import { useAuth } from "./useAuth";

export function useCallLogs() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [callLogHistory, setCallLogHistory] = useState<CallLogHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const loadCallLogs = async (customerId?: string) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const createCallLog = async (callLogData: Partial<CallLog>) => {
    const { data, error } = await supabase
      .from("call_logs")
      .insert([callLogData])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateCallLog = async (id: string, updates: Partial<CallLog>) => {
    // 기존 데이터 가져오기
    const { data: originalData, error: fetchError } = await supabase
      .from("call_logs")
      .select("*")
      .eq("id", id)
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
          modified_by: user?.username || "unknown",
        },
      ]);

    if (historyError) throw historyError;

    // 콜로그 업데이트
    const { error } = await supabase
      .from("call_logs")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
  };

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
