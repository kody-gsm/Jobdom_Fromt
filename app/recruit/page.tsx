"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/app/components/organisms";
import { ApiError, Recruit, getRecruits } from "@/app/utils/api";

export default function RecruitPage() {
  const [items, setItems] = useState<Recruit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRecruits()
      .then(setItems)
      .catch((caught) => setError(caught instanceof ApiError && caught.status === 401 ? "로그인 후 취업 공고를 확인할 수 있습니다." : caught instanceof Error ? caught.message : "공고를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-5rem)] bg-[#f6f8f7] px-4 py-12 sm:px-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-4xl font-bold tracking-tight text-gray-950">GSM 취업 공고</h1>
            <Link href="/forms" className="text-sm font-semibold text-[#02C551]">신청 폼</Link>
          </div>

          {error && <div role="alert" className="mt-8 rounded-2xl bg-red-50 p-5 text-sm text-red-700">{error} {error.includes("로그인") && <Link href="/login" className="ml-2 font-bold underline">로그인</Link>}</div>}

          <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
            {loading ? <Empty text="취업 공고를 불러오는 중…" /> : !Array.isArray(items) || items.length === 0 ? <Empty text="현재 공개된 취업 공고가 없습니다." /> : items.map((item) => (
              <article key={item.id} className="flex min-h-80 flex-col rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                <span className="w-fit rounded-full bg-[#eafff1] px-3 py-1 text-xs font-bold text-[#02a946]">채용 공고</span>
                <h2 className="mt-5 break-keep text-2xl font-bold text-gray-950">{item.companyName || "회사명 확인 중"}</h2>
                <p className="mt-3 line-clamp-4 flex-1 whitespace-pre-line break-keep text-sm leading-6 text-gray-600">{item.summary || "공고 요약이 없습니다."}</p>
                <dl className="mt-5 space-y-2 border-t border-gray-100 pt-5 text-sm">
                  <div className="flex justify-between gap-3"><dt className="text-gray-400">지원 마감</dt><dd className="font-semibold text-gray-700">{item.deadline || "별도 확인"}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-gray-400">면접 일정</dt><dd className="font-semibold text-gray-700">{item.interviewDate || "별도 확인"}</dd></div>
                </dl>
                <Link href={`/recruit/${item.id}`} className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#02C551] text-sm font-bold text-white">공고 확인 및 신청</Link>
              </article>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="col-span-full rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-20 text-center text-gray-400">{text}</div>;
}
