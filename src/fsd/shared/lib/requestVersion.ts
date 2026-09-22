export const createRequestVersionGuard = () => {
  let latestVersion = 0;

  return {
    next: () => ++latestVersion,
    isLatest: (version: number) => version === latestVersion,
  };
};
