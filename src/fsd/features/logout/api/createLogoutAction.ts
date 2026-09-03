interface LogoutDependencies {
  getRefreshToken: () => string | null | undefined;
  clearSession: () => void;
  request: (path: string, init?: RequestInit) => Promise<unknown>;
}

export const createLogoutAction = ({
  getRefreshToken,
  clearSession,
  request,
}: LogoutDependencies) => async () => {
  const refreshToken = getRefreshToken();
  clearSession();

  if (!refreshToken) return;

  await request("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
};
