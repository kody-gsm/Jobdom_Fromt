import type { FormSummary } from "@fsd/entities/form";
import { isFormClosed } from "@fsd/entities/form";

export type FormListFilter = "ALL" | "OPEN" | "CLOSED" | "SUBMITTED";

export type StudentFormSummary = FormSummary;

export { isFormClosed } from "@fsd/entities/form";

// 검색어를 칠 때마다 폼마다 검색 문자열을 다시 만들지 않도록 폼 객체별로 한 번만 만든다.
const searchableTextCache = new WeakMap<StudentFormSummary, string>();
const getSearchableText = (form: StudentFormSummary) => {
  let text = searchableTextCache.get(form);
  if (text === undefined) {
    text = [form.title, form.description]
      .filter((value): value is string => Boolean(value))
      .join(" ")
      .toLowerCase();
    searchableTextCache.set(form, text);
  }
  return text;
};

export const filterForms = (
  forms: StudentFormSummary[],
  filter: FormListFilter,
  query: string,
  now = new Date(),
) => {
  const normalizedQuery = query.trim().toLowerCase();

  return forms.filter((form) => {
    const isClosed = isFormClosed(form, now);
    const matchesFilter = filter === "ALL"
      || (filter === "SUBMITTED" ? form.submitted === true : filter === "CLOSED" ? isClosed : !isClosed);
    return matchesFilter && (!normalizedQuery || getSearchableText(form).includes(normalizedQuery));
  });
};
