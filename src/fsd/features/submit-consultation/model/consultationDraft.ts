import type {
  CounselingCategory,
  ConsultationType,
} from "@fsd/entities/consultation";

export type ConsultationDraftSnapshot = {
  title: string;
  content: string;
  category: CounselingCategory | null;
  teacherId: number | null;
  date: string | null;
  period: string | null;
};

export type ConsultationDrafts = Record<ConsultationType, ConsultationDraftSnapshot>;

export type ConsultationDraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const createEmptyDraft = (): ConsultationDraftSnapshot => ({
  title: "",
  content: "",
  category: null,
  teacherId: null,
  date: null,
  period: null,
});

export const createEmptyConsultationDraft = createEmptyDraft;

export const getConsultationDraftStorageKey = (identity: string) =>
  `jobdam:consultation-draft:${encodeURIComponent(identity)}`;

const isConsultationType = (value: unknown): value is ConsultationType =>
  value === "career" || value === "general";

const normalizeDraft = (value: unknown): ConsultationDraftSnapshot => {
  if (!value || typeof value !== "object") return createEmptyDraft();
  const candidate = value as Partial<ConsultationDraftSnapshot>;
  if (
    typeof candidate.title !== "string" ||
    typeof candidate.content !== "string" ||
    (candidate.category !== null && typeof candidate.category !== "string") ||
    (candidate.teacherId !== null &&
      (typeof candidate.teacherId !== "number" || !Number.isSafeInteger(candidate.teacherId))) ||
    (candidate.date !== null && typeof candidate.date !== "string") ||
    (candidate.period !== null && typeof candidate.period !== "string")
  ) {
    return createEmptyDraft();
  }
  return {
    title: candidate.title,
    content: candidate.content,
    category: candidate.category ?? null,
    teacherId: candidate.teacherId ?? null,
    date: candidate.date ?? null,
    period: candidate.period ?? null,
  };
};

export const readConsultationDrafts = (
  storage: ConsultationDraftStorage,
  key: string,
): ConsultationDrafts => {
  const empty: ConsultationDrafts = {
    career: createEmptyDraft(),
    general: createEmptyDraft(),
  };
  try {
    const raw = storage.getItem(key);
    if (!raw) return empty;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return empty;
    const record = parsed as Partial<Record<ConsultationType, unknown>>;
    return {
      career: isConsultationType("career") ? normalizeDraft(record.career) : createEmptyDraft(),
      general: isConsultationType("general") ? normalizeDraft(record.general) : createEmptyDraft(),
    };
  } catch {
    return empty;
  }
};

export const writeConsultationDraft = (
  storage: ConsultationDraftStorage,
  key: string,
  type: ConsultationType,
  draft: ConsultationDraftSnapshot,
) => {
  try {
    const drafts = readConsultationDrafts(storage, key);
    drafts[type] = normalizeDraft(draft);
    storage.setItem(key, JSON.stringify(drafts));
  } catch {
    // Draft persistence is best effort and must not interrupt form input.
  }
};

export const clearConsultationDraft = (
  storage: ConsultationDraftStorage,
  key: string,
  type: ConsultationType,
) => {
  try {
    const drafts = readConsultationDrafts(storage, key);
    drafts[type] = createEmptyDraft();
    const hasDraft = Object.values(drafts).some((draft) =>
      draft.title || draft.content || draft.category || draft.teacherId !== null || draft.date || draft.period,
    );
    if (hasDraft) storage.setItem(key, JSON.stringify(drafts));
    else storage.removeItem(key);
  } catch {
    // Draft persistence is best effort and must not interrupt cancellation.
  }
};
