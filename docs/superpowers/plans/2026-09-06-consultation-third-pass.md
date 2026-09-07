# Consultation Third-Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the student consultation form around the approved two-column design, make validation errors scroll/focus the failing field, and connect student WAITING requests to teacher approval and real unavailable-slot data.

**Architecture:** Keep the existing backend WAITING → RESERVED state machine, but expose enough state/detail for the frontend and add a student-safe unavailable-slot query. On the frontend, extend the consultation domain contracts, keep form behavior in `useConsultationForm`, split the redesigned content/schedule panels into focused UI components, and make TeacherPage read pending requests before approval.

**Tech Stack:** Java 21, Spring Boot 3.3.2, Spring Data JPA, JUnit 5/Mockito, Next.js 16.2.7, React 19, TypeScript, Tailwind CSS v4, Node contract tests.

**Spec:** `docs/superpowers/specs/2026-09-06-consultation-third-pass-design.md`

## Global Constraints

- Student consultation main color is `#02C551`; remove student-form selection emphasis based on `#10243E`/`#1B3555`.
- Remove `수업 담당 선생님의 허가를 먼저 받아주세요.` and do not replace it with another confusing permission warning.
- Only `예약 불가` is rendered as slot status text; do not render `예약 가능` or `선택됨`.
- Student submission creates `WAITING`; only teacher approval changes it to `RESERVED`.
- `RESERVED` and `LOCKED` are unavailable; `WAITING`, `CANCEL`, and `AUTO` are not returned by the unavailable-slot endpoint.
- Validation targets are exactly `title | content | teacher | date | period`.
- Teacher/Admin-wide redesign is out of scope; TeacherPage changes are limited to consultation kind/pending/approval behavior.
- Frontend Teacher/Admin unrelated files and backend unrelated domains must remain untouched.

---
## File Structure

Backend repository: `C:\Users\user\Documents\Jobdam_BackEnd-harness`

- Modify `course/common` repository, service, controller, student/teacher response DTOs.
- Create `UnavailableSlotDTO` in both consultation domains.
- Create `CourseServiceTest`; extend existing `CommonServiceTest`.
- Do not change auth, recruit, form, notification infrastructure except existing consultation notifications invoked by the services.

Frontend worktree: `C:\Users\user\Documents\Jobdom_Fromt-harness-adoption\.worktrees\test-vercel-preview`

- Modify consultation domain `types.ts`, `rules.ts`, `createConsultationApi.ts`, and exports.
- Add a small teacher-directory API under `entities/user` for `/student/teachers`.
- Modify `useConsultationForm.ts`; split redesigned UI into `ConsultationContentPanel.tsx` and `ConsultationSchedulePanel.tsx` while keeping `ConsultationForm.tsx` as orchestrator.
- Modify TeacherPage only for pending/approved consultation loading and approval kind selection.
- Modify home/profile consultation adapters so only `RESERVED` is presented as confirmed and `WAITING` is labeled pending in profile.
- Add focused contract tests; keep the existing 17-step frontend harness as the final gate.

### Task 1: Backend response contracts expose state and pending detail

**Files:**
- Modify: `src/main/java/com/example/kodyjobdam/course/dto/response/StudentReadDTO.java`
- Modify: `src/main/java/com/example/kodyjobdam/common/dto/response/StudentReadDTO.java`
- Modify: `src/main/java/com/example/kodyjobdam/course/dto/response/TeacherReadDTO.java`
- Modify: `src/main/java/com/example/kodyjobdam/common/dto/response/TeacherReadDTO.java`
- Modify: `src/main/java/com/example/kodyjobdam/course/service/CourseService.java`
- Modify: `src/main/java/com/example/kodyjobdam/common/service/CommonService.java`
- Test: `src/test/java/com/example/kodyjobdam/course/service/CourseServiceTest.java`
- Test: `src/test/java/com/example/kodyjobdam/common/service/CommonServiceTest.java`
**Interfaces:**
- `StudentReadDTO`: `id`, `name`, `date`, `period`, `state` where state is the enum name.
- `TeacherReadDTO`: `reservation_id`, `name`, `student_number`, `title`, `content`, `date`, `period`, `state`.
- `T_Read()` still returns only `RESERVED`; `P_Read()` still returns only `WAITING`.

- [ ] **Step 1: Write failing backend tests for state/detail DTO mapping**

Create `CourseServiceTest` with assertions equivalent to:

