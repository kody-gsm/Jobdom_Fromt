import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const { createLogoutAction } = await import(
  "../../src/fsd/features/logout/api/createLogoutAction.ts"
);

const calls: string[] = [];
const logout = createLogoutAction({
  getRefreshToken: () => "refresh-token",
  clearSession: () => calls.push("clear"),
  request: async (path, init) => {
    calls.push(`${init?.method}:${path}:${init?.body}`);
  },
});

await logout();
assert.deepEqual(calls, [
  "clear",
  'POST:/auth/logout:{"refreshToken":"refresh-token"}',
]);

const header = readFileSync(
  resolve(process.cwd(), "src/fsd/widgets/site-header/ui/SiteHeader.tsx"),
  "utf8",
);
assert.match(header, /href="\/profile"/);
assert.match(header, /router\.push\("\/login"\)/);
assert.match(header, /window\.addEventListener\("scroll"/);
assert.match(header, /JobdamIcon\.svg/);
