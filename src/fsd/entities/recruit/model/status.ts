import type { Recruit } from "./types.ts";
import { isDeadlinePassed } from "@fsd/shared/lib";

export const isRecruitClosed = (
  recruit: Pick<Recruit, "deadline" | "status">,
  now = new Date(),
) => recruit.status === "CLOSED" || isDeadlinePassed(recruit.deadline, now);
