import { createFormApi } from "@fsd/entities/form";
import { requestWithSession } from "@fsd/entities/user";

const formApi = createFormApi(requestWithSession);

export const getTeacherForms = formApi.getTeacherAll;
export const getTeacherForm = formApi.getTeacherById;
export const createForm = formApi.createTeacher;
export const updateForm = formApi.updateTeacher;
export const publishForm = formApi.publishTeacher;
export const closeForm = formApi.closeTeacher;
