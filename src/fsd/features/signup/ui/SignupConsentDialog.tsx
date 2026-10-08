"use client";

import type { UIEvent } from "react";
import { ActionButton } from "@fsd/shared/ui";
import {
  SIGNUP_CONSENT_DOCUMENTS,
  type SignupConsentDocument,
} from "../model/consentContent.ts";

type SignupConsentDialogProps = {
  document: SignupConsentDocument;
  onClose: () => void;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  hasReadToEnd: boolean;
};

export const SignupConsentDialog = ({
  document,
  onClose,
  onScroll,
  hasReadToEnd,
}: SignupConsentDialogProps) => {
  const content = SIGNUP_CONSENT_DOCUMENTS[document];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${document}-consent-title`}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[90dvh] w-full max-w-2xl flex-col rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id={`${document}-consent-title`} className="text-xl font-bold text-[#202124] sm:text-2xl">
            {content.title}
          </h2>
          <button
            type="button"
            aria-label={`${content.title} 닫기`}
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-2xl leading-none text-[#737A82] hover:bg-[#F5F6F7]"
          >
            ×
          </button>
        </div>

        <div
          onScroll={onScroll}
          tabIndex={0}
          className="mt-5 min-h-0 overflow-y-auto rounded-2xl border border-border bg-[#FAFBFC] p-5 text-sm leading-7 text-[#4D5663] outline-none focus:border-brand sm:p-6"
        >
          {content.sections.map((section) => (
            <section key={section.title} className="not-last:mb-6">
              <h3 className="mb-1 font-bold text-[#27364A]">{section.title}</h3>
              <p className="whitespace-pre-wrap">{section.body}</p>
            </section>
          ))}
        </div>

        <p className={`mt-4 text-sm font-semibold ${hasReadToEnd ? "text-brand-hover" : "text-[#7A828B]"}`}>
          {hasReadToEnd
            ? "약관을 끝까지 읽었습니다. 닫고 동의할 수 있습니다."
            : "약관을 끝까지 읽은 후 동의할 수 있습니다."}
        </p>

        <ActionButton type="button" onClick={onClose} className="mt-5 w-full">
          닫기
        </ActionButton>
      </div>
    </div>
  );
};
