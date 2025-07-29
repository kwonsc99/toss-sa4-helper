import { StatusOption, CustomerStatus } from "@/types";

// 상태별 설정
export const STATUS_OPTIONS: Record<CustomerStatus, StatusOption> = {
  입점약속: {
    value: "입점약속",
    label: "입점약속",
    color: "text-blue-800",
    bgColor: "bg-blue-100",
  },
  검토후연락: {
    value: "검토후연락",
    label: "검토후연락",
    color: "text-yellow-800",
    bgColor: "bg-yellow-100",
  },
  가입완료: {
    value: "가입완료",
    label: "가입완료",
    color: "text-green-800",
    bgColor: "bg-green-100",
  },
  상품등록필요: {
    value: "상품등록필요",
    label: "상품등록필요",
    color: "text-purple-800",
    bgColor: "bg-purple-100",
  },
  완전입점완료: {
    value: "완전입점완료",
    label: "완전입점완료",
    color: "text-gray-800",
    bgColor: "bg-gray-100",
  },
};

// 상태 배열 (순서대로)
export const STATUS_LIST: CustomerStatus[] = [
  "입점약속",
  "검토후연락",
  "가입완료",
  "상품등록필요",
  "완전입점완료",
];

// 모든 상태 옵션 (필터용)
export const ALL_STATUS_OPTIONS = [
  { value: "all" as const, label: "전체" },
  ...STATUS_LIST.map((status) => ({
    value: status,
    label: STATUS_OPTIONS[status].label,
  })),
];

// 이메일 템플릿
export const EMAIL_TEMPLATE = (
  customerName: string
) => `안녕하세요, ${customerName}님

토스페이먼츠입니다.

오늘 연락드렸으나 통화가 어려워 이메일로 연락드립니다.

토스페이먼츠의 간편결제 솔루션에 대해 상담받고 싶으시면 
편하신 시간에 회신 부탁드립니다.

감사합니다.`;

// 카카오톡/문자 템플릿
export const KAKAO_TEMPLATE = (customerName: string) =>
  `[토스페이먼츠] ${customerName}님 안녕하세요. 오늘 연락드렸으나 통화 어려워 문자드립니다. 토스페이먼츠 간편결제 상담 원하시면 회신 부탁드립니다. 감사합니다.`;
