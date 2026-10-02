export const RECRUIT_FIELD_OPTIONS = [
  { value: "FRONTEND", label: "프론트엔드" },
  { value: "BACKEND", label: "백엔드" },
  { value: "FULLSTACK", label: "풀스택" },
  { value: "MOBILE", label: "모바일" },
  { value: "IOT", label: "IoT·임베디드" },
  { value: "AI", label: "AI·데이터" },
  { value: "SECURITY", label: "정보보안" },
  { value: "ETC", label: "기타" },
] as const;

export type RecruitField = typeof RECRUIT_FIELD_OPTIONS[number]["value"];

export const formatRecruitFields = (fields: readonly RecruitField[] | null | undefined) =>
  fields?.map((field) => RECRUIT_FIELD_OPTIONS.find((option) => option.value === field)?.label ?? field).join(", ") || "미정";
