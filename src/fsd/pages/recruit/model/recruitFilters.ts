import type { Recruit, RecruitField } from "@fsd/entities/recruit";
import { formatRecruitFields, isRecruitClosed } from "@fsd/entities/recruit";

export type RecruitListFilter = "ALL" | "OPEN" | "CLOSED";

export { isRecruitClosed } from "@fsd/entities/recruit";

export const filterRecruits = (
  recruits: Recruit[],
  filter: RecruitListFilter,
  query: string,
  now = new Date(),
  field: RecruitField | "ALL" = "ALL",
) => {
  const normalizedQuery = query.trim().toLowerCase();

  return recruits.filter((recruit) => {
    const isClosed = isRecruitClosed(recruit, now);
    const matchesFilter = filter === "ALL" || (filter === "CLOSED" ? isClosed : !isClosed);
    const matchesField = field === "ALL" || recruit.fields?.includes(field);
    const searchableText = [recruit.companyName, recruit.summary, formatRecruitFields(recruit.fields)]
      .filter((value): value is string => Boolean(value))
      .join(" ")
      .toLowerCase();

    return matchesFilter && matchesField && (!normalizedQuery || searchableText.includes(normalizedQuery));
  });
};