```java
@Test
void pendingReadIncludesStudentAndContentDetail() {
    CourseEntity waiting = reservation(StateEnum.WAITING);
    when(courseRepository.findByTeacher_IdAndStateOrderByDateAscPeriodAsc(2L, StateEnum.WAITING))
            .thenReturn(List.of(waiting));

    TeacherReadDTO dto = courseService.P_Read(2L).getFirst();
    assertThat(dto.getState()).isEqualTo(StateEnum.WAITING.name());
    assertThat(dto.getStudent_number()).isEqualTo("3001");
    assertThat(dto.getTitle()).isEqualTo("상담");
    assertThat(dto.getContent()).isEqualTo("내용");
}
```

Extend `CommonServiceTest` with the same assertions for common counseling, and assert `S_Read()` exposes `WAITING`/`RESERVED` state.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `gradlew.bat test --tests "*CourseServiceTest" --tests "*CommonServiceTest"`
Expected: compile/test failure because the response DTOs do not expose the new fields/state yet.
- [ ] **Step 3: Implement DTO fields and service mapping**

Use enum names at the API boundary rather than exposing Java enum types directly in the frontend contract:

```java
public StudentReadDTO(Long id, String name, LocalDate date, String period, String state) {
    this.id = id;
    this.name = name;
    this.date = date;
    this.period = period;
    this.state = state;
}
```

```java
private TeacherReadDTO toTeacherDTO(CourseEntity e) {
    return new TeacherReadDTO(
            e.getReservation_id(), e.getUser().getName(), e.getUser().getStudent_number(),
            e.getTitle(), e.getContent(), e.getDate(), e.getPeriod(), e.getState().name()
    );
}
```

Apply the same mapping to common counseling and pass `e.getState().name()` from both `S_Read()` methods.

- [ ] **Step 4: Run focused backend tests and verify GREEN**

Run: `gradlew.bat test --tests "*CourseServiceTest" --tests "*CommonServiceTest"`
Expected: PASS.

- [ ] **Step 5: Commit backend Task 1**

```bash
git add src/main/java/com/example/kodyjobdam/{course,common} src/test/java/com/example/kodyjobdam/{course,common}
git commit -m "feat : expose consultation reservation state"
```

### Task 2: Backend student-safe unavailable-slot API
**Files:**
- Create: `src/main/java/com/example/kodyjobdam/course/dto/response/UnavailableSlotDTO.java`
- Create: `src/main/java/com/example/kodyjobdam/common/dto/response/UnavailableSlotDTO.java`
- Modify: `src/main/java/com/example/kodyjobdam/course/repository/CourseRepository.java`
- Modify: `src/main/java/com/example/kodyjobdam/common/repository/CommonRepository.java`
- Modify: `src/main/java/com/example/kodyjobdam/course/service/CourseService.java`
- Modify: `src/main/java/com/example/kodyjobdam/common/service/CommonService.java`
- Modify: `src/main/java/com/example/kodyjobdam/course/controller/CourseController.java`
- Modify: `src/main/java/com/example/kodyjobdam/common/controller/CommonController.java`
- Test: `src/test/java/com/example/kodyjobdam/course/service/CourseServiceTest.java`
- Test: `src/test/java/com/example/kodyjobdam/common/service/CommonServiceTest.java`

**Interfaces:**
- New endpoint: `GET /student/{kind}/unavailable?teacherId={id}`.
- Response: `[{ "date": "YYYY-MM-DD", "period": "3교시" }]`.
- Only `RESERVED` and `LOCKED` are included; no student identity/content leaves the backend.

- [ ] **Step 1: Write failing unavailable-slot service tests**

```java
@Test
void unavailableSlotsContainOnlyReservedAndLocked() {
    when(courseRepository.findByTeacher_Id(2L)).thenReturn(List.of(
            reservation(StateEnum.RESERVED), reservation(StateEnum.LOCKED),
            reservation(StateEnum.WAITING), reservation(StateEnum.CANCEL)));

    List<UnavailableSlotDTO> result = courseService.getUnavailableSlots(2L);
    assertThat(result).hasSize(2);
    assertThat(result).allMatch(slot -> slot.getDate() != null && slot.getPeriod() != null);
}
```

Mirror the test in `CommonServiceTest`.
- [ ] **Step 2: Run focused backend tests and verify RED**

