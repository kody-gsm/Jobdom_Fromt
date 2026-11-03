"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiShield } from "react-icons/fi";
import { ActionButton } from "@fsd/shared/ui";
import type { TutorialMode } from "../model/presentation.ts";
import type { TutorialRole } from "../model/progress.ts";
import { getStepTargets, getTutorialSteps } from "../model/steps.ts";
import { useSpotlight } from "../model/useSpotlight.ts";

const COMPACT_QUERY = "(max-width: 767px)";

const getNextLabel = (isLastStep: boolean, isCompleting: boolean, hasError: boolean, mode: TutorialMode) => {
  if (!isLastStep) return "다음";
  if (isCompleting) return "저장 중…";
  if (hasError) return "다시 시도";
  return mode === "first-run" ? "잡담 시작하기" : "안내 마치기";
};

const useIsCompact = () => {
  const [isCompact, setIsCompact] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(COMPACT_QUERY);
    const sync = () => setIsCompact(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return isCompact;
};

type TutorialProps = {
  role: TutorialRole;
  mode: TutorialMode;
  // 처음 안내에서는 서버에 완료를 저장한다. 다시 보기는 저장할 것이 없다.
  onComplete: () => Promise<void>;
};

export const Tutorial = ({ role, mode, onComplete }: TutorialProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const originPath = useRef(pathname);
  const [stepIndex, setStepIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState("");
  const [cardHeight, setCardHeight] = useState(280);
  const steps = getTutorialSteps(role);
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const isOnStepRoute = pathname === step.route;
  const actionPath = step.action.type === "route" ? step.action.path : null;
  const isCompact = useIsCompact();
  const card = useRef<HTMLElement>(null);
  const dim = useRef<SVGPathElement>(null);
  const outline = useRef<SVGPathElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const status = useSpotlight(getStepTargets(step), isOnStepRoute, isCompact, { dim, outline, card });
  const advance = () => setStepIndex((index) => Math.min(index + 1, steps.length - 1));

  // 각 단계는 실제 화면에서 진행한다. 이 단계 화면에서 강조된 메뉴를 눌러 이동했다면 다음 단계로, 그 밖에는 단계 화면으로 되돌린다.
  const previousPath = useRef(pathname);
  useEffect(() => {
    const previous = previousPath.current;
    previousPath.current = pathname;
    if (isCompleting || isOnStepRoute) return;
    if (actionPath === pathname && previous === step.route) setStepIndex((index) => index + 1);
    else router.push(step.route);
  }, [actionPath, isCompleting, isOnStepRoute, pathname, router, step.route]);

  // 선택을 바꾸거나 열린 창을 처리하고 닫으면 자동으로 다음 단계로 넘어간다.
  useEffect(() => {
    const action = step.action;
    if (!isOnStepRoute) return;
    if (action.type === "dialog") {
      // 창이 아주 빨리 닫혀도 놓치지 않도록 <dialog>의 close 이벤트를 직접 듣는다. (close는 버블링되지 않아 capture로 받는다)
      const handleClose = (event: Event) => {
        if (event.target instanceof HTMLDialogElement) setStepIndex((index) => index + 1);
      };
      document.addEventListener("close", handleClose, true);
      return () => document.removeEventListener("close", handleClose, true);
    }
    if (action.type !== "selector") return;
    // 처음부터 골라져 있던 값(예: 오늘 날짜)이나 '이전'으로 돌아온 경우는 넘기지 않고,
    // 이 단계에서 사용자가 선택을 바꿨을 때만 다음 단계로 넘어간다.
    let initial: string | null = null;
    const check = () => {
      const elements = action.selectors.map((selector) => document.querySelector(selector));
      const signature = elements.map((element) => element?.textContent?.trim() ?? "-").join("|");
      if (initial === null) initial = signature;
      else if (elements.every((element) => element !== null) && signature !== initial) setStepIndex((index) => index + 1);
    };
    check();
    const timer = window.setInterval(check, 250);
    return () => window.clearInterval(timer);
  }, [isOnStepRoute, step.action, step.id]);

  useEffect(() => {
    title.current?.focus({ preventScroll: true });
  }, [step.id]);

  useLayoutEffect(() => {
    const element = card.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setCardHeight(element.offsetHeight));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // 모바일에서는 설명 카드가 화면 아래를 덮으므로, 페이지 맨 아래 요소도 카드 위로 올라올 수 있게 여백을 둔다.
  useEffect(() => {
    if (!isCompact) return;
    const previous = document.body.style.paddingBottom;
    document.body.style.paddingBottom = `${cardHeight + 24}px`;
    return () => {
      document.body.style.paddingBottom = previous;
    };
  }, [isCompact, cardHeight]);

  const complete = async () => {
    if (isCompleting) return;
    setIsCompleting(true);
    setCompletionError("");
    try {
      // 저장이 끝난 뒤에만 안내를 닫고 처음 보던 화면으로 돌려보낸다.
      await onComplete();
      if (originPath.current !== pathname) router.push(originPath.current);
    } catch {
      setCompletionError("안내 완료 상태를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setIsCompleting(false);
    }
  };

  const handleNext = () => {
    if (isLastStep) void complete();
    else advance();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;
    event.preventDefault();
    const buttons = Array.from(card.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
    if (buttons.length === 0) return;
    const currentIndex = buttons.findIndex((button) => button === document.activeElement);
    const nextIndex = event.shiftKey
      ? (currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1)
      : (currentIndex + 1) % buttons.length;
    buttons[nextIndex]?.focus();
  };

  const statusMessage = status === "searching"
    ? "화면을 불러오는 중이에요…"
    : status === "missing"
      ? "지금은 이 화면에 표시할 항목이 없어요. 설명을 확인하고 다음으로 넘어가 주세요."
      : "";

  return (
    <>
      {/* 어두운 부분만 클릭을 막고, 강조된 구멍은 직접 누를 수 있다. 직접 해보는 단계가 아니면 구멍도 막는다. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]">
        <svg data-tutorial-spotlight className="pointer-events-none absolute inset-0 h-full w-full">
          <path ref={dim} d="M0 0H10000V10000H0Z" fillRule="evenodd" fill="rgb(30 38 48 / 62%)" style={{ pointerEvents: "auto" }} />
          {step.interactive ? null : <rect width="100%" height="100%" fill="transparent" style={{ pointerEvents: "auto" }} />}
          <path ref={outline} d="" fill="none" strokeWidth={3} className="stroke-brand" />
        </svg>
      </div>

      <section
        ref={card}
        data-tutorial-step={step.id}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        aria-describedby="tutorial-description tutorial-safety"
        onKeyDown={handleKeyDown}
        className={`fixed z-[101] overflow-y-auto rounded-2xl border border-border bg-white p-5 text-ink shadow-[0_16px_64px_rgb(19_35_58/20%)] ${
          isCompact
            ? "inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] max-h-[45dvh]"
            : "left-0 top-0 max-h-[calc(100dvh-32px)] w-[min(360px,calc(100vw-32px))] will-change-transform"
        }`}
        style={isCompact ? undefined : { visibility: "hidden" }}
      >
        <div className="flex items-center justify-between gap-3 text-xs font-bold">
          <span className="text-brand-accent">{step.section}</span>
          <span className="shrink-0 tabular-nums text-muted" aria-label={`전체 ${steps.length}단계 중 ${stepIndex + 1}단계`}>{stepIndex + 1} / {steps.length}</span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface" aria-hidden="true"><div className="h-full rounded-full bg-brand" style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} /></div>
        <h2 ref={title} id="tutorial-title" tabIndex={-1} className="mt-4 text-lg font-bold leading-snug tracking-tight outline-none">{step.title}</h2>
        <p id="tutorial-description" className="mt-2 break-keep text-sm leading-6 text-[#536174]">{step.description}</p>
        {step.task ? <p className="mt-3 rounded-xl bg-brand-soft px-3 py-2 text-sm font-bold leading-6 text-brand-accent">👉 {step.task}</p> : null}
        {statusMessage ? <p role="status" className="mt-2 text-xs leading-5 text-muted">{statusMessage}</p> : null}
        <p id="tutorial-safety" className="mt-3 flex items-start gap-2 text-xs font-semibold leading-5 text-[#137342]"><FiShield aria-hidden className="mt-0.5 shrink-0" size={15} />연습용 데이터예요. 실제로 신청·제출·저장되지 않아요.</p>
        {completionError ? <p role="alert" className="mt-3 text-xs font-semibold leading-5 text-red-700">{completionError}</p> : null}
        <div className="mt-4 flex items-center justify-between gap-3">
          <ActionButton variant="ghost" disabled={stepIndex === 0 || isCompleting} onClick={() => setStepIndex((index) => index - 1)} className="gap-1 !px-3 !text-sm"><FiArrowLeft aria-hidden />이전</ActionButton>
          <ActionButton disabled={isCompleting} onClick={handleNext} className="gap-2 !px-4 !text-sm">{getNextLabel(isLastStep, isCompleting, Boolean(completionError), mode)}{isLastStep ? <FiCheckCircle aria-hidden /> : <FiArrowRight aria-hidden />}</ActionButton>
        </div>
      </section>
    </>
  );
};
