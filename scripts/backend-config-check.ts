import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const config = readFileSync(resolve("next.config.ts"), "utf8");

assert.match(
  config,
  /process\.env\.BACKEND_API_URL\s*\|\|\s*["']https:\/\/jobdam\.https\.gsmsv\.site["']/,
  "BACKEND_API_URL이 없을 때 운영 백엔드 주소를 fallback으로 사용해야 합니다.",
);

assert.match(
  config,
  /source:\s*["']\/backend\/:path\*["']/,
  "/backend 프록시 경로가 유지되어야 합니다.",
);

console.log("backend config contract passed");