Run: `gradlew.bat test --tests "*CourseServiceTest" --tests "*CommonServiceTest"`
Expected: FAIL because `UnavailableSlotDTO` and `getUnavailableSlots` do not exist.

- [ ] **Step 3: Implement minimal unavailable-slot query**

Use the existing teacher relation and filter state server-side:

```java
public List<UnavailableSlotDTO> getUnavailableSlots(Long teacherId) {
    return courseRepository.findByTeacher_Id(teacherId).stream()
            .filter(e -> e.getState() == StateEnum.RESERVED || e.getState() == StateEnum.LOCKED)
            .map(e -> new UnavailableSlotDTO(e.getDate(), e.getPeriod()))
            .toList();
}
```

Controller contract:

```java
@GetMapping("/student/course/unavailable")
public List<UnavailableSlotDTO> unavailable(@RequestParam Long teacherId) {
    return courseService.getUnavailableSlots(teacherId);
}
```

Implement the common equivalent. Keep DTO fields to `date` and `period` only.

- [ ] **Step 4: Run focused tests and full backend test suite**

Run: `gradlew.bat test --tests "*CourseServiceTest" --tests "*CommonServiceTest"`
Expected: PASS.

Run: `gradlew.bat test`
Expected: PASS.

- [ ] **Step 5: Commit backend Task 2**

```bash
git add src/main/java/com/example/kodyjobdam/{course,common} src/test/java/com/example/kodyjobdam/{course,common}
git commit -m "feat : expose unavailable consultation slots"
```

### Task 3: Backend approval prevents duplicate confirmed slots
**Files:**
- Modify: `src/main/java/com/example/kodyjobdam/course/service/CourseService.java`
- Modify: `src/main/java/com/example/kodyjobdam/common/service/CommonService.java`
- Test: `src/test/java/com/example/kodyjobdam/course/service/CourseServiceTest.java`
- Test: `src/test/java/com/example/kodyjobdam/common/service/CommonServiceTest.java`

**Interfaces:**
- `allow(reservationId, teacherId)` remains the public API.
- Approval checks the selected reservation is `WAITING`, owned by the teacher, and its slot is not already `RESERVED`/`LOCKED` for that teacher.
- Once approved, sibling `WAITING` requests for the same teacher/date/period become `CANCEL` so a second approval cannot confirm the same slot.

- [ ] **Step 1: Write failing approval-conflict tests**

```java
@Test
void approvingOneRequestCancelsOtherWaitingRequestsForSameSlot() {
    CourseEntity selected = reservation(100L, StateEnum.WAITING);
    CourseEntity sibling = reservation(101L, StateEnum.WAITING);
    when(courseRepository.findById(100L)).thenReturn(Optional.of(selected));
    when(courseRepository.findAllByDateAndPeriodAndTeacher_Id(selected.getDate(), selected.getPeriod(), 2L))
            .thenReturn(List.of(selected, sibling));

    courseService.allow(100L, 2L);

    assertThat(selected.getState()).isEqualTo(StateEnum.RESERVED);
    assertThat(sibling.getState()).isEqualTo(StateEnum.CANCEL);
}
```

Add a second test where an existing sibling is `RESERVED` or `LOCKED` and `allow()` throws `ReservationException` without changing the selected request.
Mirror both tests for common counseling.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `gradlew.bat test --tests "*CourseServiceTest" --tests "*CommonServiceTest"`
Expected: FAIL because current `allow()` does not inspect sibling slot state.
- [ ] **Step 3: Implement slot conflict check and sibling cancellation**

Inside each `allow()` after ownership/state validation:

```java
List<CourseEntity> slotReservations = courseRepository.findAllByDateAndPeriodAndTeacher_Id(
        entity.getDate(), entity.getPeriod(), teacherId);
boolean blocked = slotReservations.stream()
        .filter(other -> !other.getReservation_id().equals(entity.getReservation_id()))
        .anyMatch(other -> other.getState() == StateEnum.RESERVED || other.getState() == StateEnum.LOCKED);
if (blocked) throw ReservationException.conflict("이미 확정되었거나 잠긴 시간입니다.");

entity.setState(StateEnum.RESERVED);
slotReservations.stream()
        .filter(other -> !other.getReservation_id().equals(entity.getReservation_id()))
        .filter(other -> other.getState() == StateEnum.WAITING)
        .forEach(other -> other.setState(StateEnum.CANCEL));
```

Use `CommonEntity`/common repository in the mirrored service.

