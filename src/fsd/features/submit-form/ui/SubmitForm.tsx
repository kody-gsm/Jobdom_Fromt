"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  buildFormAnswers,
  getMissingRequiredQuestion,
} from "@fsd/entities/form";
import type {
  DynamicForm,
  FormQuestion,
  FormSubmission,
  FormValue,
} from "@fsd/entities/form";
import { ApiError } from "@fsd/shared/api";
import { ActionButton, ContentCard } from "@fsd/shared/ui";
import { formApi } from "../api/form";

type Message = { text: string; error?: boolean };

export const SubmitForm = ({ formId }: { formId: number }) => {
  const [form, setForm] = useState<DynamicForm | null>(null);
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [values, setValues] = useState<Record<number, FormValue>>({});
  const [message, setMessage] = useState<Message | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      formApi.getById(formId),
      formApi.getMySubmission(formId).catch((caught) =>
        caught instanceof ApiError && caught.status === 404 ? null : Promise.reject(caught),
      ),
    ])
      .then(([loadedForm, loadedSubmission]) => {
        setForm(loadedForm);
        setSubmission(loadedSubmission);
      })
      .catch((caught) =>
        setMessage({
          text: caught instanceof Error ? caught.message : "폼을 불러오지 못했습니다.",
          error: true,
        }),
      );
  }, [formId]);

  const setValue = (questionId: number, value: FormValue) => {
    setValues((current) => ({ ...current, [questionId]: value }));
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;

    const missing = getMissingRequiredQuestion(form.questions, values);
    if (missing) {
      setMessage({ text: `“${missing.title}” 항목에 응답해주세요.`, error: true });
      return;
    }

    const answers = buildFormAnswers(form.questions, values);
    if (answers.length === 0) {
      setMessage({ text: "응답을 입력해주세요.", error: true });
      return;
    }

    try {
      setSubmitting(true);
      const saved = await formApi.submit(form.id, answers);
      setSubmission(saved);
      setMessage({ text: "응답을 제출했습니다." });
    } catch (caught) {
      setMessage({
        text:
          caught instanceof ApiError && caught.status === 409
            ? "이미 제출한 폼입니다."
            : caught instanceof Error
              ? caught.message
              : "제출하지 못했습니다.",
        error: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (message?.error && !form) {
    return <p role="alert" className="rounded-2xl bg-red-50 p-5 text-red-700">{message.text}</p>;
  }
  if (!form) {
    return <p className="py-20 text-center text-gray-400">불러오는 중…</p>;
  }

  return (
    <form onSubmit={submitForm}>
      <ContentCard className="overflow-hidden p-0">
      <header className="bg-[#10243E] p-7 text-white sm:p-9">
        <h1 className="break-keep text-3xl font-bold">{form.title}</h1>
        {form.description ? (
          <p className="mt-3 whitespace-pre-line break-keep text-sm leading-6 text-[#C8D4E2]">
            {form.description}
          </p>
        ) : null}
      </header>
      <div className="space-y-5 p-6 sm:p-9">
        {submission ? (
          <SubmittedAnswers submission={submission} />
        ) : (
          form.questions.map((question, index) => (
            <QuestionField
              key={question.id}
              question={question}
              index={index}
              value={values[question.id]}
              onChange={(value) => setValue(question.id, value)}
            />
          ))
        )}
        {message ? (
          <p
            role="status"
            className={`rounded-xl px-4 py-3 text-sm ${
              message.error ? "bg-red-50 text-red-700" : "bg-[#EEF3F8] text-[#315B83]"
            }`}
          >
            {message.text}
          </p>
        ) : null}
        {!submission ? (
          <ActionButton
            type="submit"
            disabled={submitting}
            className="w-full bg-[#10243E] hover:bg-[#1B3555]"
          >
            {submitting ? "제출 중…" : "제출"}
          </ActionButton>
        ) : null}
      </div>
      </ContentCard>
    </form>
  );
};

type QuestionFieldProps = {
  question: FormQuestion;
  index: number;
  value?: FormValue;
  onChange: (value: FormValue) => void;
};

const QuestionField = ({ question, index, value, onChange }: QuestionFieldProps) => {
  const choices = Array.isArray(value) ? value : [];
  const label = (
    <>
      <span className="mr-2 text-gray-400">{index + 1}.</span>
      {question.title}
      {question.required ? <span className="ml-1 text-red-500">*</span> : null}
    </>
  );
  const description = question.description ? (
    <p className="mt-2 text-sm font-normal text-gray-500">{question.description}</p>
  ) : null;
  const inputClass =
    "mt-3 w-full rounded-xl border border-[#DDE2E7] px-4 py-3 outline-none focus:border-[#315B83]";

  if (question.type === "LONG_TEXT") {
    return (
      <label className="block rounded-2xl border border-gray-100 p-5 font-semibold">
        {label}
        {description}
        <textarea
          required={question.required}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} min-h-36 resize-y font-normal`}
        />
      </label>
    );
  }

  if (["SHORT_TEXT", "NUMBER", "DATE"].includes(question.type)) {
    const inputType = question.type === "NUMBER" ? "number" : question.type === "DATE" ? "date" : "text";
    return (
      <label className="block rounded-2xl border border-gray-100 p-5 font-semibold">
        {label}
        {description}
        <input
          required={question.required}
          type={inputType}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} h-12 font-normal`}
        />
      </label>
    );
  }

  if (question.type === "DROPDOWN") {
    return (
      <label className="block rounded-2xl border border-gray-100 p-5 font-semibold">
        {label}
        {description}
        <select
          required={question.required}
          value={choices[0] || ""}
          onChange={(event) => onChange(event.target.value ? [Number(event.target.value)] : [])}
          className={`${inputClass} h-12 bg-white font-normal`}
        >
          <option value="">선택</option>
          {question.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <fieldset className="rounded-2xl border border-gray-100 p-5">
      <legend className="px-1 font-semibold">{label}</legend>
      {description}
      <div className="mt-3 space-y-3">
        {question.options.map((option) => {
          const checked = choices.includes(option.id);
          const nextValue = (isChecked: boolean) =>
            question.type === "MULTIPLE_CHOICE"
              ? isChecked
                ? [...choices, option.id]
                : choices.filter((id) => id !== option.id)
              : [option.id];

          return (
            <label key={option.id} className="flex min-h-11 items-center gap-3 rounded-xl px-2 text-sm text-gray-700">
              <input
                required={question.required && question.type !== "MULTIPLE_CHOICE" && choices.length === 0}
                type={question.type === "MULTIPLE_CHOICE" ? "checkbox" : "radio"}
                name={`question-${question.id}`}
                checked={checked}
                onChange={(event) => onChange(nextValue(event.target.checked))}
                className="h-4 w-4 accent-[#10243E]"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};

const SubmittedAnswers = ({ submission }: { submission: FormSubmission }) => (
  <section>
    <h2 className="text-xl font-bold">제출한 응답</h2>
    <div className="mt-5 space-y-4">
      {submission.answers.map((answer) => (
        <div key={answer.questionId} className="rounded-2xl bg-gray-50 p-5">
          <h3 className="text-sm font-semibold text-gray-500">{answer.questionTitle}</h3>
          <p className="mt-2 whitespace-pre-line text-gray-900">
            {answer.selectedOptionLabels.length
              ? answer.selectedOptionLabels.join(", ")
              : answer.textValue}
          </p>
        </div>
      ))}
    </div>
  </section>
);
