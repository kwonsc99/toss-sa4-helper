"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Customer,
  CustomerStatus,
  CustomerFilters,
  CustomerFormData,
} from "@/types";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCustomers = async (filters?: CustomerFilters) => {
    setIsLoading(true);
    try {
      let query = supabase.from("customers").select("*");

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters?.date) {
        query = query
          .gte("updated_at", `${filters.date}T00:00:00`)
          .lt("updated_at", `${filters.date}T23:59:59`);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query.order("updated_at", {
        ascending: false,
      });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCustomer = async (customerData: Partial<Customer>) => {
    const { data, error } = await supabase
      .from("customers")
      .insert([customerData])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    const { error } = await supabase
      .from("customers")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  };

  const deleteCustomer = async (id: string) => {
    // 먼저 관련 콜로그 삭제
    const { error: callLogError } = await supabase
      .from("call_logs")
      .delete()
      .eq("customer_id", id);

    if (callLogError) throw callLogError;

    // 고객 삭제
    const { error } = await supabase.from("customers").delete().eq("id", id);

    if (error) throw error;
  };

  const updateCustomerStatus = async (id: string, status: CustomerStatus) => {
    await updateCustomer(id, { status });
  };

  const bulkUpdateStatus = async (ids: string[], status: CustomerStatus) => {
    const { error } = await supabase
      .from("customers")
      .update({ status, updated_at: new Date().toISOString() })
      .in("id", ids);

    if (error) throw error;
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return {
    customers,
    isLoading,
    loadCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerStatus,
    bulkUpdateStatus,
  };
}
