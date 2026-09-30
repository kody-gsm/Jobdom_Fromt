import type { FormSummary } from "@fsd/entities/form";
import { isDeadlinePassed } from "@fsd/shared/lib";

export type FormListFilter = "ALL" | "OPEN" | "CLOSED";

export const isFormClosed = (
  form: Pick<FormSummary, "deadline" | "status">,
  now = new Date(),
) => form.status === "CLOSED" || isDeadlinePassed(form.deadline, now);

export const filterForms = (
  forms: FormSummary[],
  filter: FormListFilter,
  query: string,
  now = new Date(),
) => {
  const normalizedQuery = query.trim().toLowerCase();

  return forms.filter((form) => {
    const isClosed = isFormClosed(form, now);
    const matchesFilter = filter === "ALL" || (filter === "CLOSED" ? isClosed : !isClosed);
    const searchableText = [form.title, form.description]
      .filter((value): value is string => Boolean(value))
      .join(" ")
      .toLowerCase();

    return matchesFilter && (!normalizedQuery || searchableText.includes(normalizedQuery));
  });
};
