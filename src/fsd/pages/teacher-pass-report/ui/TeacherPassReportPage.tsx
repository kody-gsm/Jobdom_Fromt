"use client";

import { useCallback, useEffect, useState } from "react";
import { getPassReports, type PassReport } from "@fsd/features/report-pass";
import { TeacherHeader } from "@fsd/widgets/teacher-header";

// 서버가 한국 시각을 시간대 없이 내려준다. (예: 2026-11-05T14:03:12.123456)
const formatSubmittedAt = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return match ? `${match[1]}.${match[2]}.${match[3]} ${match[4]}:${match[5]}` : value;
};

export const TeacherPassReportPage = () => {
  const [reports, setReports] = useState<PassReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = useCallback(() => getPassReports().then(
    (result) => {
      setReports(result);
      setError("");
    },
    () => setError("면접 합격 보고를 불러오지 못했습니다."),
  ).finally(() => setLoading(false)), []);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const load = () => {
    setLoading(true);
    setError("");
    void fetchReports();
  };

  return (
    <>
      <TeacherHeader />
      <main className="min-h-[calc(100vh-5rem)] bg-[#f5f7f6] px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-950">면접 합격 보고</h1>
          <p className="mt-2 text-sm text-gray-500">학생이 보낸 면접 합격 보고를 학번순으로 보여 줘요.</p>

          <section className="mt-8 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            {loading ? (
              <p className="p-10 text-center text-sm text-gray-400">불러오는 중…</p>
            ) : error ? (
              <div role="alert" className="p-10 text-center text-sm text-red-500">
                <p>{error}</p>
                <button type="button" onClick={load} className="mt-3 rounded-lg bg-[#02C551] px-4 py-2 font-semibold text-white">다시 시도</button>
              </div>
            ) : reports.length === 0 ? (
              <p className="p-10 text-center text-sm text-gray-400">아직 들어온 면접 합격 보고가 없습니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500">
                    <tr>
                      <th scope="col" className="whitespace-nowrap px-3 py-3 sm:px-5">학번</th>
                      <th scope="col" className="whitespace-nowrap px-3 py-3 sm:px-5">이름</th>
                      <th scope="col" className="whitespace-nowrap px-3 py-3 sm:px-5">기업 이름</th>
                      <th scope="col" className="whitespace-nowrap px-3 py-3 sm:px-5">제출 시각</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td className="px-3 py-4 sm:px-5 font-semibold text-gray-900">{report.studentNumber}</td>
                        <td className="px-3 py-4 sm:px-5 text-gray-900">{report.studentName}</td>
                        <td className="px-3 py-4 sm:px-5 text-gray-900">{report.companyName}</td>
                        <td className="px-3 py-4 text-xs text-gray-500 sm:px-5 sm:text-sm">{formatSubmittedAt(report.submittedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
};
