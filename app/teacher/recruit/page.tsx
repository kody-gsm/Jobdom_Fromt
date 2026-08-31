"use client";

import Link from "next/link";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Header } from "@/app/components/organisms";
import {
  ApiError,
  Recruit,
  RecruitUpdate,
  analyzeRecruit,
  getTeacherRecruits,
  publishRecruit,
  updateRecruit,
} from "@/app/utils/api";

const blank: RecruitUpdate = { companyName: "", interviewDate: "", deadline: "", summary: "" };

export default function TeacherRecruitPage() {
  const [items, setItems] = useState<Recruit[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<RecruitUpdate>(blank);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await getTeacherRecruits());
    } catch (caught) {
      setMessage({ text: caught instanceof ApiError && (caught.status === 401 || caught.status === 403) ? "선생님 계정으로 로그인해야 공고를 관리할 수 있습니다." : caught instanceof Error ? caught.message : "공고를 불러오지 못했습니다.", error: true });
    }
  }, []);

  useEffect(() => {
    getTeacherRecruits()
      .then(setItems)
      .catch((caught) => setMessage({ text: caught instanceof ApiError && (caught.status === 401 || caught.status === 403) ? "선생님 계정으로 로그인해야 공고를 관리할 수 있습니다." : caught instanceof Error ? caught.message : "공고를 불러오지 못했습니다.", error: true }));
  }, []);

  const select = (item: Recruit) => {
    setSelectedId(item.id);
    setForm({ companyName: item.companyName || "", interviewDate: item.interviewDate || "", deadline: item.deadline || "", summary: item.summary || "" });
    setMessage(null);
  };

  const analyze = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return setMessage({ text: "이미지는 10MB 이하만 업로드할 수 있습니다.", error: true });
    try {
      setWorking(true);
      setMessage({ text: "AI가 이미지에서 공고 내용을 읽고 있습니다." });
      const result = await analyzeRecruit(file);
      select(result);
      await load();
      setMessage({ text: "초안을 만들었습니다. 내용을 확인한 뒤 저장하거나 공개해주세요." });
    } catch (caught) {
      setMessage({ text: caught instanceof Error ? caught.message : "이미지 분석에 실패했습니다.", error: true });
    } finally {
      setWorking(false);
      event.target.value = "";
    }
  };

  const save = async () => {
    if (!selectedId) return;
    if (Object.values(form).some((value) => !value?.trim())) {
      return setMessage({ text: "회사명, 면접 일정, 지원 마감, 공고 요약을 모두 입력해주세요.", error: true });
    }
    try {
      setWorking(true);
      const updated = await updateRecruit(selectedId, form);
      select(updated);
      await load();
      setMessage({ text: "공고 초안을 저장했습니다." });
    } catch (caught) {
      setMessage({ text: caught instanceof Error ? caught.message : "공고 저장에 실패했습니다.", error: true });
    } finally {
      setWorking(false);
    }
  };

  const publish = async () => {
    if (!selectedId) return;
    if (Object.values(form).some((value) => !value?.trim())) {
      return setMessage({ text: "회사명, 면접 일정, 지원 마감, 공고 요약을 모두 입력해주세요.", error: true });
    }
    try {
      setWorking(true);
      await updateRecruit(selectedId, form);
      const published = await publishRecruit(selectedId);
      select(published);
      await load();
      const link = `${window.location.origin}/recruit/${published.id}/apply`;
      await navigator.clipboard.writeText(link).catch(() => undefined);
      setMessage({ text: "공고를 공개했고 학생 신청 링크를 복사했습니다." });
    } catch (caught) {
      setMessage({ text: caught instanceof Error ? caught.message : "공고 공개에 실패했습니다.", error: true });
    } finally {
      setWorking(false);
    }
  };

  const update = (key: keyof RecruitUpdate, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-5rem)] bg-[#f5f7f6] px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-950">취업 공고 관리</h1>
            </div>
            <div className="flex gap-4 text-sm font-semibold text-[#02C551]"><Link href="/teacher/forms">폼 관리</Link><Link href="/recruit">학생 공고 화면 →</Link></div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[330px_1fr]">
            <aside className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <label className={`flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-green-200 bg-[#f3fff7] px-5 text-center ${working ? "pointer-events-none opacity-60" : ""}`}>
                <strong className="text-[#02a946]">공고 이미지 올리기</strong>
                <input type="file" accept="image/png,image/jpeg,image/webp,image/heic,image/heif" onChange={analyze} className="sr-only" />
              </label>
              <h2 className="mt-6 font-bold text-gray-900">공고 목록</h2>
              <div className="mt-3 max-h-[520px] space-y-2 overflow-y-auto">
                {items.length === 0 ? <p className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-400">등록된 공고가 없습니다.</p> : items.map((item) => (
                  <button key={item.id} type="button" onClick={() => select(item)} className={`w-full rounded-xl border p-4 text-left ${selectedId === item.id ? "border-[#02C551] bg-green-50" : "border-gray-100 hover:border-green-200"}`}>
                    <span className={`text-xs font-bold ${item.status === "PUBLISHED" ? "text-[#02a946]" : "text-amber-600"}`}>{item.status === "PUBLISHED" ? "공개" : "초안"}</span>
                    <strong className="mt-1 block truncate text-gray-900">{item.companyName || "회사명 미입력"}</strong>
                  </button>
                ))}
              </div>
            </aside>

            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold">공고 양식</h2>
                {selectedId && <span className="text-xs text-gray-400">공고 #{selectedId}</span>}
              </div>
              {!selectedId ? <div className="mt-8 grid min-h-96 place-items-center rounded-2xl bg-gray-50 px-6 text-center text-sm leading-6 text-gray-400">공고를 선택해주세요.</div> : (
                <div className="mt-7 space-y-5">
                  <Field label="회사명" value={form.companyName || ""} onChange={(value) => update("companyName", value)} />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="면접 일정" value={form.interviewDate || ""} onChange={(value) => update("interviewDate", value)} />
                    <Field label="지원 마감" value={form.deadline || ""} onChange={(value) => update("deadline", value)} />
                  </div>
                  <label className="block text-sm font-semibold text-gray-700">공고 요약
                    <textarea required maxLength={1000} value={form.summary || ""} onChange={(event) => update("summary", event.target.value)} className="mt-2 min-h-52 w-full resize-y rounded-xl border border-gray-200 p-4 font-normal leading-6 outline-none focus:border-[#02C551]" />
                  </label>
                  <div className="flex flex-wrap justify-end gap-3">
                    <button type="button" disabled={working} onClick={save} className="h-12 rounded-xl bg-gray-100 px-6 font-semibold text-gray-700 disabled:opacity-50">초안 저장</button>
                    <button type="button" disabled={working} onClick={publish} className="h-12 rounded-xl bg-[#02C551] px-7 font-bold text-white disabled:bg-gray-300">공개하고 링크 복사</button>
                  </div>
                </div>
              )}
              {message && <p role="status" className={`mt-6 rounded-xl px-4 py-3 text-sm leading-6 ${message.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"}`}>{message.text}</p>}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-sm font-semibold text-gray-700">{label}<input required value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 font-normal outline-none focus:border-[#02C551]" /></label>;
}
