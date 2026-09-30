"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DragEvent, FormEvent } from "react";
import { FiFileText, FiUploadCloud } from "react-icons/fi";
import {
  buildFormAnswers,
  FORM_TEXT_LIMITS,
  getFormErrorMessage,
  getMissingRequiredQuestion,
  isFormClosed,
} from "@fsd/entities/form";
import type {
  DynamicForm,
  FormQuestion,
  FormFileValue,
  FormSubmission,
  FormValue,
} from "@fsd/entities/form";
import { ApiError } from "@fsd/shared/api";
import { formatDeadlineDate } from "@fsd/shared/lib";
import { ActionButton, ContentCard } from "@fsd/shared/ui";
import { formApi } from "../api/form";

type Message = { text: string; error?: boolean };

const FORM_FILE_ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.gif,.zip,.doc,.docx,.ppt,.pptx,.hwp,.hwpx,.txt,.md";

const valuesFromSubmission = (submission: FormSubmission): Record<number, FormValue> =>
  Object.fromEntries(submission.answers.map((answer) => [
    answer.questionId,
    answer.fileId
      ? { fileId: answer.fileId, fileName: answer.fileName ?? "첨부 파일" }
      : answer.selectedOptionIds.length ? answer.selectedOptionIds : answer.textValue ?? "",
  ]));

