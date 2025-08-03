import { StatusOption, CustomerStatus, User } from "@/types";

// 상태별 설정 (value와 label 모두 변경)
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
  청약심사: {
    value: "청약심사",
    label: "청약심사",
    color: "text-purple-800",
    bgColor: "bg-purple-100",
  },
  청약완료: {
    value: "청약완료",
    label: "청약완료",
    color: "text-gray-800",
    bgColor: "bg-gray-100",
  },
};

// 상태 배열 (순서대로) - 새로운 상태명으로 변경
export const STATUS_LIST: CustomerStatus[] = [
  "검토후연락",
  "입점약속",
  "가입완료",
  "청약심사", // 상품등록필요 → 청약심사
  "청약완료", // 완전입점완료 → 청약완료
];

// 나머지는 동일
export const SORT_OPTIONS = [
  { value: "latest", label: "최신 등록순" },
  { value: "oldest", label: "오래된 등록순" },
  { value: "name_asc", label: "이름 가나다순" },
  { value: "name_desc", label: "이름 가나다 역순" },
  { value: "company_asc", label: "회사명 가나다순" },
  { value: "company_desc", label: "회사명 가나다 역순" },
] as const;

export const ALL_STATUS_OPTIONS = [
  { value: "all" as const, label: "전체" },
  ...STATUS_LIST.map((status) => ({
    value: status,
    label: STATUS_OPTIONS[status].label,
  })),
];

export const FOLLOW_UP_ACTION_OPTIONS = [
  { value: "조치안함", label: "조치안함" },
  { value: "이메일로_컨택_유도", label: "이메일로 컨택 유도" },
  { value: "카톡으로_컨택_유도", label: "카톡으로 컨택 유도" },
  { value: "문자로_컨택_유도", label: "문자로 컨택 유도" },
] as const;

// 템플릿들은 동일하게 유지
export const EMAIL_TEMPLATE = (companyName?: string, user?: User) => {
  const senderName = user?.real_name || "권석찬";
  const senderEmail = user?.email || "kwonsc@toss.im";
  const senderPhone = user?.phone || "070-4353-5478";

  return `안녕하세요, 토스 커머스팀 MD ${senderName}입니다.

오늘 연락드렸으나 통화가 어려워 이메일을 드립니다.
저희 토스에서도 ${companyName}의 상품 판매 제안 차 연락드렸습니다.
명함과 소개서 첨부해드리니, 검토 후 회신 부탁드립니다.

감사합니다.

토스 커머스팀 MD ${senderName}
이메일: ${senderEmail}
전화: ${senderPhone}`;
};

export const KAKAO_TEMPLATE = (companyName?: string, user?: User) => {
  const senderName = user?.real_name || "권석찬";

  return `안녕하세요, 토스 커머스팀 MD ${senderName}입니다. 오늘 연락드렸으나 통화가 어려워 카톡을 드립니다. 저희 토스에서도 ${companyName}의 상품 판매 제안 차 연락드렸습니다. 편하신 때에 회신 부탁드립니다. 감사합니다.`;
};

export const SMS_TEMPLATE = (companyName?: string, user?: User) => {
  const senderName = user?.real_name || "권석찬";

  return `안녕하세요, 토스 커머스팀 MD ${senderName}입니다. 오늘 연락드렸으나 통화가 어려워 문자를 드립니다. 저희 토스에서도 ${companyName}의 상품 판매 제안 차 연락드렸습니다. 편하신 때에 회신 부탁드립니다. 감사합니다.`;
};
