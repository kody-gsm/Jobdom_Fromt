import type { Recruit, RecruitField } from "@fsd/entities/recruit";
import { formatRecruitFields, isRecruitClosed } from "@fsd/entities/recruit";

export type RecruitListFilter = "ALL" | "OPEN" | "CLOSED";

export { isRecruitClosed } from "@fsd/entities/recruit";

// 검색어를 칠 때마다 공고마다 검색 문자열을 다시 만들지 않도록 공고 객체별로 한 번만 만든다.
const searchableTextCache = new WeakMap<Recruit, string>();
const getSearchableText = (recruit: Recruit) => {
  let text = searchableTextCache.get(recruit);
  if (text === undefined) {
    text = [recruit.companyName, recruit.summary, formatRecruitFields(recruit.fields)]
      .filter((value): value is string => Boolean(value))
      .join(" ")
      .toLowerCase();
    searchableTextCache.set(recruit, text);
  }
  return text;
};

export const filterRecruits = (
  recruits: Recruit[],
  filter: RecruitListFilter,
  query: string,
  now = new Date(),
  fields: readonly RecruitField[] = [],
) => {
  const normalizedQuery = query.trim().toLowerCase();
  const selectedFields = new Set(fields);

  return recruits.filter((recruit) => {
    const isClosed = isRecruitClosed(recruit, now);
    const matchesFilter = filter === "ALL" || (filter === "CLOSED" ? isClosed : !isClosed);
    const matchesField = selectedFields.size === 0 || (recruit.fields ?? []).some((field) => selectedFields.has(field));
    return matchesFilter && matchesField && (!normalizedQuery || getSearchableText(recruit).includes(normalizedQuery));
  });
};
