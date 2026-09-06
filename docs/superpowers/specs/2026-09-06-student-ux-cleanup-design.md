# Student UX Cleanup Design

## Goal

학생 화면에서 리디자인 과정에 추가된 불필요한 홍보 문구, 중복 카드, 영어 라벨, 이중 스크롤을 제거하고 로그인·비밀번호 재설정·메인·프로필 흐름을 단순화한다.

## Global constraints

- Frontend only. Backend repository is read-only reference and must not be modified, committed, pushed, or PR'd.
- Work only on `test/vercel-preview` and deploy through its existing Vercel Preview.
- Preserve existing auth/session/API endpoint contracts unless an explicitly documented backend limitation prevents the requested UX.
- Teacher/Admin UI and behavior remain untouched.
- Use the existing `public/JobdamIcon.svg`, `openeye.svg`, and `closeeye.svg`; do not recolor the Jobdam logo with CSS filters.

## Login

- Remove the split promotional panel from the student auth shell.
- Render the original green Jobdam logo directly above the auth card content.
- Login page removes `다시 만나서 반가워요` and its promotional description.
- Keep email, password, remember-login, password-reset link, login button, and signup link.
- Password-manager/autofill values must be accepted even when React `onChange` did not run before submit.
- Login button must not remain disabled solely because React state missed browser autofill.

## Password reset

- User-facing naming is `비밀번호 재설정`, not `비밀번호 찾기`.
- Existing `/forgot-password` route remains for compatibility.
- Existing reset API flow is preserved.
- Backend `develop` currently sends reset mail only for users with an existing password, but returns success when the account is absent. Therefore the frontend cannot truthfully distinguish an unregistered account at send time without a backend contract change.
- Desired copy for a future distinguishable failure is exactly `가입되지 않은 계정입니다.`; do not fake this error while the API is ambiguous.

## Main dashboard

- Remove the staged hero/intro (`JOBDAM STUDENT`, marketing headline, description) and render the dashboard immediately.
- Remove the secondary `빠른 메뉴` marketing header and all decorative English eyebrow labels (`CAREER`, `LIFE`, `COUNSEL`, `RECRUIT`).
- Remove the inner `overflow-y-auto` dashboard scroller so the page has one document scroll.
- Merge career/general entry cards into one `상담 신청` card linking to `/counsel`; the consultation page keeps the existing type switch.
- Remove the duplicated top recruit shortcut card and name the remaining section `취업 공고`.
- First row: `상담 신청` card + `예정 상담` card.
- Second row: full-width `취업 공고` card/list.
- `예정 상담` 전체보기 opens an in-page modal instead of navigating to `/profile`.
- Header navigation includes exactly `상담 대시보드`, `상담 신청`, `취업 공고`.

## Profile

- Remove the large profile hero (`PROFILE`, `나의 상담 현황`, explanatory paragraph).
- Keep a simple user profile card with name/student number and current reservations.
- Remove consultation history, history detail, and memo editing UI from the profile page.
- Add profile image change control on the profile card.
- Because the backend profile response has no image field/upload endpoint, save the chosen image in browser local storage and fall back to `profileIcon.svg`.
- Accept image files only; cap local file size to avoid localStorage quota problems and show a user-facing validation error for invalid files.

## Verification

- Add/adjust contract tests before production edits and observe RED first.
- Run focused contracts after each area, then `npm run harness:verify` and `npm run harness:ready`.
- Confirm Teacher/Admin diff is zero.
- Push only after readiness passes and wait for Vercel Preview success.
