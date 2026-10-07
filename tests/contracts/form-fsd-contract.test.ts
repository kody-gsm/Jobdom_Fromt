import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildFormAnswers,
  getMissingRequiredQuestion,
} from "../../src/fsd/entities/form/model/answers.ts";
import type { FormQuestion } from "../../src/fsd/entities/form/model/types.ts";
import { createFormApi } from "../../src/fsd/entities/form/api/createFormApi.ts";
import { getFormValueError, getFormInputLimitError, getFormFileError } from "../../src/fsd/entities/form/model/validation.ts";
import type { ApiRequestInit } from "../../src/fsd/shared/api/client.ts";
import { downloadBlob } from "../../src/fsd/shared/lib/downloadBlob.ts";

const questions = [
  {
    id: 10,
    orderIndex: 0,
    title: "이름",
    description: null,
    required: true,
    type: "SHORT_TEXT",
    options: [],
  },
  {
    id: 11,
    orderIndex: 1,
    title: "지원 직무",
    description: null,
    required: true,
    type: "MULTIPLE_CHOICE",
    options: [{ id: 100, orderIndex: 0, label: "개발" }, { id: 101, orderIndex: 1, label: "디자인" }],
  },
] satisfies FormQuestion[];
assert.equal(
  getMissingRequiredQuestion(questions, { 10: "김철수", 11: [] })?.id,
  11,
);
assert.deepEqual(
  buildFormAnswers(questions, { 10: " 김철수 ", 11: [100, 101] }),
  [
    { questionId: 10, textValue: "김철수" },
    { questionId: 11, optionIds: [100, 101] },
  ],
);

const fileQuestion = [{
  id: 12,
  orderIndex: 2,
  title: "자소서",
  description: null,
  required: true,
  type: "FILE",
  options: [],
}] satisfies FormQuestion[];
assert.deepEqual(
  buildFormAnswers(fileQuestion, {
    12: { fileId: 55, fileName: "resume.pdf" },
  }),
  [{ questionId: 12, fileId: 55 }],
);

const calls: Array<{ path: string; init?: RequestInit }> = [];
const api = createFormApi(async <T>(path: string, init?: RequestInit) => {
  calls.push({ path, init });
  return undefined as T;
});
await api.getAll();
await api.getById(3);
await api.getMySubmission(3);
await api.submit(3, [{ questionId: 10, textValue: "김철수" }]);
await api.updateSubmission(3, [{ questionId: 10, textValue: "updated" }]);
await api.uploadFile(3, new File(["resume"], "resume.pdf", { type: "application/pdf" }));
assert.equal(calls[0]?.path, "/form");
assert.equal(calls[1]?.path, "/form/3");
assert.equal(calls[2]?.path, "/student/form/3/submission");
assert.equal(calls[3]?.path, "/student/form/3/submission");
assert.equal(calls[3]?.init?.method, "POST");
assert.equal(calls[4]?.init?.method, "PATCH");
assert.equal(calls[5]?.path, "/student/form/3/file");
assert.equal(calls[5]?.init?.method, "POST");
assert.ok(calls[5]?.init?.body instanceof FormData);

