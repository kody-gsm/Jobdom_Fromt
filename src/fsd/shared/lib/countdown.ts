export const getCountdownSecondsLeft = (deadline: number | null, now = Date.now()) =>
  deadline === null ? 0 : Math.max(0, Math.ceil((deadline - now) / 1000));

export const formatCountdown = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const remainder = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${remainder}`;
};
