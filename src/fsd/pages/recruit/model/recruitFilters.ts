import type { Recruit } from "@fsd/entities/recruit";
import { isDeadlinePassed } from "@fsd/shared/lib";

export type RecruitListFilter = "ALL" | "OPEN" | "CLOSED";

export const isRecruitClosed = (
  recruit: Pick<Recruit, "deadline" | "status">,
  now = new Date(),
) => recruit.status === "CLOSED" || isDeadlinePassed(recruit.deadline, now);

export const filterRecruits = (
  recruits: Recruit[],
  filter: RecruitListFilter,
  query: string,
  now = new Date(),
) => {
  const normalizedQuery = query.trim().toLowerCase();

  return recruits.filter((recruit) => {
    const isClosed = isRecruitClosed(recruit, now);
    const matchesFilter = filter === "ALL" || (filter === "CLOSED" ? isClosed : !isClosed);
    const searchableText = [recruit.companyName, recruit.summary]
      .filter((value): value is string => Boolean(value))
      .join(" ")
      .toLowerCase();

    return matchesFilter && (!normalizedQuery || searchableText.includes(normalizedQuery));
  });
};