- [ ] **Step 4: Run focused and full backend tests**

Run: `gradlew.bat test --tests "*CourseServiceTest" --tests "*CommonServiceTest"`
Expected: PASS.

Run: `gradlew.bat test`
Expected: PASS.

- [ ] **Step 5: Commit backend Task 3**

```bash
git add src/main/java/com/example/kodyjobdam/{course,common}/service src/test/java/com/example/kodyjobdam/{course,common}
git commit -m "fix : prevent duplicate consultation approvals"
```

### Task 4: Frontend consultation API and domain contracts

**Files:**
- Modify: `src/fsd/entities/consultation/model/types.ts`
- Modify: `src/fsd/entities/consultation/model/rules.ts`
- Modify: `src/fsd/entities/consultation/api/createConsultationApi.ts`
- Modify: `src/fsd/entities/consultation/index.ts`
- Create: `src/fsd/entities/user/model/teacher.ts`
- Create: `src/fsd/entities/user/api/createTeacherDirectoryApi.ts`
- Modify: `src/fsd/entities/user/index.ts`
- Test: `tests/contracts/consultation-third-pass-api.test.ts`
**Interfaces:**
- `ConsultationState = "WAITING" | "RESERVED" | "CANCEL" | "LOCKED" | "AUTO"`.
- `StudentReservation.state: ConsultationState`.
- `TeacherReservation` includes `student_number`, `title`, `content`, `state`.
- `ReservationInput.teacherId: number`.
- `UnavailableSlot = { date: string; period: string }`.
- `TeacherSummary = { id: number; name: string }` from `/student/teachers`.
- Consultation API adds `getUnavailable(kind, teacherId)` and `getPending(kind)`.

- [ ] **Step 1: Write the failing frontend API contract**

```ts
const calls: Array<{ path: string; init?: RequestInit }> = [];
const api = createConsultationApi(async <T>(path: string, init?: RequestInit) => {
  calls.push({ path, init });
  return [] as T;
});

await api.getUnavailable("course", 2);
await api.getPending("common");
await api.create("course", {
  title: "상담", content: "내용", date: "2026-09-07", period: "3교시", teacherId: 2,
});
assert.equal(calls[0]?.path, "/student/course/unavailable?teacherId=2");
assert.equal(calls[1]?.path, "/teacher/common/pending");
assert.match(String(calls[2]?.init?.body), /"teacherId":2/);
```

Also instantiate `createTeacherDirectoryApi` and assert it requests `/student/teachers`.

- [ ] **Step 2: Run the contract and verify RED**

Run: `node --no-warnings --experimental-strip-types tests/contracts/consultation-third-pass-api.test.ts`
Expected: FAIL because the new methods/types do not exist.

- [ ] **Step 3: Implement the domain/API types**
Implement the exact API additions:

```ts
getUnavailable: (kind: ConsultationKind, teacherId: number) =>
  request<UnavailableSlot[]>(`/student/${kind}/unavailable?teacherId=${teacherId}`),
getPending: (kind: ConsultationKind) =>
  request<TeacherReservation[]>(`/teacher/${kind}/pending`),
```

Teacher directory:

```ts
export type TeacherSummary = { id: number; name: string };
export const createTeacherDirectoryApi = (request: RequestFn) => ({
  getAll: () => request<TeacherSummary[]>("/student/teachers"),
});
```

Update `createReservationInput(draft)` to require a selected teacher and emit `teacherId: draft.teacher.id`; keep the displayed teacher name available for the `[선생님] 제목` prefix if that existing backend title convention remains in use.

- [ ] **Step 4: Run API contracts and the existing consultation contract**

Run: `node --no-warnings --experimental-strip-types tests/contracts/consultation-third-pass-api.test.ts`
Expected: PASS.

Run: `node --no-warnings --experimental-strip-types tests/contracts/consultation-contract.test.ts`
Expected: PASS after updating fixture drafts to use `{ id, name }` teacher objects and reservation inputs containing `teacherId`.

- [ ] **Step 5: Commit frontend Task 4**

```bash
git add src/fsd/entities/consultation src/fsd/entities/user tests/contracts/consultation-third-pass-api.test.ts tests/contracts/consultation-contract.test.ts
git commit -m "feat : align consultation api contracts"
```

### Task 5: Validation target, red border, scroll, and focus behavior

