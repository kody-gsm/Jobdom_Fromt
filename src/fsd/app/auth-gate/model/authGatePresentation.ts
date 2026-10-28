export type AuthGateStatus = "checking" | "allowed" | "redirecting";

export const shouldRenderAuthChildren = (status: AuthGateStatus) => status !== "redirecting";
