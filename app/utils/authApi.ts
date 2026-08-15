const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type RequestBody = Record<string, string>;

const requestAuth = async (path: string, body: RequestBody) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("AUTH_REQUEST_FAILED");
  }
};

export const login = (email: string, password: string) =>
  requestAuth("/auth/login", { email, password });

export const signup = (
  email: string,
  authenticationCode: string,
  password: string
) =>
  requestAuth("/auth/signup", {
    email,
    authenticationCode,
    password,
  });

export const sendSignupCode = (email: string) =>
  requestAuth("/auth/signup/code", { email });

export const sendPasswordResetCode = (email: string) =>
  requestAuth("/auth/password/code", { email });

export const resetPassword = (
  email: string,
  authenticationCode: string,
  password: string
) =>
  requestAuth("/auth/password/reset", {
    email,
    authenticationCode,
    password,
  });
