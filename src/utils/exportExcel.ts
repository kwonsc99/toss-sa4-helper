import * as XLSX from "xlsx";
import { Customer } from "@/types";

export function exportCustomersToExcel(
  customers: Customer[],
  filename: string = "customers"
) {
  const exportData = customers.map((customer) => ({
    이름: customer.name,
    회사: customer.company || "",
    사업자번호: customer.business_number || "",
    웹사이트: customer.website || "",
    이메일: customer.email || "",
    전화: customer.phone || "",
    상태: customer.status,
    생성일: new Date(customer.created_at).toLocaleDateString("ko-KR"),
    수정일: new Date(customer.updated_at).toLocaleDateString("ko-KR"),
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "customers");
  XLSX.writeFile(
    wb,
    `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`
  );
}
