# Student Flow Fixes Design

## Goal

Fix student consultation scheduling, cancellation, form re-response, notification delivery/navigation, unread badges, and duplicate recruitment deadline presentation without changing existing backend contracts.

## Scope

- Consultation availability must reject past periods and advance to the next selectable date when today is exhausted.
- Consultation category must start unselected.
- Unapproved career requests must not appear as confirmed upcoming consultations; cancellation copy must say application cancellation.
- Successful consultation submission shows a success toast and routes to `/`.
- Cancellation requires a confirmation modal.
- Student form re-response must use the existing backend endpoint if present.
- Notification SSE/list refresh, target routing, and unread badge must work consistently.
- Remove the duplicate deadline label from the student recruitment card.
- Investigate, but do not implement, teacher timetable API availability.

## Design

Keep all changes inside existing FSD slices. Put time/date rules in consultation model helpers, API contract mapping in owning API segments, and UI state in the existing feature/widget hooks. Treat backend status as authoritative: only approved reservations are upcoming; pending career applications remain applications. Reuse the existing notification provider and router rather than introducing a second event or toast system.

## Error handling

Existing `ApiError` messages remain visible to users. Past or unavailable periods are disabled before submission, while the API response remains the final authority. If SSE is unavailable, the existing unread-count/list polling or refresh path must still update the bell state.

## Verification

Add failing contract/model tests for each changed behavior, run them before implementation, then run `npm run harness:verify`, typecheck/lint as needed, and inspect the final diff. Timetable feasibility is reported from repository/API evidence only.
