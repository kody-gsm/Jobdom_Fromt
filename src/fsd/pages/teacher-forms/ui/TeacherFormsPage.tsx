"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { TeacherHeader } from "@fsd/widgets/teacher-header";
import type {
  DynamicForm,
  FormInput,
  FormUpdateInput,
  FormQuestionInput,
  FormStatus,
  FormSummary,
  QuestionType,
} from "@fsd/entities/form";
import { FORM_EDITOR_LIMITS, FORM_TEXT_LIMITS, getFormInputLimitError } from "@fsd/entities/form";
import { ApiError } from "@fsd/shared/api";
import { createRequestVersionGuard } from "@fsd/shared/lib";
import {
  closeForm,
  createForm,
  getTeacherForm,
  getFormSubmissions,
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
  { value: "FILE", label: "파일 첨부" },
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
  const [hasResponses, setHasResponses] = useState<boolean | null>(false);
  const [responseError, setResponseError] = useState("");
  const requests = useRef(createRequestVersionGuard());
  const listRequests = useRef(createRequestVersionGuard());
  const mounted = useRef(true);
  const inFlight = useRef(false);
  const [savedQuestions, setSavedQuestions] = useState<DraftQuestion[]>([]);
  const questionsEditable = selectedId === null || hasResponses === false;
  const hasQuestionChanges = JSON.stringify(questions) !== JSON.stringify(savedQuestions);

  const isCurrent = useCallback((requestVersion: number) =>
    mounted.current && requests.current.isLatest(requestVersion), []);

  const load = useCallback(async () => {
    const requestVersion = listRequests.current.next();
    try {
      const loadedForms = await getTeacherForms();
      if (!mounted.current || !listRequests.current.isLatest(requestVersion)) return false;
      setForms(loadedForms);
      return true;
    } catch (caught) {
      if (!mounted.current || !listRequests.current.isLatest(requestVersion)) return false;
      setMessage({ text: caught instanceof Error ? caught.message : "폼을 불러오지 못했습니다.", error: true });
      return false;
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const requestGuard = requests.current;
    const listGuard = listRequests.current;
    queueMicrotask(() => { if (mounted.current) void load(); });
    return () => {
      mounted.current = false;
      requestGuard.next();
      listGuard.next();
    };
  }, [load]);

  const edit = useCallback((form: DynamicForm) => {
    setSelectedId(form.id);
    setStatus(form.status);
    setTitle(form.title);
    setDescription(form.description || "");
    const loadedQuestions = form.questions.map((question) => ({
      key: String(question.id),
      type: question.type,
      title: question.title,
      description: question.description || "",
      required: question.required,
      options: question.options.map((option) => option.label),
    }));
    setSavedQuestions(loadedQuestions);
    setQuestions(loadedQuestions);
    setHasResponses(null);
    setResponseError("");
    setMessage(null);
  }, []);

  const loadResponses = useCallback(async (formId: number, requestVersion: number) => {
    if (!isCurrent(requestVersion)) return;
    setHasResponses(null);
    setResponseError("");
    try {
      const responses = await getFormSubmissions(formId);
      if (isCurrent(requestVersion)) setHasResponses(responses.length > 0);
    } catch (caught) {
      if (!isCurrent(requestVersion)) return;
      setResponseError(caught instanceof Error ? caught.message : "응답 여부를 확인하지 못했습니다.");
    }
  }, [isCurrent]);

  const select = useCallback(async (id: number) => {
    if (inFlight.current) return;
    const requestVersion = requests.current.next();
    setHasResponses(null);
    setResponseError("");
    try {
      setWorking(true);
      const form = await getTeacherForm(id);
      if (!isCurrent(requestVersion)) return;
      edit(form);
      void loadResponses(id, requestVersion);
    } catch (caught) {
      if (!isCurrent(requestVersion)) return;
      setMessage({ text: caught instanceof Error ? caught.message : "폼을 불러오지 못했습니다.", error: true });
      setResponseError("폼을 다시 선택하거나 응답 여부를 다시 확인해주세요.");
    } finally {
      if (isCurrent(requestVersion)) setWorking(false);
    }
  }, [edit, isCurrent, loadResponses]);

  useEffect(() => {
    const requestedId = Number(new URLSearchParams(window.location.search).get("formId"));
    if (!Number.isInteger(requestedId) || requestedId <= 0) return;
    queueMicrotask(() => { if (mounted.current) void select(requestedId); });
  }, [select]);

  const reset = () => {
    if (inFlight.current) return;
    requests.current.next();
    setSelectedId(null);
    setStatus("DRAFT");
    setTitle("");
    setDescription("");
    setQuestions([newQuestion()]);
    setSavedQuestions([]);
    setHasResponses(false);
    setResponseError("");
    setWorking(false);
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
    if (selectedId && !questionsEditable && hasQuestionChanges) {
      setMessage({ text: "질문 변경을 저장할 수 없습니다. 질문 변경을 취소하거나 응답 여부를 다시 확인해주세요. 제목·설명 입력은 유지됩니다.", error: true });
      return null;
    }
    const editableQuestions = questionsEditable ? questions : [];
    if (questionsEditable && questions.length === 0) return setMessage({ text: "질문을 1개 이상 추가해주세요.", error: true }), null;
    if (editableQuestions.some((question) => !question.title.trim())) return setMessage({ text: "질문 제목을 모두 입력해주세요.", error: true }), null;
    if (editableQuestions.some((question) => hasOptions(question.type) && !question.options.some((option) => option.trim()))) return setMessage({ text: "선택형 질문에 보기를 추가해주세요.", error: true }), null;
    const limitError = getFormInputLimitError({ title, description, questions: editableQuestions });
    if (limitError) return setMessage({ text: limitError, error: true }), null;
    return {
      title: title.trim(),
      description: description.trim(),
      questions: editableQuestions.map((question) => ({
        type: question.type,
        title: question.title.trim(),
        description: question.description.trim(),
        required: question.required,
        options: hasOptions(question.type) ? question.options.map((option) => option.trim()).filter(Boolean) : [],
      })),
    };
  };

  const getUpdateInput = (input: FormInput): FormUpdateInput =>
    questionsEditable && hasQuestionChanges
      ? input : { title: input.title, description: input.description };

  const handleSaveError = (caught: unknown, fallback: string, isQuestionUpdate: boolean) => {
    if (isQuestionUpdate && caught instanceof ApiError && caught.status === 409) {
      setHasResponses(true);
      setResponseError("");
      setMessage({ text: "새 응답이 제출되어 질문 변경을 저장할 수 없습니다. 질문 변경을 취소하거나 응답 여부를 다시 확인해주세요. 입력은 유지됩니다.", error: true });
      return;
    }
    setMessage({ text: caught instanceof Error ? caught.message : fallback, error: true });
  };

  const save = async () => {
    if (inFlight.current) return;
    const input = payload();
    if (!input) return;
    const updateInput = getUpdateInput(input);
    const isQuestionUpdate = selectedId !== null && updateInput.questions !== undefined;
    inFlight.current = true;
    const requestVersion = requests.current.next();
    try {
      setWorking(true);
      const saved = selectedId ? await updateForm(selectedId, updateInput) : await createForm(input);
      if (!isCurrent(requestVersion)) return;
      edit(saved);
      void loadResponses(saved.id, requestVersion);
      if (await load() && isCurrent(requestVersion)) setMessage({ text: "저장했습니다." });
    } catch (caught) {
      if (!isCurrent(requestVersion)) return;
      handleSaveError(caught, "저장하지 못했습니다.", isQuestionUpdate);
      if (selectedId && !(isQuestionUpdate && caught instanceof ApiError && caught.status === 409)) void loadResponses(selectedId, requestVersion);
    } finally {
      inFlight.current = false;
      if (isCurrent(requestVersion)) setWorking(false);
    }
  };

  const publish = async () => {
    if (!selectedId || inFlight.current) return;
    const input = payload();
    if (!input) return;
    const updateInput = getUpdateInput(input);
    let questionPatchPending = updateInput.questions !== undefined;
    inFlight.current = true;
    const requestVersion = requests.current.next();
    try {
      setWorking(true);
      await updateForm(selectedId, updateInput);
      questionPatchPending = false;
      const published = await publishForm(selectedId);
      if (!isCurrent(requestVersion)) return;
      edit(published);
      void loadResponses(published.id, requestVersion);
      if (await load() && isCurrent(requestVersion)) setMessage({ text: "공개했습니다." });
    } catch (caught) {
      if (!isCurrent(requestVersion)) return;
      handleSaveError(caught, "공개하지 못했습니다.", questionPatchPending);
      if (!(questionPatchPending && caught instanceof ApiError && caught.status === 409)) void loadResponses(selectedId, requestVersion);
    } finally {
      inFlight.current = false;
      if (isCurrent(requestVersion)) setWorking(false);
    }
  };

  const close = async () => {
    if (!selectedId || inFlight.current) return;
    inFlight.current = true;
    const requestVersion = requests.current.next();
    try {
      setWorking(true);
      const closed = await closeForm(selectedId);
      if (!isCurrent(requestVersion)) return;
      edit(closed);
      void loadResponses(closed.id, requestVersion);
      if (await load() && isCurrent(requestVersion)) setMessage({ text: "마감했습니다." });
    } catch (caught) {
      if (!isCurrent(requestVersion)) return;
      setMessage({ text: caught instanceof Error ? caught.message : "마감하지 못했습니다.", error: true });
      void loadResponses(selectedId, requestVersion);
    } finally {
      inFlight.current = false;
      if (isCurrent(requestVersion)) setWorking(false);
    }
  };

  const copyLink = async () => {
    if (!selectedId) return;
    await navigator.clipboard.writeText(`${window.location.origin}/forms/${selectedId}`);
    setMessage({ text: "학생 응답 링크를 복사했습니다." });
  };

  return (
    <>
      <TeacherHeader />
      <main className="min-h-[calc(100vh-5rem)] bg-[#f5f7f6] px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-950">폼 관리</h1>
            <Link href="/teacher/recruit" className="text-sm font-semibold text-[#02C551]">취업 공고 관리</Link>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
            <aside className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <button type="button" disabled={working} onClick={reset} className="h-12 w-full rounded-xl bg-[#02C551] font-bold text-white disabled:opacity-50">새 폼</button>
              <div className="mt-4 max-h-[700px] space-y-2 overflow-y-auto">
                {forms.length === 0 ? <p className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-400">등록된 폼이 없습니다.</p> : forms.map((form) => (
                  <button key={form.id} type="button" disabled={working} onClick={() => void select(form.id)} className={`w-full rounded-xl border p-4 text-left disabled:opacity-50 ${selectedId === form.id ? "border-[#02C551] bg-green-50" : "border-gray-100"}`}>
                    <Status status={form.status} />
                    <strong className="mt-1 block truncate text-gray-900">{form.title}</strong>
                    <span className="mt-1 block text-xs text-gray-400">질문 {form.questionCount}개</span>
                  </button>
                ))}
              </div>
            </aside>

            <section className="min-w-0 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="min-w-0 wrap-anywhere text-2xl font-bold">{selectedId ? title || "폼" : "새 폼"}</h2>
                <div className="flex items-center gap-3"><Status status={status} />{selectedId && <Link href={`/teacher/forms/${selectedId}/submissions`} className="text-sm font-semibold text-[#02C551]">응답 보기</Link>}</div>
              </div>

              <fieldset disabled={working} className="mt-7 space-y-5 disabled:opacity-70">
                <label className="block text-sm font-semibold text-gray-700">
                  제목
                  <input required maxLength={FORM_EDITOR_LIMITS.TITLE} value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 font-normal outline-none focus:border-[#02C551]" />
                  <span className="mt-2 block text-right text-xs font-normal text-gray-400">{title.length}/{FORM_EDITOR_LIMITS.TITLE}자</span>
                </label>
                <label className="block text-sm font-semibold text-gray-700">
                  설명
                  <textarea maxLength={FORM_EDITOR_LIMITS.DESCRIPTION} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 min-h-24 w-full resize-y rounded-xl border border-gray-200 p-4 font-normal outline-none focus:border-[#02C551]" />
                  <span className="mt-2 block text-right text-xs font-normal text-gray-400">{description.length}/{FORM_EDITOR_LIMITS.DESCRIPTION.toLocaleString()}자</span>
                </label>

                {selectedId && (
                  <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                    {responseError ? (
                      <p role="alert" className="text-red-700">응답 여부를 확인하지 못했습니다. 질문을 수정하려면 응답 여부를 다시 확인해주세요. 제목·설명은 수정할 수 있습니다. {responseError}</p>
                    ) : (
                      <p role="status">{hasResponses === null ? "응답 여부를 확인하고 있습니다. 제목·설명은 수정할 수 있습니다." : hasResponses ? "응답이 제출된 폼은 제목·설명만 수정할 수 있습니다. 질문 변경은 기존 답변을 보존하기 위해 제한됩니다." : "제출된 응답이 없어 질문도 수정할 수 있습니다."}</p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <button type="button" disabled={hasResponses === null && !responseError} onClick={() => { if (!inFlight.current) void loadResponses(selectedId, requests.current.next()); }} className="min-h-11 rounded-lg border border-gray-200 bg-white px-3 font-semibold disabled:opacity-50">응답 여부 다시 확인</button>
                      {!questionsEditable && hasQuestionChanges && <button type="button" onClick={() => { setQuestions(savedQuestions); setMessage(null); }} className="min-h-11 rounded-lg border border-gray-200 bg-white px-3 font-semibold">질문 변경 취소</button>}
                    </div>
                  </div>
                )}
                <fieldset disabled={!questionsEditable} className="space-y-4 disabled:opacity-70">
                  <legend className="mb-3 font-semibold text-gray-700">질문</legend>
                  {questions.map((question, index) => (
                    <QuestionEditor key={question.key} question={question} index={index} count={questions.length} update={(changes) => updateQuestion(index, changes)} move={(offset) => moveQuestion(index, offset)} remove={() => setQuestions((current) => current.filter((_, questionIndex) => questionIndex !== index))} />
                  ))}
                  <button type="button" onClick={() => setQuestions((current) => [...current, newQuestion()])} className="h-11 w-full rounded-xl border border-dashed border-[#02C551] font-semibold text-[#02a946]">질문 추가</button>
                </fieldset>
              </fieldset>

              {message && <p role="status" className={`mt-6 wrap-anywhere rounded-xl px-4 py-3 text-sm ${message.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"}`}>{message.text}</p>}
              <div className="mt-7 flex flex-wrap justify-end gap-3">
                {status === "PUBLISHED" && <button type="button" onClick={copyLink} className="h-12 rounded-xl bg-gray-100 px-6 font-semibold text-gray-700">링크 복사</button>}
                {status === "PUBLISHED" && <button type="button" disabled={working} onClick={close} className="h-12 rounded-xl bg-gray-800 px-6 font-semibold text-white">마감</button>}
                <button type="button" disabled={working} onClick={() => void save()} className="h-12 rounded-xl bg-gray-100 px-6 font-semibold text-gray-700">{selectedId ? "수정 저장" : "저장"}</button>
                {status === "DRAFT" && selectedId && <button type="button" disabled={working} onClick={() => void publish()} className="h-12 rounded-xl bg-[#02C551] px-7 font-bold text-white">공개</button>}
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
  const textLimit = question.type === "SHORT_TEXT" || question.type === "LONG_TEXT" ? FORM_TEXT_LIMITS[question.type] : null;

  return (
    <article className="rounded-2xl border border-gray-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <strong>질문 {index + 1}</strong>
        <div className="flex gap-2 text-sm"><button type="button" aria-label="질문 위로 이동" disabled={index === 0} onClick={() => move(-1)} className="disabled:text-gray-300">↑</button><button type="button" aria-label="질문 아래로 이동" disabled={index === count - 1} onClick={() => move(1)} className="disabled:text-gray-300">↓</button><button type="button" onClick={remove} className="text-red-600">삭제</button></div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
        <select aria-label={`질문 ${index + 1} 유형`} value={question.type} onChange={(event) => update({ type: event.target.value as QuestionType, options: hasOptions(event.target.value as QuestionType) ? question.options.length ? question.options : [""] : [] })} className="h-11 rounded-xl border border-gray-200 bg-white px-3 outline-none focus:border-[#02C551]">{questionTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select>
        <div className="min-w-0">
          <input aria-label={`질문 ${index + 1} 제목`} required maxLength={FORM_EDITOR_LIMITS.TITLE} value={question.title} onChange={(event) => update({ title: event.target.value })} className="h-11 w-full min-w-0 rounded-xl border border-gray-200 px-4 outline-none focus:border-[#02C551]" />
          <p className="mt-2 text-right text-xs text-gray-400">{question.title.length}/{FORM_EDITOR_LIMITS.TITLE}자</p>
        </div>
      </div>
      <input aria-label={`질문 ${index + 1} 설명`} maxLength={FORM_EDITOR_LIMITS.DESCRIPTION} value={question.description} onChange={(event) => update({ description: event.target.value })} className="mt-3 h-11 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-[#02C551]" />
      <p className="mt-2 text-right text-xs text-gray-400">{question.description.length}/{FORM_EDITOR_LIMITS.DESCRIPTION.toLocaleString()}자</p>
      {textLimit && <p className="mt-2 text-xs text-gray-400">학생 답변은 최대 {textLimit.toLocaleString()}자까지 입력할 수 있습니다.</p>}
      {hasOptions(question.type) && (
        <div className="mt-4 space-y-2">
          {question.options.map((option, optionIndex) => (
            <div key={optionIndex}>
              <div className="flex gap-2">
                <input aria-label={`질문 ${index + 1} 보기 ${optionIndex + 1}`} required maxLength={FORM_EDITOR_LIMITS.OPTION} value={option} onChange={(event) => update({ options: question.options.map((current, index) => index === optionIndex ? event.target.value : current) })} className="h-10 min-w-0 flex-1 rounded-xl border border-gray-200 px-3 outline-none focus:border-[#02C551]" />
                <button type="button" onClick={() => update({ options: question.options.filter((_, index) => index !== optionIndex) })} className="px-2 text-sm text-red-600">삭제</button>
              </div>
              <p className="mt-2 text-right text-xs text-gray-400">{option.length}/{FORM_EDITOR_LIMITS.OPTION}자</p>
            </div>
          ))}
          <button type="button" onClick={() => update({ options: [...question.options, ""] })} className="text-sm font-semibold text-[#02a946]">보기 추가</button>
        </div>
      )}
      <div className="mt-4 flex min-h-11 items-center">
        <label className="inline-flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={question.required} onChange={(event) => update({ required: event.target.checked })} className="h-4 w-4 accent-[#02C551]" />필수</label>
      </div>
    </article>
  );
}
