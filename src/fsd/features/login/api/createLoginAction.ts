interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  email: string;
  name: string;
}

type Request = <T>(path: string, init?: RequestInit) => Promise<T>;
type SaveSession<TSession> = (
  response: LoginResponse,
  rememberLogin?: boolean,
) => TSession;

export const createLoginAction = <TSession>({
  request,
  saveSession,
}: {
  request: Request;
  saveSession: SaveSession<TSession>;
}) => async (
  email: string,
  password: string,
  rememberLogin = false,
): Promise<TSession> => {
  const response = await request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return saveSession(response, rememberLogin);
};