export const SubmitForm = ({ formId }: { formId: number }) => {
  const [form, setForm] = useState<DynamicForm | null>(null);
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [values, setValues] = useState<Record<number, FormValue>>({});
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [submissionLoading, setSubmissionLoading] = useState(true);
  const [submissionError, setSubmissionError] = useState("");
  const formRequestVersion = useRef(0);
  const formLoadVersion = useRef(0);
  const submissionLoadVersion = useRef(0);
  const activeFormId = useRef(formId);
  const mounted = useRef(false);

  const isCurrent = useCallback((requestVersion: number, targetFormId: number) =>
    mounted.current &&
    activeFormId.current === targetFormId &&
    formRequestVersion.current === requestVersion, []);

  const loadForm = useCallback((requestVersion: number, targetFormId: number) => {
    const loadVersion = ++formLoadVersion.current;
    setFormLoading(true);
    setFormError("");
    void formApi.getById(targetFormId)
      .then((loadedForm) => {
        if (!isCurrent(requestVersion, targetFormId) || formLoadVersion.current !== loadVersion) return;
        setForm(loadedForm);
        setFormError("");
      })
      .catch((caught) => {
        if (!isCurrent(requestVersion, targetFormId) || formLoadVersion.current !== loadVersion) return;
        setForm(null);
        setFormError(getFormErrorMessage(caught, "폼을 불러오지 못했습니다."));
      })
      .finally(() => {
        if (isCurrent(requestVersion, targetFormId) && formLoadVersion.current === loadVersion) {
          setFormLoading(false);
        }
      });
  }, [isCurrent]);

  const loadSubmission = useCallback((requestVersion: number, targetFormId: number) => {
    const loadVersion = ++submissionLoadVersion.current;
    setSubmissionLoading(true);
    setSubmissionError("");
    void formApi.getMySubmission(targetFormId)
      .then((loadedSubmission) => {
        if (!isCurrent(requestVersion, targetFormId) || submissionLoadVersion.current !== loadVersion) return;
        setSubmission(loadedSubmission);
        setValues(valuesFromSubmission(loadedSubmission));
      })
      .catch((caught) => {
        if (!isCurrent(requestVersion, targetFormId) || submissionLoadVersion.current !== loadVersion) return;
        if (caught instanceof ApiError && caught.status === 404) {
          setSubmission(null);
          setValues({});
          setSubmissionError("");
        } else {
          setSubmission(null);
          setSubmissionError(caught instanceof Error ? caught.message : "기존 제출 내역을 확인하지 못했습니다.");
        }
      })
      .finally(() => {
        if (isCurrent(requestVersion, targetFormId) && submissionLoadVersion.current === loadVersion) {
          setSubmissionLoading(false);
        }
      });
  }, [isCurrent]);

  useEffect(() => {
    const requestVersion = ++formRequestVersion.current;
    activeFormId.current = formId;
    mounted.current = true;

    queueMicrotask(() => {
      if (!isCurrent(requestVersion, formId)) return;
      setForm(null);
      setSubmission(null);
      setValues({});
      setEditing(false);
      setMessage(null);
      setSubmitting(false);
      setFormError("");
      setSubmissionError("");
      setFormLoading(true);
      setSubmissionLoading(true);
      loadForm(requestVersion, formId);
      loadSubmission(requestVersion, formId);
    });

    return () => {
      mounted.current = false;
    };
  }, [formId, isCurrent, loadForm, loadSubmission]);

  const retrySubmission = () => loadSubmission(formRequestVersion.current, formId);
  const retryForm = () => loadForm(formRequestVersion.current, formId);

  const setValue = (questionId: number, value: FormValue) => {
    setValues((current) => ({ ...current, [questionId]: value }));
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;
    if (isFormClosed(form)) {
      setMessage({
        text: form.status === "CLOSED"
          ? "마감된 폼입니다. 더 이상 응답을 받지 않습니다."
          : "제출 기한이 지나 이 신청서는 더 이상 제출할 수 없습니다.",
        error: true,
      });
      return;
    }
    const requestVersion = formRequestVersion.current;
    const targetFormId = form.id;
    const isCurrentOperation = () => isCurrent(requestVersion, targetFormId);

    const missing = getMissingRequiredQuestion(form.questions, values);
    if (missing) {
      setMessage({ text: `“${missing.title}” 항목에 응답해주세요.`, error: true });
      return;
    }

    const preparedValues = { ...values };
    try {
      setSubmitting(true);
      for (const question of form.questions) {
        if (question.type !== "FILE") continue;
        const value = preparedValues[question.id];
        if (isFormFileValue(value) && value.file && !value.fileId) {
          const uploaded = await formApi.uploadFile(targetFormId, value.file);
          if (!isCurrentOperation()) return;
          const uploadedValue = { fileId: uploaded.id, fileName: uploaded.originalName };
          preparedValues[question.id] = uploadedValue;
          setValues((current) => ({ ...current, [question.id]: uploadedValue }));
        }
      }
    } catch (caught) {
      if (!isCurrentOperation()) return;
      setMessage({ text: getFormErrorMessage(caught, "파일 업로드에 실패했습니다."), error: true });
      setSubmitting(false);
      return;
    }

    if (!isCurrentOperation()) return;

    const answers = buildFormAnswers(form.questions, preparedValues);
    if (answers.length === 0) {
      setMessage({ text: "응답을 입력해주세요.", error: true });
      setSubmitting(false);
      return;
    }

    try {
      const saved = submission
        ? await formApi.updateSubmission(targetFormId, answers)
        : await formApi.submit(targetFormId, answers);
      if (!isCurrentOperation()) return;
      setSubmission(saved);
      setValues(valuesFromSubmission(saved));
      setEditing(false);
      setMessage({ text: "응답을 제출했습니다." });
    } catch (caught) {
      if (!isCurrentOperation()) return;
      setMessage({
        text:
          caught instanceof ApiError && caught.status === 409
            ? "이미 제출한 폼입니다."
            : getFormErrorMessage(caught, "제출하지 못했습니다."),
        error: true,
      });
    } finally {
      if (isCurrentOperation()) setSubmitting(false);
    }
  };

  if (formError && !form) {
    return (
      <div role="alert" className="rounded-2xl bg-red-50 p-5 text-red-700">
        <p>{formError}</p>
        <button type="button" onClick={retryForm} className="mt-3 rounded-lg bg-brand px-4 py-2 font-semibold text-white">
          다시 시도
        </button>
      </div>
    );
  }
  if (formLoading || !form) {
    return <p className="py-20 text-center text-gray-400">불러오는 중…</p>;
  }
  const isExpired = isFormClosed(form);

  return (
    <form onSubmit={submitForm}>
      <ContentCard className="overflow-hidden p-0">
      <header className="bg-brand p-7 text-white sm:p-9">
        <h1 className="wrap-anywhere break-keep text-3xl font-bold">{form.title}</h1>
        {form.description ? (
          <p className="mt-3 wrap-anywhere whitespace-pre-line break-keep text-sm leading-6 text-white/85">
            {form.description}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-semibold text-white/90">
          <span>제한 기한</span>
          <span aria-hidden="true">·</span>
          <time>{formatDeadlineDate(form.deadline)}</time>
          {isExpired ? <span className="rounded-full bg-white/15 px-2 py-1 text-xs text-white">마감됨</span> : null}
        </div>
      </header>
      <div className="min-w-0 space-y-5 p-6 sm:p-9">
        {submission && !editing ? (
          <SubmittedAnswers submission={submission} />
        ) : (
          form.questions.map((question, index) => (
            <QuestionField
              key={question.id}
              question={question}
              index={index}
              value={values[question.id]}
              onChange={(value) => setValue(question.id, value)}
              disabled={isExpired || submitting}
            />
          ))
        )}
        {submissionLoading ? (
          <p role="status" className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            기존 제출 내역을 확인하는 중입니다.
          </p>
        ) : null}
        {submissionError ? (
          <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            <p>{submissionError}</p>
            <button type="button" onClick={retrySubmission} className="mt-3 rounded-lg bg-brand px-4 py-2 font-semibold text-white">
              제출 내역 다시 시도
            </button>
          </div>
        ) : null}
        {isExpired ? (
          <p role="status" className="rounded-xl bg-[#FFF0EC] px-4 py-3 text-sm font-semibold text-[#9A4F45]">
            제출 기한이 지나 이 신청서는 더 이상 제출할 수 없습니다.
          </p>
        ) : null}
        {message ? (
          <p
            role="status"
            className={`wrap-anywhere rounded-xl px-4 py-3 text-sm ${
              message.error ? "bg-red-50 text-red-700" : "bg-[#EAF9F0] text-[#027A35]"
            }`}
          >
            {message.text}
          </p>
        ) : null}
        {submission && !editing && !submissionLoading ? (
          <ActionButton
            type="button"
            onClick={(event) => {
              event.preventDefault();
              setMessage(null);
              setEditing(true);
            }}
            disabled={isExpired}
            className="w-full bg-brand hover:bg-brand-hover"
          >
            {isExpired ? "제출 마감" : "재응답"}
          </ActionButton>
        ) : (
          <ActionButton
            type="submit"
            disabled={isExpired || submitting || submissionLoading || Boolean(submissionError)}
            className="w-full bg-brand hover:bg-brand-hover"
          >
            {isExpired ? "제출 마감" : submitting ? "제출 중…" : "제출"}
          </ActionButton>
        )}
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
  disabled?: boolean;
};

const QuestionField = ({ question, index, value, onChange, disabled = false }: QuestionFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const choices = Array.isArray(value) ? value : [];
  const textLimit = question.type === "SHORT_TEXT" || question.type === "LONG_TEXT" ? FORM_TEXT_LIMITS[question.type] : null;
  const inputId = `question-${question.id}`;
  const questionTitle = (
    <>
      <span className="mr-2 text-gray-400">{index + 1}.</span>
      {question.title}
      {question.required ? <span className="ml-1 text-red-500">*</span> : null}
    </>
  );
  const description = question.description ? (
    <p className="mt-2 min-w-0 wrap-anywhere text-sm font-normal text-gray-500">{question.description}</p>
  ) : null;
  const inputClass =
    "mt-3 min-w-0 w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-brand";

  if (question.type === "LONG_TEXT") {
    return (
      <div className="block min-w-0 wrap-anywhere rounded-2xl border border-gray-100 p-5">
        <label htmlFor={inputId} className="block font-semibold">{questionTitle}</label>
        {description}
        <textarea
          id={inputId}
          required={question.required}
          maxLength={textLimit ?? undefined}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className={`${inputClass} min-h-36 resize-y font-normal`}
        />
        {textLimit ? <p className="mt-2 text-right text-xs font-normal text-gray-400">{typeof value === "string" ? value.length : 0}/{textLimit.toLocaleString()}자</p> : null}
      </div>
    );
  }

  if (question.type === "FILE") {
    const fileValue = isFormFileValue(value) ? value : undefined;
    const selectFile = (file?: File) => {
      if (!file || disabled) return;
      onChange({ file, fileName: file.name });
      setIsDragging(false);
    };
    const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
      event.preventDefault();
      selectFile(event.dataTransfer.files?.[0]);
    };

    return (
      <div className="min-w-0 wrap-anywhere rounded-2xl border border-gray-100 p-5">
        <div className="font-semibold">{questionTitle}</div>
        {description}
        <input
          ref={fileInputRef}
          type="file"
          accept={FORM_FILE_ACCEPT}
          onChange={(event) => {
            selectFile(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
          disabled={disabled}
          className="sr-only"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`mt-4 flex min-h-44 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-colors ${
            isDragging
              ? "border-brand bg-green-50 text-brand"
              : "border-indigo-200 bg-slate-50 text-gray-500 hover:border-brand hover:bg-green-50"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <FiUploadCloud aria-hidden size={34} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-600">
            {fileValue ? "파일을 바꾸려면 클릭하거나 새 파일을 드래그하세요" : "파일을 드래그하거나 클릭해서 업로드하세요"}
          </span>
          <span className="text-xs font-normal text-gray-400">최대 10MB · PDF, PNG, JPG, ZIP, DOC, PPT, HWP, TXT, MD</span>
          <span className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white">파일 선택</span>
        </button>
        {fileValue ? (
          <p className="mt-3 flex min-w-0 items-center gap-2 text-sm font-normal text-gray-600">
            <FiFileText aria-hidden className="shrink-0 text-brand" />
            <span className="min-w-0 truncate">{fileValue.fileName}</span>
          </p>
        ) : null}
      </div>
    );
  }

  if (["SHORT_TEXT", "NUMBER", "DATE"].includes(question.type)) {
    const inputType = question.type === "NUMBER" ? "number" : question.type === "DATE" ? "date" : "text";
    return (
      <div className="block min-w-0 wrap-anywhere rounded-2xl border border-gray-100 p-5">
        <label htmlFor={inputId} className="block font-semibold">{questionTitle}</label>
        {description}
        <input
          id={inputId}
          required={question.required}
          maxLength={textLimit ?? undefined}
          type={inputType}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className={`${inputClass} h-12 font-normal`}
        />
        {textLimit ? <p className="mt-2 text-right text-xs font-normal text-gray-400">{typeof value === "string" ? value.length : 0}/{textLimit.toLocaleString()}자</p> : null}
      </div>
    );
  }

  if (question.type === "DROPDOWN") {
    return (
      <div className="block min-w-0 wrap-anywhere rounded-2xl border border-gray-100 p-5">
        <label htmlFor={inputId} className="block font-semibold">{questionTitle}</label>
        {description}
        <select
          id={inputId}
          required={question.required}
          value={choices[0] || ""}
          onChange={(event) => onChange(event.target.value ? [Number(event.target.value)] : [])}
          disabled={disabled}
          className={`${inputClass} h-12 bg-white font-normal`}
        >
          <option value="">선택</option>
          {question.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <fieldset disabled={disabled} className="min-w-0 wrap-anywhere rounded-2xl border border-gray-100 p-5">
      <legend className="max-w-full wrap-anywhere px-1 font-semibold">{questionTitle}</legend>
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
            <label key={option.id} className="flex min-h-11 min-w-0 items-center gap-3 rounded-xl px-2 text-sm text-gray-700">
              <input
                required={question.required && question.type !== "MULTIPLE_CHOICE" && choices.length === 0}
                type={question.type === "MULTIPLE_CHOICE" ? "checkbox" : "radio"}
                name={`question-${question.id}`}
                checked={checked}
                onChange={(event) => onChange(nextValue(event.target.checked))}
                className="h-4 w-4 accent-brand"
              />
              <span className="min-w-0 wrap-anywhere">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};

const SubmittedAnswers = ({ submission }: { submission: FormSubmission }) => (
  <section className="min-w-0">
    <h2 className="text-xl font-bold">제출한 응답</h2>
    <div className="mt-5 space-y-4">
      {submission.answers.map((answer) => (
        <div key={answer.questionId} className="min-w-0 wrap-anywhere rounded-2xl bg-gray-50 p-5">
          <h3 className="min-w-0 wrap-anywhere text-sm font-semibold text-gray-500">{answer.questionTitle}</h3>
          <p className="mt-2 min-w-0 wrap-anywhere whitespace-pre-line text-gray-900">
            {answer.fileName
              ? `첨부 파일: ${answer.fileName}`
              : answer.selectedOptionLabels.length
              ? answer.selectedOptionLabels.join(", ")
              : answer.textValue}
          </p>
        </div>
      ))}
    </div>
  </section>
);

const isFormFileValue = (value: FormValue | undefined): value is FormFileValue =>
  Boolean(value && !Array.isArray(value) && typeof value !== "string");
