import assert from "node:assert/strict";
import { inflateRawSync } from "node:zlib";
import writeExcelFile from "write-excel-file/universal";
import type { DynamicForm, FormAnswer, FormSubmission } from "../../src/fsd/entities/form/index.ts";
import { getSubmissionWorkbook } from "../../src/fsd/pages/teacher-form-submissions/lib/exportSubmissions.ts";
import {
  formatSubmissionDate,
  getAnswerText,
  getSpreadsheetColumnLabel,
} from "../../src/fsd/pages/teacher-form-submissions/model/submissionTable.ts";

const answer = (questionId: number, values: Partial<FormAnswer> = {}): FormAnswer => ({
  questionId,
  questionTitle: "이전 질문 제목",
  type: "SHORT_TEXT",
  textValue: null,
  selectedOptionIds: [],
  selectedOptionLabels: [],
  fileId: null,
  fileName: null,
  fileSize: null,
  fileDownloadUrl: null,
  ...values,
});

const form: DynamicForm = {
  id: 1,
  title: "지원/신청: 폼?",
  description: null,
  status: "PUBLISHED",
  deadline: null,
  createdAt: "2026-10-20T00:00:00Z",
  updatedAt: "2026-10-20T00:00:00Z",
  questions: [
    { id: 2, orderIndex: 1, type: "MULTIPLE_CHOICE", title: "희망 분야", description: null, required: false, options: [] },
    { id: 1, orderIndex: 0, type: "LONG_TEXT", title: "자기소개 & <경험>", description: null, required: false, options: [] },
    { id: 3, orderIndex: 2, type: "FILE", title: "첨부 파일", description: null, required: false, options: [] },
    { id: 4, orderIndex: 3, type: "SHORT_TEXT", title: "미응답", description: null, required: false, options: [] },
  ],
};

const submission: FormSubmission = {
  id: 1,
  userId: 5,
  formId: 1,
  formTitle: form.title,
  userName: "홍길동",
  studentNumber: "00123",
  submittedAt: "2026-10-20T01:23:45Z",
  answers: [
    answer(3, { type: "FILE", fileId: 8, fileName: "이력서.xlsx" }),
    answer(2, { type: "MULTIPLE_CHOICE", selectedOptionLabels: ["개발", "디자인"] }),
    answer(1, { type: "LONG_TEXT", textValue: '=HYPERLINK("https://example.com")\n한글 & <태그>' }),
  ],
};

assert.equal(getAnswerText(undefined), "");
assert.equal(getAnswerText(answer(1)), "");
assert.equal(getAnswerText(submission.answers[0]), "이력서.xlsx");
assert.equal(getAnswerText(answer(3, { type: "FILE", fileId: 8 })), "첨부 파일");
assert.equal(getAnswerText(answer(3, { type: "FILE", fileId: 8, fileName: "" })), "첨부 파일");
assert.equal(getAnswerText(submission.answers[1]), "개발, 디자인");
assert.equal(getAnswerText(submission.answers[2]), submission.answers[2].textValue);
assert.deepEqual([0, 25, 26, 51, 52, 701, 702].map(getSpreadsheetColumnLabel), ["A", "Z", "AA", "AZ", "BA", "ZZ", "AAA"]);

const timestamps = ["2026-10-20T09:05:00", "2026-10-20T00:05:00Z", "2026-10-20T09:05:00+09:00"];
const expectedDate = new Date(timestamps[1]).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
const originalTimeZone = process.env.TZ;
try {
  for (const timeZone of ["Asia/Seoul", "America/Los_Angeles"]) {
    process.env.TZ = timeZone;
    assert.deepEqual(timestamps.map(formatSubmissionDate), timestamps.map(() => expectedDate));
    for (const submittedAt of timestamps) {
      assert.equal(getSubmissionWorkbook(form, [{ ...submission, submittedAt }]).data[1][2].value, expectedDate);
    }
  }
} finally {
  if (originalTimeZone === undefined) delete process.env.TZ;
  else process.env.TZ = originalTimeZone;
}

const workbook = getSubmissionWorkbook(form, [submission]);
assert.equal(workbook.fileName, "지원_신청_ 폼__응답.xlsx");
assert.equal(getSubmissionWorkbook({ ...form, title: "   " }, []).fileName, "폼_응답.xlsx");
assert.equal(workbook.options.sheet, "폼 응답");
assert.equal(workbook.options.stickyRowsCount, 1);
assert.equal(workbook.options.columns.length, 7);
assert.deepEqual(workbook.data[0].map((cell) => cell.value), ["이름", "학번", "제출일시", "자기소개 & <경험>", "희망 분야", "첨부 파일", "미응답"]);
assert.deepEqual(workbook.data[1].map((cell) => cell.value), [
  "홍길동", "00123", new Date(submission.submittedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
  submission.answers[2].textValue, "개발, 디자인", "이력서.xlsx", "",
]);
assert.deepEqual(form.questions.map((question) => question.id), [2, 1, 3, 4]);
assert.equal(getSubmissionWorkbook(form, []).data.length, 1);
assert.ok(workbook.data.flat().every((cell) => cell.type === String && cell.format === "@" && cell.wrap));

const blob = await writeExcelFile(workbook.data, workbook.options).toBlob();
const zip = Buffer.from(await blob.arrayBuffer());
assert.equal(zip.readUInt32LE(0), 0x04034b50);

// Read central directory entries so compressed sizes work with streamed ZIP data too.
const files = new Map<string, string>();
for (let offset = 0; offset <= zip.length - 46; offset += 1) {
  if (zip.readUInt32LE(offset) !== 0x02014b50) continue;
  const compression = zip.readUInt16LE(offset + 10);
  const compressedSize = zip.readUInt32LE(offset + 20);
  const nameLength = zip.readUInt16LE(offset + 28);
  const localOffset = zip.readUInt32LE(offset + 42);
  const name = zip.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");
  const contentOffset = localOffset + 30 + zip.readUInt16LE(localOffset + 26) + zip.readUInt16LE(localOffset + 28);
  const compressed = zip.subarray(contentOffset, contentOffset + compressedSize);
  assert.ok(compression === 0 || compression === 8);
  files.set(name, (compression === 8 ? inflateRawSync(compressed) : compressed).toString("utf8"));
}

const worksheet = files.get("xl/worksheets/sheet1.xml") || "";
const sharedStrings = files.get("xl/sharedStrings.xml") || "";
assert.match(files.get("xl/workbook.xml") || "", /name="폼 응답"/);
assert.match(worksheet, /state="frozen"/);
assert.match(worksheet, /ySplit="1"/);
assert.doesNotMatch(worksheet, /<f[\s>]/);
assert.match(worksheet, /r="B2"[^>]*t="s"/);
assert.match(sharedStrings, /00123/);
assert.match(sharedStrings, /홍길동/);
assert.match(sharedStrings, /=HYPERLINK/);
assert.match(sharedStrings, /\n한글 &amp; &lt;태그&gt;/);
assert.match(sharedStrings, /개발, 디자인/);
assert.match(sharedStrings, /이력서\.xlsx/);
assert.match(files.get("xl/styles.xml") || "", /wrapText="1"/);
assert.match(files.get("xl/styles.xml") || "", /formatCode="@"/);

console.log("submission export tests passed");