**Files:**
- Modify: `src/fsd/entities/consultation/model/types.ts`
- Modify: `src/fsd/entities/consultation/model/rules.ts`
- Modify: `src/fsd/features/submit-consultation/model/useConsultationForm.ts`
- Test: `tests/contracts/student-consultation-error-focus.test.ts`
**Interfaces:**
- `ConsultationErrorTarget = "title" | "content" | "teacher" | "date" | "period"`.
- `getConsultationErrorTarget(message: string): ConsultationErrorTarget | null`.
- `getConsultationServerErrorTarget(message: string): ConsultationErrorTarget | null` returns `period` for clear slot-conflict/locked-time messages, otherwise `null`.
- Hook exposes `errorTarget` and clears it when the matching field changes.

- [ ] **Step 1: Write the failing error-target contract**

```ts
assert.equal(getConsultationErrorTarget("제목을 입력해주세요"), "title");
assert.equal(getConsultationErrorTarget("내용을 입력해주세요"), "content");
assert.equal(getConsultationErrorTarget("선생님을 선택해주세요"), "teacher");
assert.equal(getConsultationErrorTarget("날짜를 선택해주세요"), "date");
assert.equal(getConsultationErrorTarget("교시를 선택해주세요"), "period");
assert.match(hook, /scrollIntoView/);
assert.match(hook, /focus\(/);
assert.match(hook, /setErrorTarget\(null\)/);
```

- [ ] **Step 2: Run the focused contract and verify RED**

Run: `node --no-warnings --experimental-strip-types tests/contracts/student-consultation-error-focus.test.ts`
Expected: FAIL because target mapping/scroll-focus behavior is absent.

- [ ] **Step 3: Implement target mapping and focus effect**

Use stable DOM markers instead of cross-component refs:

```ts
const focusErrorTarget = (target: ConsultationErrorTarget) => {
  requestAnimationFrame(() => {
    const region = document.querySelector<HTMLElement>(`[data-consultation-error-target="${target}"]`);
    region?.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusable = region?.matches("input,textarea,button")
      ? region
      : region?.querySelector<HTMLElement>("input,textarea,button:not(:disabled)");
    focusable?.focus({ preventScroll: true });
  });
};
```
On validation failure:

```ts
const target = getConsultationErrorTarget(validationMessage);
setErrorTarget(target);
if (target) focusErrorTarget(target);
showToast(validationMessage);
```

On field edits/selections, clear only the matching current target. In the API catch block, map clear reservation-conflict/locked-time messages to `period`, then focus the schedule region; unknown server errors remain toast-only.

- [ ] **Step 4: Run the focused contract and consultation contracts**

Run: `node --no-warnings --experimental-strip-types tests/contracts/student-consultation-error-focus.test.ts`
Expected: PASS.

Run: `npm run harness:contracts`
Expected: all contract files PASS.

- [ ] **Step 5: Commit frontend Task 5**

```bash
git add src/fsd/entities/consultation/model src/fsd/features/submit-consultation/model tests/contracts/student-consultation-error-focus.test.ts
git commit -m "feat : focus consultation validation errors"
```

### Task 6: Redesign the student consultation form and connect real availability

**Files:**
- Create: `src/fsd/features/submit-consultation/ui/ConsultationContentPanel.tsx`
- Create: `src/fsd/features/submit-consultation/ui/ConsultationSchedulePanel.tsx`
- Modify: `src/fsd/features/submit-consultation/ui/ConsultationForm.tsx`
- Modify: `src/fsd/features/submit-consultation/model/useConsultationForm.ts`
- Modify: `src/fsd/features/submit-consultation/api/consultation.ts`
- Test: `tests/contracts/student-consultation-third-pass-ui.test.ts`
- Test: `tests/contracts/student-consultation-redesign.test.ts`

**Interfaces:**
- Desktop form: `lg:grid-cols-[minmax(0,1.7fr)_minmax(360px,1fr)]`; mobile remains one column.
- Both consultation types render a teacher selector loaded from `/student/teachers`.
- Selecting teacher/type reloads `getUnavailable(kind, teacher.id)`.
- Disabled time rows are derived by exact `date + period` match against `UnavailableSlot[]`.
- Submit success copy is `상담 신청 요청을 보냈습니다`.
- [ ] **Step 1: Write the failing student-form UI contract**

