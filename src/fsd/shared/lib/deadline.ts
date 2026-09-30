const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_PREFIX_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

const normalizeDeadline = (deadline: string) => {
  const value = deadline.trim();
  if (DATE_ONLY_PATTERN.test(value)) return `${value}T23:59:59.999`;
  return value.replace(/(\.\d{3})\d+/, "$1");
};

const parseDeadline = (deadline: string | null | undefined) => {
  if (!deadline?.trim()) return null;
  const date = new Date(normalizeDeadline(deadline));
  return Number.isNaN(date.getTime()) ? null : date;
};

export const isDeadlinePassed = (
  deadline: string | null | undefined,
  now = new Date(),
) => {
  const parsedDeadline = parseDeadline(deadline);
  return parsedDeadline !== null && now.getTime() > parsedDeadline.getTime();
};

export const formatDeadlineDate = (deadline: string | null | undefined) => {
  if (!deadline) return "제한 없음";
  const match = deadline.trim().match(DATE_PREFIX_PATTERN);
  return match ? `${match[1]}. ${match[2]}. ${match[3]}.` : deadline;
};
