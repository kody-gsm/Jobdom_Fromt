import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createSyncStudents } from "../../src/fsd/features/sync-students/api/createSyncStudents.ts";

const calls: Array<[string, RequestInit | undefined]> = [];
const syncStudents = createSyncStudents(async (path, init) => {
  calls.push([path, init]);
  return { syncedCount: 27 };
});

assert.deepEqual(await syncStudents(), { syncedCount: 27 });
assert.equal(calls[0]?.[0], "/admin/students/sync");
assert.equal(calls[0]?.[1]?.method, "POST");

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const route = read("app/admin/page.tsx");
const page = read("src/fsd/pages/admin/ui/AdminPage.tsx");

assert.match(route, /@fsd\/pages\/admin/);
assert.match(page, /SiteHeader/);
assert.match(page, /syncStudents/);
assert.match(page, /관리자 계정으로 로그인해야 실행할 수 있습니다/);
assert.match(page, /syncedCount/);
assert.doesNotMatch(page, /router\.replace/);
