"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Recruit } from "@fsd/entities/recruit";
import { ApiError } from "@fsd/shared/api";
import { SiteHeader } from "@fsd/widgets/site-header";
import { getRecruits } from "../api/recruit.ts";

export const RecruitPage = () => {
  const [items, setItems] = useState<Recruit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getRecruits()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((caught) => {
        if (!active) return;
        setError(
          caught instanceof ApiError && caught.status === 401
            ? "로그인 후 취업 공고를 확인할 수 있습니다."
            : caught instanceof Error
              ? caught.message
              : "공고를 불러오지 못했습니다.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-5rem)] bg-[#f6f8f7] px-4 py-12 sm:px-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#02a946]">RECRUIT</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-950">
                GSM 취업 공고
              </h1>
              <p className="mt-3 text-sm text-gray-500">
                학교에 등록된 공개 채용 공고와 지원 일정을 확인하세요.
              </p>
            </div>
            <Link href="/forms" className="text-sm font-bold text-[#02C551]">
              신청 폼
            </Link>
          </div>

          {error ? (
            <div role="alert" className="mt-8 rounded-2xl bg-red-50 p-5 text-sm text-red-700">
              {error}
              {error.includes("로그인") ? (
                <Link href="/login" className="ml-2 font-bold underline">
                  로그인
                </Link>
              ) : null}
            </div>
          ) : null}

          <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
            {loading ? (
              <EmptyState text="취업 공고를 불러오는 중…" />
            ) : !Array.isArray(items) || items.length === 0 ? (
              <EmptyState text="현재 공개된 취업 공고가 없습니다." />
            ) : (
              items.map((item) => <RecruitCard key={item.id} item={item} />)
            )}
          </section>
        </div>
      </main>
    </>
  );
};
const RecruitCard = ({ item }: { item: Recruit }) => (
  <article className="flex min-h-80 flex-col rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
    <span className="w-fit rounded-full bg-[#eafff1] px-3 py-1 text-xs font-bold text-[#02a946]">
      채용 공고
    </span>
    <h2 className="mt-5 break-keep text-2xl font-bold text-gray-950">
      {item.companyName || "회사명 확인 중"}
    </h2>
    <p className="mt-3 line-clamp-4 flex-1 whitespace-pre-line break-keep text-sm leading-6 text-gray-600">
      {item.summary || "공고 요약이 없습니다."}
    </p>
    <dl className="mt-5 space-y-2 border-t border-gray-100 pt-5 text-sm">
      <div className="flex justify-between gap-3">
        <dt className="text-gray-400">지원 마감</dt>
        <dd className="font-semibold text-gray-700">{item.deadline || "별도 확인"}</dd>
      </div>
      <div className="flex justify-between gap-3">
        <dt className="text-gray-400">면접 일정</dt>
        <dd className="font-semibold text-gray-700">{item.interviewDate || "별도 확인"}</dd>
      </div>
    </dl>
    <Link
      href={`/recruit/${item.id}`}
      className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#02C551] text-sm font-bold text-white"
    >
      공고 확인 및 신청
    </Link>
  </article>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="col-span-full rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-20 text-center text-gray-400">
    {text}
  </div>
);
