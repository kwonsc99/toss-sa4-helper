"use client";

import { useState } from "react";
import { Template } from "@/constants/templates";
import { User } from "@/types";
import { Copy, Check, MessageCircle, Smartphone, Mail } from "lucide-react";
import Button from "@/components/common/Button";

interface TemplateCardProps {
  template: Template;
  user?: User; // user 추가
}

export default function TemplateCard({ template, user }: TemplateCardProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // 동적으로 콘텐츠 생성
  const content = template.getContent(user);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const getIcon = () => {
    switch (template.type) {
      case "kakao":
        return <MessageCircle size={20} className="text-yellow-600" />;
      case "sms":
        return <Smartphone size={20} className="text-green-600" />;
      case "email":
        return <Mail size={20} className="text-blue-600" />;
      default:
        return <MessageCircle size={20} className="text-gray-600" />;
    }
  };

  const getTypeColor = () => {
    switch (template.type) {
      case "kakao":
        return "bg-yellow-100 text-yellow-800";
      case "sms":
        return "bg-green-100 text-green-800";
      case "email":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">{template.title}</h3>
            <span
              className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getTypeColor()}`}
            >
              {template.type === "kakao"
                ? "카카오톡"
                : template.type === "sms"
                ? "문자"
                : "이메일"}
            </span>
          </div>
        </div>
      </div>

      {/* 번호별 텍스트와 복사 버튼 */}
      <div className="space-y-4">
        {content.map((text, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-600">
                {index + 1}번
              </span>
              <Button
                size="sm"
                variant={copiedIndex === index ? "secondary" : "primary"}
                onClick={() => copyToClipboard(text, index)}
                className="flex items-center space-x-1 ml-2 flex-shrink-0"
              >
                {copiedIndex === index ? (
                  <>
                    <Check size={12} />
                    <span className="text-xs">복사됨</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span className="text-xs">복사</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-medium leading-relaxed">
              {text}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
