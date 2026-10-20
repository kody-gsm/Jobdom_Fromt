import type { CellObject } from "write-excel-file/browser";
import type { DynamicForm, FormSubmission } from "@fsd/entities/form";
import { downloadBlob } from "@fsd/shared/lib";
import { formatSubmissionDate, getAnswerText } from "../model/submissionTable.ts";

const textCell = (value: string): CellObject => ({
  value,
  type: String,
  format: "@",
  wrap: true,
  alignVertical: "top",
});

export const getSubmissionWorkbook = (form: DynamicForm, submissions: FormSubmission[]) => {
  const questions = [...form.questions].sort((first, second) => first.orderIndex - second.orderIndex);
  const headers = ["이름", "학번", "제출일시", ...questions.map((question) => question.title)];
  const data = [
    headers.map((header) => ({
      ...textCell(header),
      fontWeight: "bold" as const,
      backgroundColor: "#E7F3EB",
      borderStyle: "thin" as const,
      borderColor: "#D1DED6",
    })),
    ...submissions.map((submission) => {
      const answers = new Map(submission.answers.map((answer) => [answer.questionId, answer]));
      return [
        submission.userName,
        submission.studentNumber,
        formatSubmissionDate(submission.submittedAt),
        ...questions.map((question) => getAnswerText(answers.get(question.id))),
      ].map(textCell);
    }),
  ];
  const safeTitle = Array.from(form.title)
    .filter((character) => character.charCodeAt(0) >= 32)
    .join("")
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/[. ]+$/g, "")
    .trim()
    .slice(0, 150) || "폼";

  return {
    data,
    options: {
      sheet: "폼 응답",
      stickyRowsCount: 1,
      columns: headers.map((_, index) => ({ width: index === 2 ? 28 : index < 2 ? 16 : 36 })),
    },
    fileName: `${safeTitle}_응답.xlsx`,
  };
};

export const exportSubmissions = async (form: DynamicForm, submissions: FormSubmission[]): Promise<void> => {
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  const workbook = getSubmissionWorkbook(form, submissions);
  downloadBlob(await writeExcelFile(workbook.data, workbook.options).toBlob(), workbook.fileName);
};