const short = questions[0];
const long: FormQuestion = { ...short, type: "LONG_TEXT" };
const numeric: FormQuestion = { ...short, type: "NUMBER" };
const date: FormQuestion = { ...short, type: "DATE" };
assert.equal(getFormValueError(short, "가".repeat(100)), "");
assert.match(getFormValueError(short, "가".repeat(101)), /100자/);
assert.equal(getFormValueError(long, "가".repeat(1000)), "");
assert.match(getFormValueError(long, "가".repeat(1001)), /1,000자/);
assert.throws(() => buildFormAnswers([short], { 10: "가".repeat(101) }), /100자/);
for (const value of ["0", "-12", "1.25", ".5", "1e3", "9007199254740993"]) {
  assert.equal(getFormValueError(numeric, value), "", value);
  assert.equal(buildFormAnswers([numeric], { 10: value })[0]?.textValue, value);
}
for (const value of ["NaN", "Infinity", "1e309", "1e", "1,000", "abc"]) assert.match(getFormValueError(numeric, value), /숫자/, value);
assert.equal(getFormValueError(date, "2024-02-29"), "");
assert.equal(getFormValueError(date, "0001-01-01"), "");
for (const value of ["2025-02-29", "2026-02-30", "2026-13-01", "0000-01-01", "2026-1-1"]) assert.match(getFormValueError(date, value), /날짜/, value);
assert.equal(getFormValueError({ ...short, required: false }, ""), "");
assert.match(getFormValueError(questions[1], [999]), /선택지/);
assert.match(getFormValueError(questions[1], [100, 100]), /중복/);
assert.match(getFormValueError({ ...questions[1], type: "SINGLE_CHOICE" }, [100, 101]), /하나/);
assert.match(getFormValueError(short, [100]), /입력/);

const validInput = { title: "가".repeat(255), description: "나".repeat(1000), questions: [{ type: "SHORT_TEXT" as const, title: "질문", description: "", required: false, options: [] }] };
assert.equal(getFormInputLimitError(validInput), "");
assert.match(getFormInputLimitError({ ...validInput, title: "가".repeat(256) }), /255자/);
assert.match(getFormInputLimitError({ ...validInput, description: "가".repeat(1001) }), /1,000자/);
assert.match(getFormInputLimitError({ ...validInput, questions: [{ ...validInput.questions[0], title: "가".repeat(256) }] }), /255자/);
assert.match(getFormInputLimitError({ ...validInput, questions: [{ ...validInput.questions[0], description: "가".repeat(1001) }] }), /1,000자/);
const invalidInput = { ...validInput, questions: [{ ...validInput.questions[0], type: "SINGLE_CHOICE" as const, options: ["가".repeat(256)] }] };
assert.match(getFormInputLimitError(invalidInput), /255자/);
const beforeInvalid = calls.length;
await assert.rejects(api.createTeacher(invalidInput), /255자/);
await assert.rejects(api.updateTeacher(3, invalidInput), /255자/);
assert.equal(calls.length, beforeInvalid, "invalid editor values must not reach the API");

const metadataUpdate = { title: "공개된 폼 제목 수정", description: "설명 수정" };
assert.equal(getFormInputLimitError(metadataUpdate), "");
const editCalls: Array<{ path: string; init?: ApiRequestInit }> = [];
const editApi = createFormApi(async <T>(path: string, init?: ApiRequestInit) => {
  editCalls.push({ path, init });
  return {} as T;
});
await editApi.updateTeacher(7, metadataUpdate);
assert.deepEqual(editCalls[0], { path: "/teacher/form/7", init: { method: "PATCH", body: JSON.stringify(metadataUpdate) } });
assert.equal(Object.hasOwn(JSON.parse(String(editCalls[0]?.init?.body)), "questions"), false, "metadata edits must preserve existing questions and submissions");
await editApi.updateTeacher(7, validInput);
assert.deepEqual(JSON.parse(String(editCalls[1]?.init?.body)).questions, validInput.questions, "question edits must include the complete replacement list");
await editApi.getSubmissions(7);
assert.deepEqual(editCalls[2], { path: "/teacher/form/7/submission", init: undefined });
await assert.rejects(editApi.updateTeacher(7, { ...metadataUpdate, title: "가".repeat(256) }), /255자/);
await assert.rejects(editApi.updateTeacher(7, { ...metadataUpdate, description: "가".repeat(1001) }), /1,000자/);
assert.equal(editCalls.length, 3, "invalid metadata must not issue update requests");

