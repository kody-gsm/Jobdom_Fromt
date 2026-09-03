import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const roomRoute = readFileSync("app/room/page.tsx", "utf8");
const roomPage = readFileSync("src/fsd/pages/room/ui/RoomPage.tsx", "utf8");

assert.match(roomRoute, /@fsd\/pages\/room/);
assert.match(roomPage, /<main\s*\/>/);
assert.equal(existsSync("app/test/page.tsx"), false);
