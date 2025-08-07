import { User } from "@/types";

export interface Template {
  id: string;
  title: string;
  getContent: (user?: User) => string[]; // 함수로 변경
  type: "kakao" | "sms" | "email";
}

export const FOLLOW_UP_TEMPLATES: Template[] = [
  {
    id: "kakao-guide-request",
    title: "(카톡) 셀러가 소개서 및 가이드를 보내달라고 하는 경우",
    type: "kakao",
    getContent: (user?: User) => {
      const senderName = user?.real_name || "권석찬";
      return [
        `안녕하세요, 방금 전화로 인사드렸던 토스 커머스팀 MD ${senderName}입니다.`,
        "안내드린 입점 소개서와 가이드를 아래에 전달드립니다. 확인 부탁드립니다 :)",
        `[입점 절차 안내]
입점은 아래 절차에 따라 간편하게 진행하실 수 있습니다.
👉 https://shopping-seller.toss.im/
1. 토스 쇼핑 파트너스 회원가입
2. 공유드린 '토스페이 신청하기' 가이드를 열람 후 절차 진행
3. '토스페이 가맹점 신청 완료' 안내 알림톡을 받으신 후, 등록하신 사업자등록번호를 이 채팅방에 남겨주시면 확인 후 첫 달 판매수수료 면제 혜택 적용 도와드리겠습니다.`,
        "추가로 궁금하신 점이나 어려운 부분 있으시면 언제든지 편하게 말씀해주세요. 빠르게 도와드리겠습니다.",
      ];
    },
  },
  {
    id: "kakao-application-completed",
    title: "(카톡) 셀러가 청약 신청을 마친 경우",
    type: "kakao",
    getContent: (user?: User) => [
      "확인 감사합니다. 심사 완료 후 혜택이 적용될 수 있도록 준비하겠습니다.",
      "상품 등록 가이드를 아래에 공유드립니다. 안내에 따라 진행해보시고, 궁금한 점이 있으시면 언제든지 편하게 말씀해주세요.\n\nhttps://tosspublic.notion.site/2-0-1e5714bbfde7809ea8f3c4717d1fefc6#1f2714bbfde7808eaff5d8840efed8df",
    ],
  },
  {
    id: "kakao-approval-completed",
    title: "(카톡) 셀러가 청약 승인이 끝난 경우",
    type: "kakao",
    getContent: (user?: User) => [
      "대표님, 청약 승인이 확인되어 기획전 참여 링크를 아래에 전달드립니다.\n\nhttps://tosspublic.notion.site/25-08-231714bbfde780bead0ae327ed8444d5",
    ],
  },
  {
    id: "sms-guide-request",
    title: "(문자) 셀러가 소개서 및 가이드를 보내달라고 하는 경우",
    type: "sms",
    getContent: (user?: User) => {
      const senderName = user?.real_name || "권석찬";
      return [
        `안녕하세요, 토스 커머스팀 MD ${senderName}입니다. 조금 전 전화로 안내드렸던 소개서 및 입점 가이드를 이메일로 보내드렸습니다. 내용 확인 후 회신 주시면 감사하겠습니다. 궁금하신 점 있으시면 언제든지 편하게 말씀해주세요 :)`,
      ];
    },
  },
];

export const getTemplatesByType = (type: "kakao" | "sms" | "email" | "all") => {
  if (type === "all") return FOLLOW_UP_TEMPLATES;
  return FOLLOW_UP_TEMPLATES.filter((template) => template.type === type);
};
