"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Customer, CustomerStatus, CustomerFilters } from "@/types";

interface AuthData {
  user: any;
  expirationTime: number;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 현재 사용자 정보 가져오기 - authData에서 user 추출
  const getCurrentUser = () => {
    const authDataStr = localStorage.getItem("authData");
    if (!authDataStr) return null;

    try {
      const authData: AuthData = JSON.parse(authDataStr);
      const now = Date.now();

      // 만료 체크
      if (now >= authData.expirationTime) {
        localStorage.removeItem("authData");
        return null;
      }

      return authData.user;
    } catch (error) {
      localStorage.removeItem("authData");
      return null;
    }
  };

  const loadCustomers = async (filters?: CustomerFilters) => {
    setIsLoading(true);
    try {
      const currentUser = getCurrentUser();
      if (!currentUser?.id) {
        console.log("No current user found"); // 디버깅용
        setCustomers([]);
        setIsLoading(false);
        return;
      }

      console.log("Loading customers for user:", currentUser.id); // 디버깅용

      let query = supabase
        .from("customers")
        .select("*")
        .eq("user_id", currentUser.id);

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters?.date) {
        query = query
          .gte("created_at", `${filters.date}T00:00:00`)
          .lt("created_at", `${filters.date}T23:59:59`);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
        );
      }

      // 정렬 적용
      const sortBy = filters?.sortBy || "latest";
      switch (sortBy) {
        case "latest":
          query = query.order("created_at", { ascending: false });
          break;
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "name_asc":
          query = query.order("name", { ascending: true });
          break;
        case "name_desc":
          query = query.order("name", { ascending: false });
          break;
        case "company_asc":
          query = query.order("company", { ascending: true });
          break;
        case "company_desc":
          query = query.order("company", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log("Loaded customers:", data?.length || 0); // 디버깅용
      setCustomers(data || []);
    } catch (error) {
      console.error("Error loading customers:", error);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createCustomer = async (customerData: Partial<Customer>) => {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    console.log("Creating customer for user:", currentUser.id); // 디버깅용

    const { data, error } = await supabase
      .from("customers")
      .insert([
        {
          ...customerData,
          user_id: currentUser.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    const { error } = await supabase
      .from("customers")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", currentUser.id); // 본인 데이터만 수정 가능

    if (error) throw error;
  };

  const deleteCustomer = async (id: string) => {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    // 먼저 관련 콜로그 삭제
    const { error: callLogError } = await supabase
      .from("call_logs")
      .delete()
      .eq("customer_id", id)
      .eq("user_id", currentUser.id);

    if (callLogError) throw callLogError;

    // 고객 삭제
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUser.id); // 본인 데이터만 삭제 가능

    if (error) throw error;
  };

  const updateCustomerStatus = async (id: string, status: CustomerStatus) => {
    await updateCustomer(id, { status });
  };

  const bulkUpdateStatus = async (ids: string[], status: CustomerStatus) => {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    const { error } = await supabase
      .from("customers")
      .update({ status, updated_at: new Date().toISOString() })
      .in("id", ids)
      .eq("user_id", currentUser.id); // 본인 데이터만 수정 가능

    if (error) throw error;
  };

  // 사용자별 데이터 초기화를 위한 함수 추가
  const clearCustomers = () => {
    setCustomers([]);
  };

  return {
    customers,
    isLoading,
    loadCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerStatus,
    bulkUpdateStatus,
    clearCustomers, // 추가
  };
}
