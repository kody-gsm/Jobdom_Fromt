"use client";

import { useState } from "react";
import { createRecruitApplyUrl } from "../model/createRecruitApplyUrl.ts";

export const CopyRecruitLinkButton = ({ recruitId }: { recruitId: number }) => {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(
      createRecruitApplyUrl(window.location.origin, recruitId),
    );
    setCopied(true);
  };

  return (
    <button
      type="button"
      onClick={() => void copyLink()}
      className="h-13 rounded-xl border border-gray-200 px-6 font-semibold text-gray-600"
    >
      {copied ? "신청 링크 복사됨" : "신청 링크 복사"}
    </button>
  );
};