```ts
assert.doesNotMatch(form + schedule, /수업 담당 선생님의 허가를 먼저 받아주세요/);
assert.doesNotMatch(form + schedule, /예약 가능|선택됨/);
assert.match(schedule, /예약 불가/);
assert.match(form + schedule, /#02C551/);
assert.doesNotMatch(form + schedule, /#10243E|#1B3555/);
assert.match(form, /lg:grid-cols-\[minmax\(0,1\.7fr\)_minmax\(360px,1fr\)\]/);
assert.match(contentPanel, /data-consultation-error-target="title"/);
assert.match(contentPanel, /data-consultation-error-target="content"/);
assert.match(schedule, /data-consultation-error-target="teacher"/);
assert.match(schedule, /data-consultation-error-target="date"/);
assert.match(schedule, /data-consultation-error-target="period"/);
```

Also assert the hook contains teacher-directory loading, unavailable-slot loading, and the new request-success copy.

- [ ] **Step 2: Run the UI contract and verify RED**

Run: `node --no-warnings --experimental-strip-types tests/contracts/student-consultation-third-pass-ui.test.ts`
Expected: FAIL because the panels/layout/availability behavior do not exist.

- [ ] **Step 3: Implement teacher and availability loading in the hook**

Create API instances from `requestWithSession`:

```ts
const consultationApi = createConsultationApi(requestWithSession);
const teacherDirectoryApi = createTeacherDirectoryApi(requestWithSession);
```

Load teachers once; whenever `counselType` or selected teacher changes, clear selected period and fetch `getUnavailable(counselType, selectedTeacher.id)`. If the request fails, keep slots selectable and show `예약 정보를 불러오지 못했습니다` as a toast rather than falsely marking everything unavailable.

- [ ] **Step 4: Implement the two focused panels**
`ConsultationContentPanel` owns only title/content rendering and red-border wiring through the shared field `error` prop. `ConsultationSchedulePanel` owns type/teacher/date/period rendering and group error borders.

For unavailable rows:

```ts
const unavailable = unavailableSlots.some(
  (slot) => slot.date === selectedDate && slot.period === time,
);
```

```tsx
<button
  type="button"
  disabled={unavailable}
  className={unavailable ? "... cursor-not-allowed border-[#E7EAEE] bg-[#F7F8FA] text-[#A8B0BA]" : selected ? "... border-[#02C551] bg-[#F0FFF6] text-[#02A946]" : "..."}
>
  <span>{time}</span>
  {unavailable ? <span>예약 불가</span> : null}
</button>
```

Do not render `예약 가능` or `선택됨` anywhere.

- [ ] **Step 5: Recompose `ConsultationForm` and remove confusing copy**

Keep toast at the form root. Render content and schedule cards side-by-side on desktop and stacked on mobile. Keep cancel/submit in the schedule panel, use `#02C551`/`#00B94C`, and completely delete the old teacher-permission warning block.

- [ ] **Step 6: Run focused UI and full contract suite**

Run: `node --no-warnings --experimental-strip-types tests/contracts/student-consultation-third-pass-ui.test.ts`
Expected: PASS.

Run: `npm run harness:contracts`
Expected: PASS.

- [ ] **Step 7: Commit frontend Task 6**

```bash
git add src/fsd/features/submit-consultation tests/contracts/student-consultation-third-pass-ui.test.ts tests/contracts/student-consultation-redesign.test.ts
git commit -m "feat : redesign consultation application form"
```

### Task 7: TeacherPage loads pending requests and approves the selected kind
**Files:**
- Modify: `src/fsd/pages/teacher/api/teacher.ts`
- Modify: `src/fsd/pages/teacher/ui/TeacherPage.tsx`
- Test: `tests/contracts/teacher-consultation-page.test.ts`
- Test: `tests/contracts/teacher-pending-approval.test.ts`

**Interfaces:**
- `getPendingTeacherConsultations(kind)` wraps `consultationApi.getPending(kind)`.
- TeacherPage tracks `activeKind: "course" | "common"` with a minimal local selector; this is functional scope, not a visual redesign.
- Approved data comes from `GET /teacher/{kind}`; pending data comes from `GET /teacher/{kind}/pending`.
- `handleApprove(reservationId)` calls `approveConsultation(activeKind, reservationId)`.

- [ ] **Step 1: Write failing pending/approval contract**

