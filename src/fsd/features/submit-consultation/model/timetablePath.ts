export const createTimetablePath = (from: string, to: string) => {
  const query = new URLSearchParams({ from, to });
  return `/student/timetable?${query.toString()}`;
};
