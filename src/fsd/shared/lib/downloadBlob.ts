export const downloadBlob = (file: Blob, fileName: string) => {
  const link = document.createElement("a");
  const url = URL.createObjectURL(file);
  try {
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
  } finally {
    link.remove();
    // 브라우저가 다운로드를 시작한 뒤 임시 URL을 해제한다.
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }
};
