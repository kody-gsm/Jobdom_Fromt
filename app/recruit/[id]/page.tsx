"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/app/components/organisms";
import { Recruit, getRecruit } from "@/app/utils/api";

export default function RecruitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Recruit | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getRecruit(Number(id))
      .then((data) => {
        setItem(data);
        document.title = `${data.companyName || "취업 공고"} | 잡담`;
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "공고를 불러오지 못했습니다."));
  }, [id]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/recruit/${id}/apply`);
    setCopied(true);
  };

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-5rem)] bg-[#f6f8f7] px-4 py-10 sm:px-6">
        <article className="mx-auto w-full max-w-3xl rounded-3xl border border-gray-100 bg-white p-7 shadow-sm sm:p-10">
          <Link href="/recruit" className="text-sm font-semibold text-gray-500 hover:text-gray-900">← 공고 목록</Link>
          {error ? <p role="alert" className="mt-8 rounded-2xl bg-red-50 p-5 text-red-700">{error}</p> : !item ? <p className="py-20 text-center text-gray-400">공고를 불러오는 중…</p> : (
            <>
              <span className="mt-8 inline-flex rounded-full bg-[#eafff1] px-3 py-1 text-xs font-bold text-[#02a946]">공개 공고</span>
              <h1 className="mt-4 break-keep text-4xl font-bold tracking-tight text-gray-950">{item.companyName || "회사명 확인 중"}</h1>
              <dl className="mt-8 grid gap-4 rounded-2xl bg-gray-50 p-5 sm:grid-cols-2">
                <div><dt className="text-xs font-semibold text-gray-400">지원 마감</dt><dd className="mt-2 font-bold text-gray-800">{item.deadline || "별도 확인"}</dd></div>
                <div><dt className="text-xs font-semibold text-gray-400">면접 일정</dt><dd className="mt-2 font-bold text-gray-800">{item.interviewDate || "별도 확인"}</dd></div>
              </dl>
              <section className="mt-8">
                <h2 className="text-lg font-bold text-gray-900">공고 내용</h2>
                <p className="mt-3 whitespace-pre-line break-keep leading-8 text-gray-600">{item.summary || "공고 요약이 없습니다."}</p>
              </section>
              <div className="mt-10 grid gap-3 sm:grid-cols-[1fr_auto]">
                <Link href="/forms" className="inline-flex h-13 items-center justify-center rounded-xl bg-[#02C551] px-6 font-bold text-white">신청 폼 보기</Link>
                <button type="button" onClick={copyLink} className="h-13 rounded-xl border border-gray-200 px-6 font-semibold text-gray-600">{copied ? "신청 링크 복사됨" : "신청 링크 복사"}</button>
              </div>
            </>
          )}
        </article>
      </main>
    </>
  );
}
