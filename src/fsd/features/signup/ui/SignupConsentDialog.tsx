"use client";

import { useEffect, useRef } from "react";
import type { RefObject, UIEvent } from "react";
import { ActionButton } from "@fsd/shared/ui";
import {
  hasReachedConsentEnd,
  SIGNUP_CONSENT_DOCUMENTS,
  type SignupConsentDocument,
} from "../model/consentContent.ts";

type SignupConsentDialogProps = {
  document: SignupConsentDocument;
  onClose: () => void;
  onAgree: () => void;
  onReadToEnd: () => void;
  hasReadToEnd: boolean;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
};

export const SignupConsentDialog = ({
  document,
  onClose,
  onAgree,
  onReadToEnd,
  hasReadToEnd,
  returnFocusRef,
}: SignupConsentDialogProps) => {
  const content = SIGNUP_CONSENT_DOCUMENTS[document];
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const onReadToEndRef = useRef(onReadToEnd);

  useEffect(() => {
    onCloseRef.current = onClose;
    onReadToEndRef.current = onReadToEnd;
  }, [onClose, onReadToEnd]);

  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement && hasReachedConsentEnd(contentElement)) {
      onReadToEndRef.current();
    }
  }, [document]);

  useEffect(() => {
    const previousOverflow = globalThis.document.body.style.overflow;
    const previouslyFocused =
      globalThis.document.activeElement instanceof HTMLElement
        ? globalThis.document.activeElement
        : null;
    const focusTarget = returnFocusRef.current;

    const focusableSelector =
      "button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex='-1'])";
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      );
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && globalThis.document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && globalThis.document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    globalThis.document.body.style.overflow = "hidden";
    globalThis.document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      globalThis.document.body.style.overflow = previousOverflow;
      globalThis.document.removeEventListener("keydown", handleKeyDown);
      if (focusTarget) focusTarget.focus();
      else previouslyFocused?.focus();
    };
  }, [returnFocusRef]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (hasReachedConsentEnd(event.currentTarget)) {
      onReadToEndRef.current();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${document}-consent-title`}
      aria-describedby={`${document}-consent-description`}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="flex max-h-[min(90dvh,48rem)] w-full max-w-2xl flex-col rounded-3xl bg-white p-5 shadow-2xl outline-none sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={`${document}-consent-title`} className="text-xl font-bold text-[#202124] sm:text-2xl">
            {content.title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="동의하지 않고 닫기"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl leading-none text-[#737A82] transition-colors hover:bg-[#F5F6F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            ×
          </button>
        </div>

        <div
          ref={contentRef}
          onScroll={handleScroll}
          tabIndex={0}
          className="mt-5 min-h-0 overflow-y-auto rounded-2xl border border-border bg-[#FAFBFC] p-5 text-sm leading-7 text-[#4D5663] outline-none focus:border-brand focus-visible:ring-2 focus-visible:ring-brand sm:p-6"
        >
          {content.sections.map((section) => (
            <section key={section.title} className="not-last:mb-6">
              <h3 className="mb-1 font-bold text-[#27364A]">{section.title}</h3>
              <p className="whitespace-pre-wrap">{section.body}</p>
            </section>
          ))}
        </div>

        <p
          id={`${document}-consent-description`}
          className={`mt-4 text-sm font-semibold ${hasReadToEnd ? "text-brand-hover" : "text-[#7A828B]"}`}
        >
          {hasReadToEnd
            ? "확인이 완료되었습니다. 동의하기를 눌러주세요."
            : "내용을 끝까지 확인한 뒤 동의해주세요."}
        </p>

        <ActionButton
          type="button"
          onClick={onAgree}
          disabled={!hasReadToEnd}
          className="mt-5 min-h-14 w-full rounded-2xl text-base font-bold"
        >
          동의하기
        </ActionButton>
      </div>
    </div>
  );
};
