const HAS_TIMEZONE = /(?:Z|[+-]\d{2}:\d{2})$/i;

const parseNotificationTimestamp = (value: string) =>
  new Date(HAS_TIMEZONE.test(value) ? value : `${value}Z`).getTime();

export const formatNotificationTime = (
  value: string,
  now = Date.now(),
): string => {
  const timestamp = parseNotificationTimestamp(value);
  if (!Number.isFinite(timestamp)) return "시간 정보 없음";

  const minutes = Math.max(0, Math.floor((now - timestamp) / 60_000));
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(timestamp).toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
  });
};
