"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { FiArrowLeft, FiArrowRight, FiBookOpen, FiCheckCircle, FiShield } from "react-icons/fi";
import { ActionButton } from "@fsd/shared/ui";
import type { TutorialRole } from "../model/progress.ts";
import { getTutorialSteps } from "../model/steps.ts";
import { TutorialPreview } from "./TutorialPreview.tsx";
import styles from "./tutorial.module.css";

export const Tutorial = ({ role, onComplete }: { role: TutorialRole; onComplete: () => void }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = getTutorialSteps(role);
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const root = useRef<HTMLDivElement>(null);
  const explanation = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const roleLabel = role === "STUDENT" ? "학생" : role === "WEE_TEACHER" ? "Wee클래스 선생님" : "선생님";

  useEffect(() => {
    title.current?.focus({ preventScroll: true });
    const target = root.current?.querySelector(`[data-tutorial-target="${step.target}"]`);
    target?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [step.id, step.target]);

  const handleNext = () => {
    if (isLastStep) onComplete();
    else setStepIndex((index) => index + 1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;
    const buttons = Array.from(explanation.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
    const currentIndex = buttons.findIndex((button) => button === document.activeElement);
    const nextIndex = event.shiftKey
      ? (currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1)
      : (currentIndex + 1) % buttons.length;
    event.preventDefault();
    buttons[nextIndex]?.focus();
  };

  return (
    <div ref={root} className={styles.tutorial}>
      <div className={styles.banner}>
        <span className="flex items-center gap-2"><FiBookOpen aria-hidden className="text-brand-accent" size={18} />{roleLabel} 이용 안내</span>
        <span className="text-xs text-secondary-text">튜토리얼 전용 예시 화면</span>
      </div>
      <TutorialPreview role={role} step={step} />
      <div className={styles.shade} aria-hidden="true" />
      <aside
        ref={explanation}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        aria-describedby="tutorial-description tutorial-safety"
        className={styles.explanation}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between gap-3 text-xs font-bold">
          <span className="text-brand-accent">{step.section}</span>
          <span className="shrink-0 tabular-nums text-muted" aria-label={`전체 ${steps.length}단계 중 ${stepIndex + 1}단계`}>{stepIndex + 1} / {steps.length}</span>
        </div>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-surface" aria-hidden="true"><div className="h-full rounded-full bg-brand" style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} /></div>
        <h2 ref={title} id="tutorial-title" tabIndex={-1} className="mt-4 text-xl font-bold leading-snug tracking-tight outline-none lg:mt-6">{step.title}</h2>
        <p id="tutorial-description" className="mt-2 break-keep text-sm leading-6 text-[#536174] lg:mt-3 lg:leading-7">{step.description}</p>
        <p id="tutorial-safety" className="mt-3 flex items-start gap-2 text-xs font-semibold leading-5 text-[#137342] lg:mt-5 lg:rounded-xl lg:bg-brand-soft lg:px-3 lg:py-3"><FiShield aria-hidden className="mt-0.5 shrink-0" size={15} />신청·제출·저장은 실행되지 않아요.</p>
        <div className="mt-4 flex items-center justify-between gap-3 lg:mt-6">
          <ActionButton variant="ghost" disabled={stepIndex === 0} onClick={() => setStepIndex((index) => index - 1)} className="gap-1 !px-3 !text-sm"><FiArrowLeft aria-hidden />이전</ActionButton>
          <ActionButton onClick={handleNext} className="gap-2 !px-4 !text-sm">{isLastStep ? "잡담 시작하기" : "다음"}{isLastStep ? <FiCheckCircle aria-hidden /> : <FiArrowRight aria-hidden />}</ActionButton>
        </div>
        <p className="mt-4 hidden text-center text-[11px] leading-5 text-muted lg:block">처음 한 번, 마지막 단계까지 확인해 주세요.</p>
      </aside>
    </div>
  );
};
