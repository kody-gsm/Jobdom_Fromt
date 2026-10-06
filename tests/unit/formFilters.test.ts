import assert from "node:assert/strict";
import type { FormSummary } from "../../src/fsd/entities/form/model/types.ts";
import {
  filterForms,
  isFormClosed,
  type StudentFormSummary,
} from "../../src/fsd/pages/forms/model/formFilters.ts";

const now = new Date(2026, 8, 30, 12);
const base: FormSummary = { id: 1, title: "Alpha 지원서", description: "Frontend", deadline: null, status: "PUBLISHED", questionCount: 3, createdAt: "" };
const forms: FormSummary[] = [base, { ...base, id: 2, deadline: "2026-09-29" }, { ...base, id: 3, status: "CLOSED" }];
const studentForms: StudentFormSummary[] = [
  ...forms.map((form) => ({ ...form, submitted: false })),
  { ...base, id: 4, title: "제출한 폼", submitted: true },
];
assert.equal(isFormClosed(base, now), false);
assert.equal(isFormClosed(forms[1], now), true);
assert.equal(isFormClosed(forms[2], now), true);
assert.deepEqual(filterForms(forms, "OPEN", "", now).map((item) => item.id), [1]);
assert.deepEqual(filterForms(forms, "CLOSED", "", now).map((item) => item.id), [2, 3]);
assert.equal(filterForms(forms, "ALL", " ALPHA ", now).length, 3);
assert.equal(filterForms(forms, "ALL", "frontend", now).length, 3);
assert.equal(filterForms(forms, "ALL", "missing", now).length, 0);
assert.equal(filterForms([{ ...base, description: null }], "ALL", "frontend", now).length, 0);
assert.deepEqual(filterForms(studentForms, "SUBMITTED", "", now).map((item) => item.id), [4]);
assert.deepEqual(filterForms(studentForms, "SUBMITTED", "제출한", now).map((item) => item.id), [4]);
