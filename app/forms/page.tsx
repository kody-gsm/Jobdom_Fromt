"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/app/components/organisms/Header";
import { ApiError, FormSummary, getForms } from "@/app/utils/api";

export default function FormsPage() {
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getForms()
      .then(setForms)
      .catch((caught) => setError(caught instanceof ApiError && caught.status === 401 ? "로그인이 필요합니다." : caught instanceof Error ? caught.message : "폼을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-5rem)] bg-[#f6f8f7] px-4 py-12 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-4xl font-bold text-gray-950">신청 폼</h1>
            <Link href="/recruit" className="text-sm font-semibold text-[#02C551]">취업 공고</Link>
          </div>

          {error && <p role="alert" className="mt-8 rounded-2xl bg-red-50 p-5 text-sm text-red-700">{error}</p>}
          <section className="mt-8 grid gap-5 sm:grid-cols-2" aria-live="polite">
            {loading ? <Empty text="불러오는 중…" /> : forms.length === 0 ? <Empty text="공개된 폼이 없습니다." /> : forms.map((form) => (
              <article key={form.id} className="flex min-h-56 flex-col rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                <h2 className="break-keep text-2xl font-bold text-gray-950">{form.title}</h2>
                {form.description && <p className="mt-3 flex-1 whitespace-pre-line break-keep text-sm leading-6 text-gray-600">{form.description}</p>}
                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5 text-sm">
                  <span className="text-gray-400">질문 {form.questionCount}개</span>
                  <Link href={`/forms/${form.id}`} className="rounded-xl bg-[#02C551] px-5 py-3 font-bold text-white">응답하기</Link>
                </div>
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
