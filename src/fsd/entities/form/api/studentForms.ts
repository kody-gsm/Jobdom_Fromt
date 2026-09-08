import { requestWithSession } from "@fsd/entities/user";
import type { FormSummary } from "../model/types.ts";

export const getStudentForms = () =>
  requestWithSession<FormSummary[]>("/form");
