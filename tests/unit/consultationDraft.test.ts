import assert from "node:assert/strict";
import {
  createEmptyConsultationDraft,
  getConsultationDraftStorageKey,
  readConsultationDrafts,
  writeConsultationDraft,
  type ConsultationDraftStorage,
} from "../../src/fsd/features/submit-consultation/model/consultationDraft.ts";

class MemoryStorage implements ConsultationDraftStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

const storage = new MemoryStorage();
const key = getConsultationDraftStorageKey("student-12");
const career = {
  ...createEmptyConsultationDraft(),
  title: "진로 상담",
  content: "포트폴리오 방향이 궁금합니다.",
  teacherId: 3,
  date: "2026-10-10",
  period: "3교시",
};

writeConsultationDraft(storage, key, "career", career);
const saved = readConsultationDrafts(storage, key);
assert.deepEqual(saved.career, career);
assert.deepEqual(saved.general, createEmptyConsultationDraft());

writeConsultationDraft(storage, key, "general", {
  ...createEmptyConsultationDraft(),
  title: "일반 상담",
});
const separated = readConsultationDrafts(storage, key);
assert.equal(separated.career.title, "진로 상담");
assert.equal(separated.general.title, "일반 상담");

storage.setItem(key, JSON.stringify({ career: { title: 123 }, general: null }));
const invalid = readConsultationDrafts(storage, key);
assert.deepEqual(invalid.career, createEmptyConsultationDraft());
assert.deepEqual(invalid.general, createEmptyConsultationDraft());

assert.notEqual(
  getConsultationDraftStorageKey("student-12"),
  getConsultationDraftStorageKey("student-13"),
);

console.log("consultation draft tests passed");
