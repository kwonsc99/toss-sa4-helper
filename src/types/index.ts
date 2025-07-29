// 고객 상태 타입
export type CustomerStatus =
  | "입점약속"
  | "검토후연락"
  | "가입완료"
  | "상품등록필요"
  | "완전입점완료";

// 통화 연결 상태 타입
export type ConnectionStatus = "부재중" | "연결" | "연결 후 즉시 끊음";

// 후속 행동 타입
export type FollowUpAction =
  | "조치안함"
  | "이메일로_컨택_유도"
  | "카톡_및_문자로_컨택_유도"
  | "이메일+카톡/문자로_컨택_유도";

// 셀러 반응 타입
export type SellerReaction = "긍정" | "부정";

// 사용자 타입
export interface User {
  id: string;
  username: string;
  password: string;
  created_at: string;
}

// 고객 타입
export interface Customer {
  id: string;
  name: string;
  company: string | null;
  business_number: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
}

// 콜로그 타입
export interface CallLog {
  id: string;
  customer_id: string;
  connection_status: ConnectionStatus;
  follow_up_action: FollowUpAction;
  seller_reaction: SellerReaction;
  call_content: string;
  follow_up_planning: string;
  special_notes: string | null;
  created_at: string;
  updated_at?: string;
  customer?: Customer;
}

// 콜로그 히스토리 타입
export interface CallLogHistory {
  id: string;
  call_log_id: string;
  original_data: Partial<CallLog>;
  modified_data: Partial<CallLog>;
  modified_by: string;
  modified_at: string;
}

// 상태 설정 타입
export interface StatusOption {
  value: CustomerStatus;
  label: string;
  color: string;
  bgColor: string;
}

// 필터 타입
export interface CustomerFilters {
  status?: CustomerStatus | "all";
  date?: string;
  search?: string;
}

// 폼 데이터 타입들
export interface CustomerFormData {
  name: string;
  company: string;
  business_number: string;
  website: string;
  email: string;
  phone: string;
}

export interface CallLogFormData {
  connection_status: ConnectionStatus;
  follow_up_action: FollowUpAction;
  seller_reaction: SellerReaction;
  call_content: string;
  follow_up_planning: string;
  special_notes: string;
}