```ts
assert.match(api, /getPendingTeacherConsultations/);
assert.match(page, /getPendingTeacherConsultations\(activeKind\)/);
assert.match(page, /getTeacherConsultations\(activeKind\)/);
assert.match(page, /approveConsultation\(activeKind,\s*reservationId\)/);
assert.doesNotMatch(page, /setRequestData\(\[\]\)/);
```

Assert the pending mapping preserves `reservation_id`, `student_number`, `title`, `content`, `date`, `period`, and produces `slotKey` from date/period.

- [ ] **Step 2: Run focused teacher contracts and verify RED**

Run: `node --no-warnings --experimental-strip-types tests/contracts/teacher-pending-approval.test.ts`
Expected: FAIL because TeacherPage currently clears pending requests and approves hard-coded `course`.

- [ ] **Step 3: Implement pending/approved loading**

```ts
const [approved, pending] = await Promise.all([
  getTeacherConsultations(activeKind),
  getPendingTeacherConsultations(activeKind),
]);
setApprovedBySlot(Object.fromEntries(approved.map((item) => [
  `${item.date}_${item.period}`, toRequestData(item),
])));
setRequestData(pending.map(toRequestData));
```

`toRequestData` derives `approved: item.state === "RESERVED"` and keeps server content/student number rather than filling empty strings.
- [ ] **Step 4: Add minimal kind selector and approval behavior**

Use the existing TeacherPage header area for two compact buttons (`진로 상담`, `일반 상담`) and reload reservations when `activeKind` changes. Do not change the rest of the teacher calendar layout.

Approval stays scoped to the currently open request:

```ts
const handleApprove = async (reservationId: number) => {
  if (!openRequestModalSlot) return;
  await approveConsultation(activeKind, reservationId);
  await loadReservations();
  setOpenRequestModalSlot(null);
};
```

- [ ] **Step 5: Run teacher contracts**

Run: `node --no-warnings --experimental-strip-types tests/contracts/teacher-pending-approval.test.ts`
Expected: PASS.

Run: `node --no-warnings --experimental-strip-types tests/contracts/teacher-consultation-page.test.ts`
Expected: PASS after updating the old hard-coded-course assertion to the active-kind contract.

- [ ] **Step 6: Commit frontend Task 7**

```bash
git add src/fsd/pages/teacher tests/contracts/teacher-consultation-page.test.ts tests/contracts/teacher-pending-approval.test.ts
git commit -m "fix : connect teacher consultation approvals"
```

### Task 8: Student home/profile distinguish pending from confirmed

**Files:**
- Modify: `src/fsd/widgets/home-services/model/overview.ts`
- Modify: `src/fsd/entities/consultation/model/profile.ts`
- Modify: `src/fsd/widgets/profile-consultations/ui/ProfileConsultations.tsx`
- Test: `tests/contracts/home-dashboard-overview.test.ts`
- Test: `tests/contracts/profile-contract.test.ts`
- Test: `tests/contracts/student-consultation-status.test.ts`

**Interfaces:**
- Home `upcomingConsultations` includes only `state === "RESERVED"`.
- Profile includes active `WAITING` and `RESERVED`; `CANCEL` is excluded.
- `ProfileConsultation.status` is `"승인 대기" | "예약 확정"`.
- [ ] **Step 1: Write failing status-semantics tests**

```ts
const overview = buildHomeOverview({
  course: [
    { id: 1, name: "A", date: "2026-09-07", period: "2교시", state: "WAITING" },
    { id: 2, name: "B", date: "2026-09-08", period: "3교시", state: "RESERVED" },
  ],
  common: [],
  recruits: [],
});
assert.deepEqual(overview.upcomingConsultations.map((item) => item.id), [4]);
```

```ts
assert.equal(toProfileConsultation("course", waiting).status, "승인 대기");
assert.equal(toProfileConsultation("course", reserved).status, "예약 확정");
```

Also assert the profile UI renders the status text and does not call WAITING a confirmed reservation.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `node --no-warnings --experimental-strip-types tests/contracts/student-consultation-status.test.ts`
Expected: FAIL because state is currently ignored.

- [ ] **Step 3: Implement confirmed/pending adapters**

Filter home source arrays before mapping:

```ts
const confirmed = (items: StudentReservation[]) =>
  items.filter((item) => item.state === "RESERVED");
```

In `toProfileConsultation`, map only active states and add:

```ts
status: item.state === "WAITING" ? "승인 대기" : "예약 확정",
```

Filter `CANCEL`/`AUTO`/`LOCKED` from student profile reservations before conversion. Keep cancellation available for WAITING and RESERVED because both are student-owned active requests.

