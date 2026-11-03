"use client";

import { FiBookOpen } from "react-icons/fi";
import { requestTutorialReplay } from "../model/replay.ts";

export const TutorialReplayButton = () => (
  <button
    type="button"
    data-tutorial-target="tutorial-replay"
    onClick={requestTutorialReplay}
    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold text-brand-accent transition-colors hover:bg-brand-soft"
  >
    <FiBookOpen aria-hidden size={16} />
    튜토리얼 다시 보기
  </button>
);
