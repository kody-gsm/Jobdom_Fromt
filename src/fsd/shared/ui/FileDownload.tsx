"use client";

import { useRef, useState } from "react";
import { ApiError } from "@fsd/shared/api";
import { downloadBlob } from "@fsd/shared/lib";

type FileDownloadProps = {
  fileName: string;
  downloadFile?: () => Promise<Blob>;
};

const getDownloadError = (error: unknown) => {
  if (error instanceof ApiError && error.status === 403) {
    return "이 파일을 다운로드할 권한이 없습니다.";
  }
  if (error instanceof ApiError && error.status === 404) {
    return "첨부 파일을 찾을 수 없습니다.";
  }
  return error instanceof Error ? error.message : "파일을 다운로드하지 못했습니다. 다시 시도해주세요.";
};

export const FileDownload = ({ fileName, downloadFile }: FileDownloadProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);

  const download = async () => {
    if (!downloadFile || inFlight.current) return;
    inFlight.current = true;
    setIsDownloading(true);
    setError("");
    try {
      downloadBlob(await downloadFile(), fileName);
    } catch (caught) {
      setError(getDownloadError(caught));
    } finally {
      inFlight.current = false;
      setIsDownloading(false);
    }
  };

  return (
    <div className="mt-2 min-w-0 space-y-2 wrap-anywhere">
      <p className="text-gray-900">첨부 파일: {fileName}</p>
      <button
        type="button"
        disabled={!downloadFile || isDownloading}
        aria-label={`${fileName} 다운로드`}
        aria-busy={isDownloading}
        onClick={download}
        className="min-h-11 cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDownloading ? "다운로드 중…" : "다운로드"}
      </button>
      {!downloadFile && <p className="text-sm text-gray-500">다운로드에 필요한 파일 정보가 없습니다.</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  );
};
