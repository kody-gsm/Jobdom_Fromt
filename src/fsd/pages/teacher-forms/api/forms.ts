import { createFormApi } from "@fsd/entities/form";
import { createRecruitApi } from "@fsd/entities/recruit";
import { requestWithSession } from "@fsd/entities/user";

const formApi = createFormApi(requestWithSession);
const recruitApi = createRecruitApi(requestWithSession);

export const getTeacherForms = formApi.getTeacherAll;
export const getTeacherForm = formApi.getTeacherById;
export const getFormSubmissions = formApi.getSubmissions;
export const createForm = formApi.createTeacher;
export const updateForm = formApi.updateTeacher;
export const publishForm = async (formId: number) => {
  const recruit = (await recruitApi.getTeacherAll()).find((candidate) => candidate.formId === formId);
  if (recruit?.status === "DRAFT") {
    await recruitApi.publishTeacher(recruit.id);
    return formApi.getTeacherById(formId);
  }
  return formApi.publishTeacher(formId);
};
export const closeForm = formApi.closeTeacher;
