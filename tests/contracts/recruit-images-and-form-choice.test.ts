import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getRecruitImageError, MAX_RECRUIT_IMAGES, resolveRecruitImageUrl } from "../../src/fsd/entities/recruit/model/images.ts";
import { createPublishRecruitWithNotice } from "../../src/fsd/features/manage-recruit/api/publishRecruitWithNotice.ts";
import type { Recruit } from "../../src/fsd/entities/recruit/model/types.ts";

const read = (path: string) => readFileSync(path, "utf8");
const image = (size = 1024, type = "image/png") => ({ size, type });

// 공고 이미지는 서버 제한(공고당 10장, 이미지 형식)을 업로드 전에 먼저 확인한다.
assert.equal(MAX_RECRUIT_IMAGES, 10);
assert.equal(getRecruitImageError([image(), image()]), "");
assert.equal(getRecruitImageError([]), "이미지를 선택해주세요.");
assert.match(getRecruitImageError(Array.from({ length: 11 }, () => image())), /최대 10장/);
assert.match(getRecruitImageError([image(), image()], 9), /1장 더 올릴 수 있습니다/);
assert.equal(getRecruitImageError([image()], 9), "");
assert.equal(getRecruitImageError([image(1024, "application/pdf")]), "이미지 파일만 업로드할 수 있습니다.");
assert.match(getRecruitImageError([image(10 * 1024 * 1024 + 1)]), /10MB/);
assert.equal(resolveRecruitImageUrl("/uploads/recruit/a.png"), "/backend/uploads/recruit/a.png");
assert.equal(resolveRecruitImageUrl("/backend/uploads/recruit/a.png"), "/backend/uploads/recruit/a.png");
assert.equal(resolveRecruitImageUrl("https://cdn.example.com/a.png"), "https://cdn.example.com/a.png");

// 폼 없이 만든 공고도 공개 후 고른 채널에 알림을 보내고, 채널 발송 실패는 공개 결과를 되돌리지 않는다.
const published: Recruit = { id: 3, companyName: "잡담", interviewDate: null, deadline: null, summary: null, formId: null, status: "PUBLISHED", createdAt: "", updatedAt: "" };
const calls: string[] = [];
const publish = (failNotice: boolean) => createPublishRecruitWithNotice({
  publishTeacher: async (id) => { calls.push(`publish:${id}`); return published; },
  sendNoticeToChannel: async (recruit, channelId) => {
    calls.push(`notice:${recruit.id}:${channelId}`);
    if (failNotice) throw new Error("발송 실패");
    return "message-id";
  },
});
assert.deepEqual(await publish(false)(3, null), { recruit: published, channelNotice: "none" });
assert.deepEqual(calls.splice(0), ["publish:3"]);
assert.deepEqual(await publish(false)(3, "1564185374937452697"), { recruit: published, channelNotice: "sent" });
assert.deepEqual(calls.splice(0), ["publish:3", "notice:3:1564185374937452697"]);
assert.deepEqual(await publish(true)(3, "1564185374937452697"), { recruit: published, channelNotice: "failed" });
await assert.rejects(createPublishRecruitWithNotice({
  publishTeacher: async () => { throw new Error("공개 실패"); },
  sendNoticeToChannel: async () => assert.fail("공개 실패 후 알림을 보내면 안 된다."),
})(3, "1564185374937452697"), /공개 실패/);

const page = read("src/fsd/pages/teacher-recruit/ui/TeacherRecruitPage.tsx");
const choiceDialog = read("src/fsd/pages/teacher-recruit/ui/RecruitFormChoiceDialog.tsx");
const publishDialog = read("src/fsd/pages/teacher-recruit/ui/RecruitPublishDialog.tsx");
const imageManager = read("src/fsd/pages/teacher-recruit/ui/RecruitImageManager.tsx");

// 새 공고는 처음 저장·공개·이미지 분석할 때 지원 폼 생성 여부를 묻고, 그 선택으로 공고를 만든다.
assert.match(page, /if \(selectedId === null\) \{\s*setChoiceError\(""\);\s*setPendingCreate\(\{ intent: publish \? "publish" : "save" \}\);/);
assert.match(page, /setPendingCreate\(\{ intent: "analyze", images \}\)/);
assert.match(page, /await createRecruit\(form, createForm\)/);
assert.match(page, /await analyzeRecruit\(pendingCreate\.images, createForm\)/);
assert.match(page, /<RecruitFormChoiceDialog/);
assert.match(choiceDialog, /aria-modal="true"/);
assert.match(choiceDialog, /지원 폼을 함께 만들까요\?/);
assert.match(choiceDialog, /onChoose\(true\)/);
assert.match(choiceDialog, /onChoose\(false\)/);
assert.match(choiceDialog, /나중에 바꿀 수 없습니다/);

// 지원 폼이 있으면 폼 화면에서 함께 공개하고, 없으면 공개 모달에서 채널을 골라 바로 공개한다.
assert.match(page, /if \(recruit\.formId\) \{\s*router\.push/);
assert.match(page, /setPublishTarget\(recruit\)/);
assert.match(page, /publishRecruitWithNotice\(publishTarget\.id, channelId\)/);
assert.match(page, /\{hasForm \? "폼 작성 후 공개" : "공개"\}/);
assert.match(publishDialog, /<NoticeChannelPicker value=\{channelId\} onChange=\{setChannelId\} disabled=\{pending\} \/>/);
assert.match(publishDialog, /onConfirm\(channelId \|\| null\)/);

// 이미지는 여러 장을 고를 수 있고, 만든 공고에는 추가·삭제할 수 있다.
assert.match(page, /<input type="file" multiple accept=\{RECRUIT_IMAGE_ACCEPT\} onChange=\{analyze\}/);
assert.match(page, /getRecruitImageError\(images, selected\.recruit\.images\?\.length \?\? 0\)/);
assert.match(page, /await addRecruitImages\(selected\.recruit\.id, images\)/);
assert.match(page, /await deleteRecruitImage\(selected\.recruit\.id, image\.id\)/);
assert.match(page, /<RecruitImageGallery images=\{selected\.recruit\.images \?\? \[\]\} \/>/);
assert.match(imageManager, /<input type="file" multiple accept=\{RECRUIT_IMAGE_ACCEPT\}/);
assert.match(imageManager, /disabled=\{disabled \|\| isFull\}/);

console.log("recruit images and form choice contract passed");