assert.equal(getFormFileError(new File(["resume"], "RESUME.PDF")), "");
assert.match(getFormFileError(new File([], "empty.pdf")), /빈 파일/);
assert.match(getFormFileError(new File(["text"], "bad.exe")), /형식/);
const oversized = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "large.pdf");
assert.match(getFormFileError(oversized), /10MB/);
await assert.rejects(api.uploadFile(3, oversized), /10MB/);
assert.equal(calls.length, beforeInvalid, "invalid files must not be uploaded");
assert.match(getFormValueError(fileQuestion[0], { file: oversized, fileName: oversized.name }), /10MB/);
const submitSource = readFileSync("src/fsd/features/submit-form/ui/SubmitForm.tsx", "utf8");
const submissionsSource = readFileSync("src/fsd/pages/teacher-form-submissions/ui/FormSubmissionsPage.tsx", "utf8");
assert.match(submissionsSource, /<FileDownload/, "teacher answers must offer attachment downloads");
assert.match(submitSource, /<FileDownload/, "students must be able to download their submitted attachments");
assert.ok(submitSource.indexOf("const invalid = getInvalidFormAnswer") < submitSource.indexOf("await formApi.uploadFile"), "answers must be validated before uploading files");
assert.match(submitSource, /step=\{question\.type === "NUMBER" \? "any"/);
assert.match(submitSource, /max=\{question\.type === "DATE" \? "9999-12-31"/);
assert.match(submitSource, /aria-invalid=\{Boolean\(valueError\)\}/);

// Download the trusted file endpoint, preserving binary data and original names.
const bytes = new Uint8Array([0, 255, 128, 80, 68, 70, 10]);
const downloadCalls: Array<{ path: string; init?: ApiRequestInit }> = [];
const file = new Blob([bytes], { type: "application/pdf" });
const downloadApi = createFormApi(async <T>(path: string, init?: ApiRequestInit) => {
  downloadCalls.push({ path, init });
  return file as T;
});
assert.equal(await downloadApi.downloadFile(55), file);
assert.equal(downloadCalls[0]?.path, "/form/file/55");
assert.equal(downloadCalls[0]?.init?.responseType, "blob");
assert.ok(downloadCalls[0]?.init?.signal instanceof AbortSignal);
for (const fileId of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
  await assert.rejects(downloadApi.downloadFile(fileId), /파일 정보/);
}
assert.equal(downloadCalls.length, 1, "invalid IDs must not issue download requests");
const emptyDownloadApi = createFormApi(async <T>() => new Blob([]) as T);
await assert.rejects(emptyDownloadApi.downloadFile(55), /비어/);

const link = {
  href: "",
  download: "",
  click: () => { events.push("click"); },
  remove: () => { events.push("remove"); },
};
const events: string[] = [];
const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
Object.defineProperty(globalThis, "document", { configurable: true, value: {
  createElement: (tag: string) => { assert.equal(tag, "a"); return link; },
  body: { appendChild: (element: unknown) => { assert.equal(element, link); events.push("append"); } },
} });
try {
  downloadBlob(file, "홍길동 지원서.pdf");
  const firstUrl = link.href;
  assert.match(firstUrl, /^blob:/);
  assert.equal(link.download, "홍길동 지원서.pdf");
  assert.deepEqual(events, ["append", "click", "remove"]);
  assert.deepEqual(new Uint8Array(await (await fetch(firstUrl)).arrayBuffer()), bytes);
  link.click = () => { throw new Error("download blocked"); };
  assert.throws(() => downloadBlob(file, "지원서.pdf"), /download blocked/);
  const blockedUrl = link.href;
  assert.equal(events.at(-1), "remove", "temporary links must be removed on failure too");
  await new Promise((resolve) => setTimeout(resolve, 1_100));
  await assert.rejects(fetch(firstUrl), /fetch failed/, "download URLs must be released after use");
  await assert.rejects(fetch(blockedUrl), /fetch failed/, "failed download URLs must be released too");
} finally {
  if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
assert.match(submissionsSource, /downloadFile=\{fileId \? \(\) => downloadFormFile\(fileId\)/);
assert.match(submitSource, /downloadFile=\{fileId \? \(\) => formApi\.downloadFile\(fileId\)/);
assert.match(submissionsSource, /key=\{`\$\{selected\.id\}:\$\{answer\.questionId\}:\$\{fileId\}`\}/);
