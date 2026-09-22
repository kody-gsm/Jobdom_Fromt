export const getConsultationTeacherLabel = (name: string) => {
  const normalizedName = name.trim();
  if (!normalizedName) return "";
  return normalizedName.endsWith("선생님")
    ? normalizedName
    : `${normalizedName} 선생님`;
};
