import type { Recruit } from "./types.ts";

// 목록에서 이미 본 공고의 폼 연결 여부. 상세 화면이 공고 상세를 기다리지 않고
// 신청 폼 목록을 함께 요청할 수 있게 한다. 힌트일 뿐이라 상세 응답이 항상 우선한다.
const formLinkHints = new Map<number, boolean>();
const MAX_HINTS = 500;

export const rememberRecruitFormLinks = <T extends readonly Recruit[]>(recruits: T): T => {
  for (const recruit of recruits) {
    formLinkHints.delete(recruit.id);
    formLinkHints.set(recruit.id, recruit.formId != null);
  }
  while (formLinkHints.size > MAX_HINTS) {
    const oldest = formLinkHints.keys().next().value;
    if (oldest === undefined) break;
    formLinkHints.delete(oldest);
  }
  return recruits;
};

export const hasRecruitFormLinkHint = (recruitId: number) => formLinkHints.get(recruitId) === true;
