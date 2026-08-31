"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Header } from "@/app/components/organisms/Header";
import { ApiError, DynamicForm, FormQuestion, FormSubmission, getForm, getMyFormSubmission, submitForm } from "@/app/utils/api";
import { FormValue, buildFormAnswers, getMissingRequiredQuestion } from "@/app/utils/formAnswers";

export default function FormPage() {
  const { id } = useParams<{ id: string }>();
  const formId = Number(id);
  const [form, setForm] = useState<DynamicForm | null>(null);
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [values, setValues] = useState<Record<number, FormValue>>({});
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      getForm(formId),
      getMyFormSubmission(formId).catch((caught) => caught instanceof ApiError && caught.status === 404 ? null : Promise.reject(caught)),
    ])
      .then(([loadedForm, loadedSubmission]) => {
        setForm(loadedForm);
        setSubmission(loadedSubmission);
      })
      .catch((caught) => setMessage({ text: caught instanceof Error ? caught.message : "폼을 불러오지 못했습니다.", error: true }));
  }, [formId]);

  const setValue = (questionId: number, value: FormValue) =>
    setValues((current) => ({ ...current, [questionId]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
    const missing = getMissingRequiredQuestion(form.questions, values);
    if (missing) return setMessage({ text: `“${missing.title}” 항목에 응답해주세요.`, error: true });
    const answers = buildFormAnswers(form.questions, values);
    if (answers.length === 0) return setMessage({ text: "응답을 입력해주세요.", error: true });

    try {
      setSubmitting(true);
      const saved = await submitForm(form.id, answers);
      setSubmission(saved);
      setMessage({ text: "응답을 제출했습니다." });
    } catch (caught) {
      setMessage({ text: caught instanceof ApiError && caught.status === 409 ? "이미 제출한 폼입니다." : caught instanceof Error ? caught.message : "제출하지 못했습니다.", error: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-5rem)] bg-[#eef5f0] px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <Link href="/forms" className="text-sm font-semibold text-gray-500">← 폼 목록</Link>
          {message?.error && !form ? <p role="alert" className="mt-8 rounded-2xl bg-red-50 p-5 text-red-700">{message.text}</p> : !form ? <p className="py-20 text-center text-gray-400">불러오는 중…</p> : (
            <form onSubmit={submit} className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
              <header className="bg-[#02C551] p-7 text-white sm:p-9">
                <h1 className="break-keep text-3xl font-bold">{form.title}</h1>
                {form.description && <p className="mt-3 whitespace-pre-line break-keep text-sm leading-6 text-green-50">{form.description}</p>}
              </header>
              <div className="space-y-5 p-6 sm:p-9">
                {submission ? <Submitted submission={submission} /> : form.questions.map((question, index) => (
                  <Question key={question.id} question={question} index={index} value={values[question.id]} onChange={(value) => setValue(question.id, value)} />
                ))}
                {message && <p role="status" className={`rounded-xl px-4 py-3 text-sm ${message.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"}`}>{message.text}</p>}
                {!submission && <button type="submit" disabled={submitting} className="h-12 w-full rounded-xl bg-[#02C551] font-bold text-white disabled:bg-gray-300">{submitting ? "제출 중…" : "제출"}</button>}
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}

function Question({ question, index, value, onChange }: { question: FormQuestion; index: number; value?: FormValue; onChange: (value: FormValue) => void }) {
  const choices = Array.isArray(value) ? value : [];
  const label = <><span className="mr-2 text-gray-400">{index + 1}.</span>{question.title}{question.required && <span className="ml-1 text-red-500">*</span>}</>;
  const description = question.description && <p className="mt-2 text-sm font-normal text-gray-500">{question.description}</p>;
  const inputClass = "mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#02C551]";

  if (question.type === "LONG_TEXT") return <label className="block rounded-2xl border border-gray-100 p-5 font-semibold">{label}{description}<textarea required={question.required} value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} className={`${inputClass} min-h-36 resize-y font-normal`} /></label>;
  if (["SHORT_TEXT", "NUMBER", "DATE"].includes(question.type)) return <label className="block rounded-2xl border border-gray-100 p-5 font-semibold">{label}{description}<input required={question.required} type={question.type === "NUMBER" ? "number" : question.type === "DATE" ? "date" : "text"} value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} className={`${inputClass} h-12 font-normal`} /></label>;
  if (question.type === "DROPDOWN") return <label className="block rounded-2xl border border-gray-100 p-5 font-semibold">{label}{description}<select required={question.required} value={choices[0] || ""} onChange={(event) => onChange(event.target.value ? [Number(event.target.value)] : [])} className={`${inputClass} h-12 bg-white font-normal`}><option value="">선택</option>{question.options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>;

  return (
    <fieldset className="rounded-2xl border border-gray-100 p-5">
      <legend className="px-1 font-semibold">{label}</legend>
      {description}
      <div className="mt-3 space-y-3">
        {question.options.map((option) => {
          const checked = choices.includes(option.id);
          return <label key={option.id} className="flex items-center gap-3 text-sm text-gray-700"><input required={question.required && question.type !== "MULTIPLE_CHOICE" && choices.length === 0} type={question.type === "MULTIPLE_CHOICE" ? "checkbox" : "radio"} name={`question-${question.id}`} checked={checked} onChange={(event) => onChange(question.type === "MULTIPLE_CHOICE" ? event.target.checked ? [...choices, option.id] : choices.filter((id) => id !== option.id) : [option.id])} className="h-4 w-4 accent-[#02C551]" />{option.label}</label>;
        })}
      </div>
    </fieldset>
  );
}

function Submitted({ submission }: { submission: FormSubmission }) {
  return (
    <section>
      <h2 className="text-xl font-bold">제출한 응답</h2>
      <div className="mt-5 space-y-4">
        {submission.answers.map((answer) => <div key={answer.questionId} className="rounded-2xl bg-gray-50 p-5"><h3 className="text-sm font-semibold text-gray-500">{answer.questionTitle}</h3><p className="mt-2 whitespace-pre-line text-gray-900">{answer.selectedOptionLabels.length ? answer.selectedOptionLabels.join(", ") : answer.textValue}</p></div>)}
      </div>
    </section>
  );
}
