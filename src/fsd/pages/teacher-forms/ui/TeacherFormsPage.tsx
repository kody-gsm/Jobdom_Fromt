"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SiteHeader } from "@fsd/widgets/site-header";
import type {
  DynamicForm,
  FormInput,
  FormQuestionInput,
  FormStatus,
  FormSummary,
  QuestionType,
} from "@fsd/entities/form";
import {
  closeForm,
  createForm,
  getTeacherForm,
  getTeacherForms,
  publishForm,
  updateForm,
} from "../api/forms";

type DraftQuestion = FormQuestionInput & { key: string };

const questionTypes: { value: QuestionType; label: string }[] = [
  { value: "SHORT_TEXT", label: "단답형" },
  { value: "LONG_TEXT", label: "장문형" },
  { value: "SINGLE_CHOICE", label: "객관식" },
  { value: "MULTIPLE_CHOICE", label: "체크박스" },
  { value: "DROPDOWN", label: "드롭다운" },
  { value: "NUMBER", label: "숫자" },
  { value: "DATE", label: "날짜" },
];

const hasOptions = (type: QuestionType) => ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN"].includes(type);
const newQuestion = (): DraftQuestion => ({ key: crypto.randomUUID(), type: "SHORT_TEXT", title: "", description: "", required: false, options: [] });