- [ ] **Step 4: Run home/profile/status contracts**

Run: `node --no-warnings --experimental-strip-types tests/contracts/home-dashboard-overview.test.ts`
Expected: PASS.

Run: `node --no-warnings --experimental-strip-types tests/contracts/profile-contract.test.ts`
Expected: PASS.

Run: `node --no-warnings --experimental-strip-types tests/contracts/student-consultation-status.test.ts`
Expected: PASS.
- [ ] **Step 5: Commit frontend Task 8**

```bash
git add src/fsd/widgets/home-services/model/overview.ts src/fsd/entities/consultation/model/profile.ts src/fsd/widgets/profile-consultations/ui/ProfileConsultations.tsx tests/contracts/home-dashboard-overview.test.ts tests/contracts/profile-contract.test.ts tests/contracts/student-consultation-status.test.ts
git commit -m "fix : distinguish pending consultations"
```

### Task 9: Integration verification and cleanup

**Files:**
- Review all files changed by Tasks 1–8.
- No unrelated code changes are allowed in this task.

**Interfaces:**
- Backend and frontend contracts must agree on `teacherId`, `state`, pending detail, and unavailable slots.
- Frontend form must satisfy the visual/text constraints in the approved spec.

- [ ] **Step 1: Backend full verification**

From the backend worktree run:

```bash
gradlew.bat test
git diff --check
git status --short
```

Expected: all tests pass, no whitespace errors, only intended backend consultation files changed.
- [ ] **Step 2: Frontend focused regression checks**

Run:

```bash
node --no-warnings --experimental-strip-types tests/contracts/student-consultation-error-focus.test.ts
node --no-warnings --experimental-strip-types tests/contracts/student-consultation-third-pass-ui.test.ts
node --no-warnings --experimental-strip-types tests/contracts/teacher-pending-approval.test.ts
node --no-warnings --experimental-strip-types tests/contracts/student-consultation-status.test.ts
```

Expected: all PASS.

- [ ] **Step 3: Frontend full harness**

Run:

```bash
npm run harness:contracts
node --no-warnings --experimental-strip-types scripts/harness/verify.ts
git diff --check
git status --short
```

Expected: contract suite passes, harness reports `17/17`, Next build succeeds, and the working tree contains no uncommitted implementation files.

- [ ] **Step 4: Scope audit**

Run `git diff origin/develop --name-only` in the frontend worktree and confirm no unrelated Teacher/Admin files changed beyond `src/fsd/pages/teacher/api/teacher.ts`, `src/fsd/pages/teacher/ui/TeacherPage.tsx`, and their consultation tests. In backend, confirm only `course`, `common`, and their tests changed.
- [ ] **Step 5: Manual browser acceptance check on preview/local build**

Verify these exact behaviors:

1. Empty submit scrolls to title, focuses it, and shows a red border.
2. After title is fixed, the next invalid submit moves to content; repeat for teacher/date/period.
3. Correcting a field removes only that field's red state.
4. The form uses Jobdam green for selected/primary actions and contains no permission warning.
5. Unavailable rows are disabled and show only `예약 불가`; available/selected rows have no status text.
6. Successful submission says `상담 신청 요청을 보냈습니다`, not that the reservation is confirmed.
7. TeacherPage shows the request as pending; approval moves it to confirmed.
8. Student home excludes WAITING; profile shows WAITING as `승인 대기` and RESERVED as `예약 확정`.

- [ ] **Step 6: Push only verified branches**

Frontend: push `test/vercel-preview` only after Step 3 passes and then check the Vercel commit status.
Backend: keep the consultation work on its dedicated feature worktree/branch; push it only after `gradlew.bat test` passes and the backend diff is reviewed.

## Execution Preflight (run before Task 1)

The frontend is already isolated in `.worktrees/test-vercel-preview`. Before backend edits, invoke `superpowers:using-git-worktrees` and create an isolated backend worktree from clean `main`, for example branch `feat/consultation-third-pass`. Do not implement directly on backend `main`.

Type consistency rule for Task 4: change frontend `ConsultationTeacher` from the current name union to `{ id: number; name: string }`; `TeacherSummary` uses the same structural shape. `getAvailablePeriods(type, teacher)` reads `teacher?.name`, and `ConsultationDraft.teacher` remains `ConsultationTeacher | null`.
