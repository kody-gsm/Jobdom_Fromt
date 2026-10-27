import assert from "node:assert/strict";
import { ApiError, request } from "../../src/fsd/shared/api/index.ts";
import { createBannerApi, resolveBannerImageUrl } from "../../src/fsd/entities/banner/index.ts";
import { canManageHomeBanner } from "../../src/fsd/pages/teacher/model/workspace.ts";

assert.equal(canManageHomeBanner("TEACHER"), true);
assert.equal(canManageHomeBanner("WEE_TEACHER"), true);
assert.equal(canManageHomeBanner("STUDENT"), false);
assert.equal(canManageHomeBanner("ADMIN"), false);
assert.equal(canManageHomeBanner(null), false);

const originalBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const originalFetch = globalThis.fetch;
try {
  process.env.NEXT_PUBLIC_API_BASE_URL = "/backend";
  assert.equal(resolveBannerImageUrl("/uploads/banner/new.png"), "/backend/uploads/banner/new.png");
  assert.equal(resolveBannerImageUrl("/backend/uploads/banner/new.png"), "/backend/uploads/banner/new.png");
  assert.equal(resolveBannerImageUrl("https://cdn.example.com/new.png"), "https://cdn.example.com/new.png");
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com/backend/";
  assert.equal(resolveBannerImageUrl("/uploads/banner/new.png"), "https://api.example.com/backend/uploads/banner/new.png");
  assert.equal(resolveBannerImageUrl("/backend/uploads/banner/new.png"), "https://api.example.com/backend/uploads/banner/new.png");
  process.env.NEXT_PUBLIC_API_BASE_URL = "/backend";

  const api = createBannerApi(<T>(path: string, init?: RequestInit) =>
    request<T>(path, init, { accessToken: "teacher-token" }));
  const saved = { id: 2, imageUrl: "/uploads/banner/new.png", title: "새 배너", content: null, link: null, createdAt: "", updatedAt: "" };
  globalThis.fetch = async (url, init) => {
    assert.equal(url, "/backend/teacher/banner");
    assert.equal(init?.method, "POST");
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("Authorization"), "Bearer teacher-token");
    assert.equal(headers.has("Content-Type"), false);
    assert.ok(init?.body instanceof FormData);
    const file = init.body.get("image");
    assert.ok(file instanceof File);
    assert.equal(file.name, "banner.png");
    assert.equal(await file.text(), "new-image");
    assert.equal(init.body.get("title"), "새 배너");
    assert.equal(init.body.has("content"), false);
    assert.equal(init.body.has("link"), false);
    return Response.json(saved);
  };
  assert.deepEqual(await api.saveTeacher(new File(["new-image"], "banner.png", { type: "image/png" }), { title: " 새 배너 ", content: " ", link: "" }), saved);

  for (const path of ["/teacher/banner", "/student/banner"]) {
    globalThis.fetch = async (url, init) => {
      assert.equal(url, `/backend${path}`);
      assert.equal(init?.cache, "no-store");
      return Response.json(saved);
    };
    assert.deepEqual(await (path === "/teacher/banner" ? api.getTeacher() : api.getStudent()), saved);
  }
  globalThis.fetch = async () => new Response(null, { status: 204 });
  assert.equal(await api.getStudent(), null);
  globalThis.fetch = async () => Response.json({ message: "저장 실패" }, { status: 500 });
  await assert.rejects(api.saveTeacher(new File(["image"], "banner.png", { type: "image/png" }), {}), (error) => error instanceof ApiError && error.message === "저장 실패");
} finally {
  globalThis.fetch = originalFetch;
  if (originalBase === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
  else process.env.NEXT_PUBLIC_API_BASE_URL = originalBase;
}

console.log("banner permissions, upload and current-image contract passed");