export function TeacherFormsPage() {
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [status, setStatus] = useState<FormStatus>("DRAFT");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>(() => [newQuestion()]);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const load = useCallback(async () => {
    try {
      setForms(await getTeacherForms());
    } catch (caught) {
      setMessage({ text: caught instanceof Error ? caught.message : "폼을 불러오지 못했습니다.", error: true });
    }
  }, []);

  useEffect(() => {
    getTeacherForms()
      .then(setForms)
      .catch((caught) => setMessage({ text: caught instanceof Error ? caught.message : "폼을 불러오지 못했습니다.", error: true }));
  }, []);

  const edit = (form: DynamicForm) => {
    setSelectedId(form.id);
    setStatus(form.status);
    setTitle(form.title);
    setDescription(form.description || "");
    setQuestions(form.questions.map((question) => ({
      key: String(question.id),
      type: question.type,
      title: question.title,
      description: question.description || "",
      required: question.required,
      options: question.options.map((option) => option.label),
    })));
    setMessage(null);
  };

  const select = async (id: number) => {
    try {
      setWorking(true);
      edit(await getTeacherForm(id));
    } catch (caught) {
      setMessage({ text: caught instanceof Error ? caught.message : "폼을 불러오지 못했습니다.", error: true });
    } finally {
      setWorking(false);
    }
  };

  const reset = () => {
    setSelectedId(null);
    setStatus("DRAFT");
    setTitle("");
    setDescription("");
    setQuestions([newQuestion()]);
    setMessage(null);
  };

  const updateQuestion = (index: number, changes: Partial<DraftQuestion>) =>
    setQuestions((current) => current.map((question, questionIndex) => questionIndex === index ? { ...question, ...changes } : question));

  const moveQuestion = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= questions.length) return;
    setQuestions((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const payload = (): FormInput | null => {
    if (!title.trim()) return setMessage({ text: "폼 제목을 입력해주세요.", error: true }), null;
    if (questions.length === 0) return setMessage({ text: "질문을 1개 이상 추가해주세요.", error: true }), null;
    if (questions.some((question) => !question.title.trim())) return setMessage({ text: "질문 제목을 모두 입력해주세요.", error: true }), null;
    if (questions.some((question) => hasOptions(question.type) && !question.options.some((option) => option.trim()))) return setMessage({ text: "선택형 질문에 보기를 추가해주세요.", error: true }), null;
    return {
      title: title.trim(),
      description: description.trim(),
      questions: questions.map((question) => ({
        type: question.type,
        title: question.title.trim(),
        description: question.description.trim(),
        required: question.required,
        options: hasOptions(question.type) ? question.options.map((option) => option.trim()).filter(Boolean) : [],
      })),
    };
  };

  const save = async () => {
    const input = payload();
    if (!input) return;
    try {
      setWorking(true);
      const saved = selectedId ? await updateForm(selectedId, input) : await createForm(input);
      edit(saved);
      await load();
      setMessage({ text: "저장했습니다." });
    } catch (caught) {
      setMessage({ text: caught instanceof Error ? caught.message : "저장하지 못했습니다.", error: true });
    } finally {
      setWorking(false);
    }
  };

  const publish = async () => {
    if (!selectedId) return;
    const input = payload();
    if (!input) return;
    try {
      setWorking(true);
      await updateForm(selectedId, input);
      edit(await publishForm(selectedId));
      await load();
      setMessage({ text: "공개했습니다." });
    } catch (caught) {
      setMessage({ text: caught instanceof Error ? caught.message : "공개하지 못했습니다.", error: true });
    } finally {
      setWorking(false);
    }
  };

  const close = async () => {
    if (!selectedId) return;
    try {
      setWorking(true);
      edit(await closeForm(selectedId));
      await load();
      setMessage({ text: "마감했습니다." });
    } catch (caught) {
      setMessage({ text: caught instanceof Error ? caught.message : "마감하지 못했습니다.", error: true });
    } finally {
      setWorking(false);
    }
  };

  const copyLink = async () => {
    if (!selectedId) return;
    await navigator.clipboard.writeText(`${window.location.origin}/forms/${selectedId}`);
    setMessage({ text: "학생 응답 링크를 복사했습니다." });
  };

  const editable = status === "DRAFT";

  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-5rem)] bg-[#f5f7f6] px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-950">폼 관리</h1>
            <div className="flex gap-4 text-sm font-semibold text-[#02C551]"><Link href="/teacher/recruit">취업 공고 관리</Link><Link href="/forms">학생 화면</Link></div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
            <aside className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <button type="button" onClick={reset} className="h-12 w-full rounded-xl bg-[#02C551] font-bold text-white">새 폼</button>
              <div className="mt-4 max-h-[700px] space-y-2 overflow-y-auto">
                {forms.length === 0 ? <p className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-400">등록된 폼이 없습니다.</p> : forms.map((form) => (
                  <button key={form.id} type="button" onClick={() => select(form.id)} className={`w-full rounded-xl border p-4 text-left ${selectedId === form.id ? "border-[#02C551] bg-green-50" : "border-gray-100"}`}>
                    <Status status={form.status} />
                    <strong className="mt-1 block truncate text-gray-900">{form.title}</strong>
                    <span className="mt-1 block text-xs text-gray-400">질문 {form.questionCount}개</span>
                  </button>
                ))}
              </div>
            </aside>

            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold">{selectedId ? title || "폼" : "새 폼"}</h2>
                <div className="flex items-center gap-3"><Status status={status} />{selectedId && <Link href={`/teacher/forms/${selectedId}/submissions`} className="text-sm font-semibold text-[#02C551]">응답 보기</Link>}</div>
              </div>

              <fieldset disabled={!editable || working} className="mt-7 space-y-5 disabled:opacity-70">
                <label className="block text-sm font-semibold text-gray-700">제목<input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 font-normal outline-none focus:border-[#02C551]" /></label>
                <label className="block text-sm font-semibold text-gray-700">설명<textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 min-h-24 w-full resize-y rounded-xl border border-gray-200 p-4 font-normal outline-none focus:border-[#02C551]" /></label>

                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <QuestionEditor key={question.key} question={question} index={index} count={questions.length} update={(changes) => updateQuestion(index, changes)} move={(offset) => moveQuestion(index, offset)} remove={() => setQuestions((current) => current.filter((_, questionIndex) => questionIndex !== index))} />
                  ))}
                </div>
                <button type="button" onClick={() => setQuestions((current) => [...current, newQuestion()])} className="h-11 w-full rounded-xl border border-dashed border-[#02C551] font-semibold text-[#02a946]">질문 추가</button>
              </fieldset>

              {message && <p role="status" className={`mt-6 rounded-xl px-4 py-3 text-sm ${message.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"}`}>{message.text}</p>}
              <div className="mt-7 flex flex-wrap justify-end gap-3">
                {status === "PUBLISHED" && <button type="button" onClick={copyLink} className="h-12 rounded-xl bg-gray-100 px-6 font-semibold text-gray-700">링크 복사</button>}
                {status === "PUBLISHED" && <button type="button" disabled={working} onClick={close} className="h-12 rounded-xl bg-gray-800 px-6 font-semibold text-white">마감</button>}
                {editable && <button type="button" disabled={working} onClick={save} className="h-12 rounded-xl bg-gray-100 px-6 font-semibold text-gray-700">저장</button>}
                {editable && selectedId && <button type="button" disabled={working} onClick={publish} className="h-12 rounded-xl bg-[#02C551] px-7 font-bold text-white">공개</button>}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

