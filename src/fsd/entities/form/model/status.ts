import type { FormSummary } from "./types.ts";
import { isDeadlinePassed } from "@fsd/shared/lib";

export const isFormClosed = (
  form: Pick<FormSummary, "deadline" | "status">,
  now = new Date(),
) => form.status === "CLOSED" || isDeadlinePassed(form.deadline, now);
