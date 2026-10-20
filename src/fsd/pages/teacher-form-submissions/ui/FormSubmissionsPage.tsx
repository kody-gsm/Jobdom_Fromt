"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FiDownload, FiGrid } from "react-icons/fi";
import { TeacherHeader } from "@fsd/widgets/teacher-header";
import type { DynamicForm, FormSubmission } from "@fsd/entities/form";
import { FileDownload } from "@fsd/shared/ui";
import { downloadFormFile, getFormSubmissionSheet } from "../api/submissions";
import { exportSubmissions } from "../lib/exportSubmissions";
import { formatSubmissionDate, getAnswerText, getSpreadsheetColumnLabel } from "../model/submissionTable";

type SheetState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; form: DynamicForm; submissions: FormSubmission[] };

export function FormSubmissionsPage() {
  const { id } = useParams<{ id: string }>();
  return <SubmissionSheet key={id} formId={Number(id)} />;
}

function SubmissionSheet({ formId }: { formId: number }) {
  const [state, setState] = useState<SheetState>({ status: "loading" });
  const [retryCount, setRetryCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const exportInFlight = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    getFormSubmissionSheet(formId, controller.signal)
      .then(({ form, submissions }) => {
        if (!controller.signal.aborted) setState({ status: "ready", form, submissions });
      })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setState({ status: "error", message: caught instanceof Error ? caught.message : "응답을 불러오지 못했습니다." });
        }
      });
    return () => controller.abort();
  }, [formId, retryCount]);

  const download = async () => {
    if (state.status !== "ready" || exportInFlight.current) return;
    exportInFlight.current = true;
    setIsExporting(true);
    setExportError("");
    try {
      await exportSubmissions(state.form, state.submissions);
    } catch (caught) {
      setExportError(caught instanceof Error ? caught.message : "엑셀 파일을 다운로드하지 못했습니다. 다시 시도해주세요.");
    } finally {
      exportInFlight.current = false;
      setIsExporting(false);
    }
  };

  const form = state.status === "ready" ? state.form : null;
  const submissions = state.status === "ready" ? state.submissions : [];
  const questions = [...(form?.questions ?? [])].sort((first, second) => first.orderIndex - second.orderIndex);
  const headers = ["이름", "학번", "제출일시", ...questions.map((question) => question.title)];

  return (
    <>
      <TeacherHeader />
      <main className="min-h-[calc(100vh-5rem)] bg-[#f5f7f6] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1500px]">
          <Link href="/teacher/forms" className="text-sm font-semibold text-gray-500 hover:text-gray-900">← 신청 폼 관리</Link>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#028a3c]">신청 폼 응답</p>
              <h1 className="mt-2 wrap-anywhere text-2xl font-bold text-gray-950 sm:text-3xl">{form?.title || "폼 응답"}</h1>
              <p className="mt-2 text-sm text-gray-500">제출자별 답변을 표에서 한눈에 확인하세요.</p>
            </div>
            <button
              type="button"
              onClick={() => void download()}
              disabled={state.status !== "ready" || isExporting}
              aria-busy={isExporting}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#02a946] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#028a3c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02a946] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiDownload aria-hidden size={17} />
              {isExporting ? "엑셀 파일 준비 중…" : "엑셀 다운로드"}
            </button>
          </div>
          {exportError && <p role="alert" className="mt-5 wrap-anywhere rounded-xl bg-red-50 p-4 text-sm text-red-700">{exportError}</p>}

          <section aria-label="폼 응답 목록" aria-busy={state.status === "loading"} className="mt-7 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#cce4d5] bg-[#edf7f0] px-4 py-3">
              <div className="flex items-center gap-2.5 text-[#17633b]">
                <FiGrid aria-hidden size={18} />
                <h2 className="text-sm font-bold">응답 시트</h2>
                <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold tabular-nums">{submissions.length}건</span>
              </div>
              <p className="text-xs text-[#4f7860]">행: 제출자 · 열: 질문</p>
            </div>

            <div role="region" aria-label="가로로 스크롤하여 모든 답변 보기" tabIndex={0} className="max-h-[65vh] min-h-80 overflow-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#02a946]">
              <table className="w-full table-fixed border-separate border-spacing-0 text-left text-sm" style={{ minWidth: 528 + questions.length * 240 }}>
                <caption className="sr-only">{form?.title || "신청 폼"} 응답 목록. 각 행은 한 명의 제출자이며 각 열은 질문별 답변입니다.</caption>
                <colgroup>
                  <col className="w-12" />
                  <col className="w-40" />
                  <col className="w-32" />
                  <col className="w-48" />
                  {questions.map((question) => <col key={question.id} className="w-60" />)}
                </colgroup>
                <thead>
                  <tr aria-hidden="true" className="h-7 text-center font-mono text-[11px] text-gray-500">
                    <th className="sticky left-0 top-0 z-40 border-b border-r border-gray-200 bg-[#e8edea]" />
                    {headers.map((_, index) => (
                      <th key={index} className={`sticky top-0 border-b border-r border-gray-200 bg-[#f0f3f1] font-normal ${index === 0 ? "left-12 z-40" : "z-20"}`}>{getSpreadsheetColumnLabel(index)}</th>
                    ))}
                  </tr>
                  <tr className="text-xs font-bold text-gray-600">
                    <th scope="col" className="sticky left-0 top-7 z-40 border-b border-r border-gray-200 bg-[#edf3ef] px-2 py-4 text-center">#</th>
                    {headers.map((header, index) => (
                      <th key={index} scope="col" className={`sticky top-7 border-b border-r border-gray-200 bg-[#f5f8f6] px-4 py-4 align-top wrap-anywhere ${index === 0 ? "left-12 z-40" : "z-20"}`}>
                        {index >= 3 && <span className="mb-1 block text-[10px] font-medium text-gray-400">질문 {index - 2}</span>}
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission, rowIndex) => {
                    const answers = new Map(submission.answers.map((answer) => [answer.questionId, answer]));
                    return (
                      <tr key={submission.id} className="group text-gray-700">
                        <td className="sticky left-0 z-10 border-b border-r border-gray-200 bg-[#f5f7f6] px-2 py-4 text-center font-mono text-xs tabular-nums text-gray-400 group-hover:bg-[#eaf6ee]">{rowIndex + 1}</td>
                        <th scope="row" className="sticky left-12 z-10 border-b border-r border-gray-200 bg-white px-4 py-4 align-top font-semibold text-gray-900 wrap-anywhere group-hover:bg-[#f2faf5]">{submission.userName}</th>
                        <td className="border-b border-r border-gray-200 px-4 py-4 align-top tabular-nums wrap-anywhere group-hover:bg-[#f7fbf8]">{submission.studentNumber || "—"}</td>
                        <td className="border-b border-r border-gray-200 px-4 py-4 align-top text-xs leading-6 tabular-nums text-gray-500 group-hover:bg-[#f7fbf8]"><time dateTime={submission.submittedAt}>{formatSubmissionDate(submission.submittedAt)}</time></td>
                        {questions.map((question) => {
                          const answer = answers.get(question.id);
                          const fileId = answer?.fileId;
                          return (
                            <td key={question.id} className="border-b border-r border-gray-200 px-4 py-4 align-top leading-6 wrap-anywhere group-hover:bg-[#f7fbf8]">
                              {answer && (answer.fileId !== null || answer.fileName) ? (
                                <FileDownload key={`${submission.id}:${question.id}:${fileId}`} fileName={answer.fileName || "첨부 파일"} downloadFile={fileId ? () => downloadFormFile(fileId) : undefined} />
                              ) : <span className="whitespace-pre-wrap">{getAnswerText(answer) || "—"}</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {state.status === "loading" && <p role="status" className="sticky left-0 px-6 py-24 text-center text-sm text-gray-400">응답을 불러오는 중…</p>}
              {state.status === "error" && (
                <div className="sticky left-0 px-6 py-20 text-center">
                  <p role="alert" className="wrap-anywhere text-sm text-red-700">{state.message}</p>
                  <button type="button" onClick={() => { setState({ status: "loading" }); setRetryCount((count) => count + 1); }} className="mt-4 min-h-11 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">다시 불러오기</button>
                </div>
              )}
              {state.status === "ready" && submissions.length === 0 && <p className="sticky left-0 px-6 py-24 text-center text-sm text-gray-400">제출된 응답이 없습니다.</p>}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-[#f6f8f7] px-4 py-2">
              <span className="inline-flex items-center gap-2 border-b-2 border-[#02a946] px-3 py-2 text-xs font-bold text-[#17633b]"><FiGrid aria-hidden size={14} />전체 응답</span>
              <p className="text-xs tabular-nums text-gray-500">{submissions.length}개 응답 · {questions.length}개 질문</p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
