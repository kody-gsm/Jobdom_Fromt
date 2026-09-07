import { createFormApi } from "@fsd/entities/form";
import { requestWithSession } from "@fsd/entities/user";

const formApi = createFormApi(requestWithSession);

export const getTeacherForm = formApi.getTeacherById;
export const getFormSubmissions = formApi.getSubmissions;
export const getFormSubmission = formApi.getSubmission;
