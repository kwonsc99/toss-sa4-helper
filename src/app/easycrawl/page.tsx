"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Copy, Download, Upload, RefreshCw, Settings, X } from "lucide-react";
import Header from "@/components/layout/Header";

export default function EasyCrawlPage() {
  const [jsonOutput, setJsonOutput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showSetupModal, setShowSetupModal] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("✅ 클립보드에 복사되었습니다!");
    } catch (err) {
      alert("❌ 복사 실패. 다시 시도해주세요.");
    }
  };

  const generateBookmarkCode = (type: "collect" | "reset" | "export") => {
    const codes = {
      collect: `javascript:(function(){let allLinks=window.coupangLinks||[];const links=new Set();function normalizeUrl(href){if(!href||!href.includes("/vp/products/"))return null;let cleanUrl=href.split("?")[0].split("#")[0];cleanUrl=cleanUrl.replace(/\\/+/g,"/");if(cleanUrl.startsWith("//www.coupang.com")){return"https:"+cleanUrl}if(cleanUrl.startsWith("/www.coupang.com")){return"https://"+cleanUrl.substring(1)}if(cleanUrl.startsWith("/vp/products/")){return"https://www.coupang.com"+cleanUrl}if(cleanUrl.includes("www.coupang.com")&&cleanUrl.includes("/vp/products/")){if(!cleanUrl.startsWith("http")){cleanUrl="https://"+cleanUrl}return cleanUrl.replace(/([^:]\\/)\\//g,"$1")}return null}document.querySelectorAll("a").forEach(a=>{const href=a.getAttribute("href");const normalized=normalizeUrl(href);if(normalized){links.add(normalized)}});const newLinks=Array.from(links);allLinks=allLinks.concat(newLinks);window.coupangLinks=allLinks;const uniqueTotal=new Set(allLinks).size;console.log("🎉 현재 페이지: "+newLinks.length+"개\\n📊 총 수집: "+allLinks.length+"개\\n✨ 고유 링크: "+uniqueTotal+"개");if(newLinks.length>0){console.log("✅ 링크 샘플:",newLinks.slice(0,3))}else{console.log("❌ 이 페이지에서 상품 링크를 찾을 수 없습니다")}alert("✅ "+newLinks.length+"개 링크 수집!\\n\\n📊 총 누적: "+allLinks.length+"개\\n✨ 고유 링크: "+uniqueTotal+"개\\n\\n"+(newLinks.length>0?"다음 페이지로 이동 후 다시 클릭하세요!":"상품이 없는 페이지입니다. 검색 결과나 카테고리 페이지에서 시도하세요."));})();`,

      reset: `javascript:(function(){window.coupangLinks=[];console.clear();console.log("🔄 쿠팡 링크 수집기 초기화 완료!");alert("초기화 완료!\\n새로운 수집을 시작할 수 있습니다.");})();`,

      export: `javascript:(function(){const allLinks=window.coupangLinks||[];if(allLinks.length===0){alert("❌ 수집된 링크가 없습니다!\\n\\n먼저 '쿠팡 링크 수집' 북마클릿으로\\n링크를 수집해주세요.");return}const uniqueLinks=[...new Set(allLinks)];const webScraperJSON={_id:"coupang_sitemap",startUrl:uniqueLinks,selectors:[{id:"상호 및 대표자",type:"SelectorText",selector:".product-item__table tr:nth-of-type(1) td:nth-of-type(1)",multiple:false,parentSelectors:["_root"]},{id:"주소지",type:"SelectorText",selector:".product-item__table tr:nth-of-type(1) td:nth-of-type(2)",multiple:false,parentSelectors:["_root"]},{id:"이메일",type:"SelectorText",selector:".product-item__table tr:nth-of-type(2) td:nth-of-type(1)",multiple:false,parentSelectors:["_root"]},{id:"연락처",type:"SelectorText",selector:".prod-delivery-return-policy-table tr:nth-of-type(2) td:nth-of-type(2)",multiple:false,parentSelectors:["_root"]},{id:"사업자번호",type:"SelectorText",selector:".prod-delivery-return-policy-table tr:nth-of-type(3) td:nth-of-type(2)",multiple:false,parentSelectors:["_root"]}]};navigator.clipboard.writeText(JSON.stringify(webScraperJSON,null,2)).then(()=>{alert("🎯 Web Scraper JSON이 클립보드에 복사되었습니다!\\n\\n📊 총 "+uniqueLinks.length+"개 링크 포함\\n\\n이제 Web Scraper에서:\\n1. Import Sitemap 클릭\\n2. Ctrl+V로 붙여넣기\\n3. Import 실행")}).catch(()=>{alert("❌ 클립보드 복사 실패\\n수동으로 복사해주세요.")});})();`,
    };
    return codes[type];
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(files);
  };

  const processDuplicateRemoval = async () => {
    if (uploadedFiles.length === 0) {
      alert("엑셀 파일을 선택해주세요.");
      return;
    }

    try {
      // 여기서는 클라이언트 사이드에서 XLSX 라이브러리를 사용
      // 실제 구현에서는 xlsx 라이브러리를 import 해야 합니다
      alert("파일 처리 기능은 xlsx 라이브러리 설치 후 구현됩니다.");
    } catch (error) {
      alert("파일 처리 중 오류가 발생했습니다.");
    }
  };

  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
      return;
    }
  }, [user, isLoading, router]);

  // 로딩 중이거나 사용자가 없으면 로딩 화면
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-xl font-semibold text-toss-gray">
            {isLoading ? "로딩 중..." : "인증 확인 중..."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={logout} />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
              🚀 쿠팡 반자동 크롤링 도구
            </h1>

            {/* Web Scraper 설정 안내 */}
            <div className="mb-8 p-6 bg-red-50 rounded-lg border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-red-800">
                  ⚠️ 시작하기 전 필수 설정
                </h2>
                <button
                  onClick={() => setShowSetupModal(true)}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded text-sm"
                >
                  <Settings size={16} />
                  설정 방법 보기
                </button>
              </div>
              <p className="text-red-700 text-sm">
                Web Scraper 확장프로그램 설치와 개발자 도구 설정이 필요합니다.
                <span className="font-semibold"> 설정 방법 보기</span> 버튼을
                클릭하여 설정을 완료하세요.
              </p>
            </div>

            {/* 단계별 가이드 */}
            <div className="mb-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h2 className="text-xl font-semibold mb-4 text-blue-800">
                📋 사용 가이드
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <p>아래 북마클릿들을 북마크바에 드래그합니다.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <p>
                    각 북마클릿 코드를 복사하고, 해당하는 북마클릿을 우클릭 -
                    수정 - url 입력칸에 붙여넣기 합니다.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <p>
                    쿠팡에서 원하는 카테고리를 검색하여 해당 페이지로 이동하세요
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <p>"🔗 링크 수집" 북마클릿을 클릭하여 링크를 수집하세요</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    5
                  </span>
                  <p>여러 페이지에서 반복하여 링크를 수집하세요</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    6
                  </span>
                  <p>
                    "📤 W내보내기" 북마클릿으로 JSON을 클립보드에 복사하세요
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    7
                  </span>
                  <p>
                    개발자도구(F12)를 누르고, Web Scraper에서 "Create New
                    Sitemap" →"Import Sitemap" → 붙여넣기 → Import Sitemap 버튼
                    클릭 → Sitemap 클릭 → Scrape 클릭
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    8
                  </span>
                  <p>
                    크롤링이 끝나면 Export Data → xlsx로 다운로드 → 아래
                    사업자번호 중복제거기에 파일을 넣어 중복제거
                  </p>
                </div>
              </div>
            </div>

            {/* 북마클릿 섹션 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                🔖 북마클릿 도구
              </h2>

              <div className="grid gap-4 md:grid-cols-3">
                {/* 링크 수집 */}
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">
                    🔗 링크 수집
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    현재 페이지의 쿠팡 상품 링크를 수집합니다
                  </p>
                  <a
                    href={generateBookmarkCode("collect")}
                    className="block w-full text-center bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm"
                    onClick={(e) => e.preventDefault()}
                  >
                    🔗 링크 수집
                  </a>
                  <div className="space-y-2">
                    <button
                      onClick={() =>
                        copyToClipboard(generateBookmarkCode("collect"))
                      }
                      className="w-full flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-800 py-2 px-4 rounded text-sm"
                    >
                      <Copy size={16} />
                      코드 복사
                    </button>
                  </div>
                </div>

                {/* 초기화 */}
                <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <h3 className="font-semibold text-yellow-800 mb-2">
                    🔄 초기화
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    수집된 링크를 모두 초기화합니다
                  </p>
                  <a
                    href={generateBookmarkCode("reset")}
                    className="block w-full text-center bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded text-sm"
                    onClick={(e) => e.preventDefault()}
                  >
                    🔄 초기화
                  </a>
                  <div className="space-y-2">
                    <button
                      onClick={() =>
                        copyToClipboard(generateBookmarkCode("reset"))
                      }
                      className="w-full flex items-center justify-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-2 px-4 rounded text-sm"
                    >
                      <Copy size={16} />
                      코드 복사
                    </button>
                  </div>
                </div>

                {/* Web Scraper 내보내기 */}
                <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-2">
                    📤 Web Scraper 내보내기
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Web Scraper용 JSON을 복사합니다
                  </p>
                  <a
                    href={generateBookmarkCode("export")}
                    className="block w-full text-center bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded text-sm"
                    onClick={(e) => e.preventDefault()}
                  >
                    📤 내보내기
                  </a>

                  <div className="space-y-2">
                    <button
                      onClick={() =>
                        copyToClipboard(generateBookmarkCode("export"))
                      }
                      className="w-full flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-800 py-2 px-4 rounded text-sm"
                    >
                      <Copy size={16} />
                      코드 복사
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 중복 제거 섹션 */}
            <div className="mt-12 p-6 bg-gray-50 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                🗂️ 사업자번호 중복 제거
              </h2>
              <p className="text-gray-600 mb-4">
                Web Scraper로 추출한 엑셀 파일에서 사업자번호 중복을 제거합니다
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    엑셀 파일 선택 (여러 파일 선택 가능)
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    multiple
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded border">
                    <p className="text-sm text-blue-800">
                      선택된 파일: {uploadedFiles.length}개
                    </p>
                    <ul className="text-xs text-blue-600 mt-1">
                      {uploadedFiles.map((file, index) => (
                        <li key={index}>• {file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={processDuplicateRemoval}
                  disabled={uploadedFiles.length === 0}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-6 rounded"
                >
                  <RefreshCw size={16} />
                  중복 제거 및 다운로드
                </button>
              </div>
            </div>

            {/* 사용 팁 */}
            <div className="mt-8 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
              <h3 className="font-semibold text-amber-800 mb-2">💡 사용 팁</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• 북마클릿은 브라우저 북마크바에 드래그하여 저장하세요</li>
                <li>
                  • 쿠팡의 여러 카테고리 페이지에서 링크를 수집할 수 있습니다
                </li>
                <li>• Web Scraper 확장프로그램이 설치되어 있어야 합니다</li>
                <li>• 크롤링 시 페이지 로딩 시간을 충분히 두세요 (2-3초)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Web Scraper 설정 모달 */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                🛠️ Web Scraper 설정 방법
              </h2>
              <button
                onClick={() => setShowSetupModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 1단계: 확장프로그램 설치 */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    1
                  </span>
                  Web Scraper 확장프로그램 설치
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    아래 링크를 클릭하여 Chrome Web Store에서 Web Scraper
                    확장프로그램을 설치하세요.
                  </p>
                  <a
                    href="https://chromewebstore.google.com/detail/web-scraper-free-web-scra/jnhgnonknehpejjnehehllkliplmbmhn?hl=ko"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
                  >
                    🔗 Web Scraper 설치하러 가기
                  </a>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-xs text-gray-600">
                      💡 팁: 확장프로그램 설치 후 브라우저를 새로고침하거나
                      재시작하세요.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2단계: 개발자 도구 설정 */}
              <div className="border rounded-lg p-4 bg-green-50">
                <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    2
                  </span>
                  개발자 도구 위치 설정
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700 font-semibold">
                    ⚠️ 중요: Web Scraper를 사용하려면 개발자 도구를 화면
                    아래쪽에 배치해야 합니다.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>F12 키를 눌러 개발자 도구를 엽니다</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>
                        개발자 도구 우상단의 점 3개 메뉴(⋮)를 클릭합니다
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>
                        "Dock side" 옵션에서 하단 배치(⬇️) 아이콘을 선택합니다
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>개발자 도구가 화면 아래쪽에 위치하게 됩니다</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-xs text-gray-600">
                      💡 팁: 개발자 도구가 오른쪽이나 별도 창에 있으면 Web
                      Scraper 탭이 보이지 않을 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3단계: Web Scraper 탭 확인 */}
              <div className="border rounded-lg p-4 bg-purple-50">
                <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    3
                  </span>
                  Web Scraper 탭 확인
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    설치와 설정이 완료되면 개발자 도구에서 "Web Scraper" 탭을
                    확인할 수 있습니다.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span>
                        개발자 도구를 열고 상단 탭에서 "Web Scraper"를 찾습니다
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span>
                        탭이 보이지 않으면 "&gt;&gt;" 버튼을 클릭하여 더 많은
                        탭을 확인하세요
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span>
                        Web Scraper 탭을 클릭하면 크롤링 도구를 사용할 수
                        있습니다
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 완료 버튼 */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={() => setShowSetupModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded"
                >
                  설정 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