function Status({ status }: { status: FormStatus }) {
  const label = status === "DRAFT" ? "초안" : status === "PUBLISHED" ? "공개" : "마감";
  return <span className={`text-xs font-bold ${status === "PUBLISHED" ? "text-[#02a946]" : status === "CLOSED" ? "text-gray-500" : "text-amber-600"}`}>{label}</span>;
}

function QuestionEditor({ question, index, count, update, move, remove }: { question: DraftQuestion; index: number; count: number; update: (changes: Partial<DraftQuestion>) => void; move: (offset: number) => void; remove: () => void }) {
  return (
    <article className="rounded-2xl border border-gray-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <strong>질문 {index + 1}</strong>
        <div className="flex gap-2 text-sm"><button type="button" aria-label="질문 위로 이동" disabled={index === 0} onClick={() => move(-1)} className="disabled:text-gray-300">↑</button><button type="button" aria-label="질문 아래로 이동" disabled={index === count - 1} onClick={() => move(1)} className="disabled:text-gray-300">↓</button><button type="button" onClick={remove} className="text-red-600">삭제</button></div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-[180px_1fr]">
        <select aria-label={`질문 ${index + 1} 유형`} value={question.type} onChange={(event) => update({ type: event.target.value as QuestionType, options: hasOptions(event.target.value as QuestionType) ? question.options.length ? question.options : [""] : [] })} className="h-11 rounded-xl border border-gray-200 bg-white px-3 outline-none focus:border-[#02C551]">{questionTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select>
        <input aria-label={`질문 ${index + 1} 제목`} required value={question.title} onChange={(event) => update({ title: event.target.value })} className="h-11 rounded-xl border border-gray-200 px-4 outline-none focus:border-[#02C551]" />
      </div>
      <input aria-label={`질문 ${index + 1} 설명`} value={question.description} onChange={(event) => update({ description: event.target.value })} className="mt-3 h-11 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-[#02C551]" />
      <label className="mt-3 flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={question.required} onChange={(event) => update({ required: event.target.checked })} className="h-4 w-4 accent-[#02C551]" />필수</label>
      {hasOptions(question.type) && <div className="mt-4 space-y-2">{question.options.map((option, optionIndex) => <div key={optionIndex} className="flex gap-2"><input aria-label={`질문 ${index + 1} 보기 ${optionIndex + 1}`} required value={option} onChange={(event) => update({ options: question.options.map((current, index) => index === optionIndex ? event.target.value : current) })} className="h-10 flex-1 rounded-xl border border-gray-200 px-3 outline-none focus:border-[#02C551]" /><button type="button" onClick={() => update({ options: question.options.filter((_, index) => index !== optionIndex) })} className="px-2 text-sm text-red-600">삭제</button></div>)}<button type="button" onClick={() => update({ options: [...question.options, ""] })} className="text-sm font-semibold text-[#02a946]">보기 추가</button></div>}
    </article>
  );
}
