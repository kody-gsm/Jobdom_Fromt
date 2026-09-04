"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@fsd/widgets/site-header";
import type { DynamicForm, FormSubmission, FormSubmissionSummary } from "@fsd/entities/form";
import { getFormSubmission, getFormSubmissions, getTeacherForm } from "../api/submissions";

export function FormSubmissionsPage() {
  const { id } = useParams<{ id: string }>();
  const formId = Number(id);
  const [form, setForm] = useState<DynamicForm | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmissionSummary[]>([]);
  const [selected, setSelected] = useState<FormSubmission | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getTeacherForm(formId), getFormSubmissions(formId)])
      .then(([loadedForm, loadedSubmissions]) => {
        setForm(loadedForm);
        setSubmissions(loadedSubmissions);
        if (loadedSubmissions[0]) getFormSubmission(formId, loadedSubmissions[0].id).then(setSelected).catch((caught) => setError(caught instanceof Error ? caught.message : "응답을 불러오지 못했습니다."));
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "응답을 불러오지 못했습니다."));
  }, [formId]);

  const open = async (submissionId: number) => {
    try {
      setSelected(await getFormSubmission(formId, submissionId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "응답을 불러오지 못했습니다.");
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-5rem)] bg-[#f5f7f6] px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-6xl">
          <Link href="/teacher/forms" className="text-sm font-semibold text-gray-500">← 폼 관리</Link>
          <h1 className="mt-5 text-3xl font-bold text-gray-950">{form?.title || "폼 응답"}</h1>
          {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
          <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
            <aside className="rounded-3xl bg-white p-5 shadow-sm">
              <h2 className="font-bold">제출 {submissions.length}건</h2>
              <div className="mt-4 space-y-2">
                {submissions.length === 0 ? <p className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-400">제출된 응답이 없습니다.</p> : submissions.map((submission) => (
                  <button key={submission.id} type="button" onClick={() => open(submission.id)} className={`w-full rounded-xl border p-4 text-left ${selected?.id === submission.id ? "border-[#02C551] bg-green-50" : "border-gray-100"}`}><strong className="block text-gray-900">{submission.userName}</strong><span className="mt-1 block text-sm text-gray-500">{submission.studentNumber}</span><time className="mt-2 block text-xs text-gray-400">{new Date(submission.submittedAt).toLocaleString("ko-KR")}</time></button>
                ))}
              </div>
            </aside>
            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              {!selected ? <div className="grid min-h-80 place-items-center text-sm text-gray-400">응답을 선택해주세요.</div> : <><div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-100 pb-5"><div><h2 className="text-2xl font-bold">{selected.userName}</h2><p className="mt-1 text-sm text-gray-500">{selected.studentNumber}</p></div><time className="text-sm text-gray-400">{new Date(selected.submittedAt).toLocaleString("ko-KR")}</time></div><div className="mt-6 space-y-4">{selected.answers.map((answer) => <article key={answer.questionId} className="rounded-2xl bg-gray-50 p-5"><h3 className="text-sm font-semibold text-gray-500">{answer.questionTitle}</h3><p className="mt-2 whitespace-pre-line text-gray-900">{answer.selectedOptionLabels.length ? answer.selectedOptionLabels.join(", ") : answer.textValue}</p></article>)}</div></>}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
