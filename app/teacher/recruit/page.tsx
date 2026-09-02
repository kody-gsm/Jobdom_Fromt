"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Header } from "@/app/components/organisms";
import {
  ApiError,
  Recruit,
  RecruitDashboardRow,
  RecruitUpdate,
  analyzeRecruit,
  getRecruitDashboard,
  publishRecruit,
  updateRecruit,
} from "@/app/utils/api";

const blank: RecruitUpdate = { companyName: "", interviewDate: "", deadline: "", summary: "" };

export default function TeacherRecruitPage() {
  const [rows, setRows] = useState<RecruitDashboardRow[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | Recruit["status"]>("ALL");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<RecruitUpdate>(blank);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const load = async (preferredId?: number) => {
    try {
      const data = await getRecruitDashboard();
      setRows(data);
      setSelectedId((current) => preferredId ?? (data.some(({ recruit }) => recruit.id === current) ? current : data[0]?.recruit.id ?? null));
      setMessage(null);
    } catch (caught) {
      setMessage({
        text: caught instanceof ApiError && [401, 403].includes(caught.status)
          ? "선생님 계정으로 로그인해야 지원 현황을 볼 수 있습니다."
          : caught instanceof Error ? caught.message : "지원 현황을 불러오지 못했습니다.",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRecruitDashboard()
      .then((data) => {
        setRows(data);
        setSelectedId(data[0]?.recruit.id ?? null);
      })
      .catch((caught) => setMessage({
        text: caught instanceof ApiError && [401, 403].includes(caught.status)
          ? "선생님 계정으로 로그인해야 지원 현황을 볼 수 있습니다."
          : caught instanceof Error ? caught.message : "지원 현황을 불러오지 못했습니다.",
        error: true,
      }))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    const word = query.trim().toLowerCase();
    return rows.filter(({ recruit, form, applicants }) =>
      (status === "ALL" || recruit.status === status)
      && (!word || [recruit.companyName, form?.title, ...applicants.flatMap((applicant) => [applicant.userName, applicant.studentNumber])]
        .some((value) => value?.toLowerCase().includes(word))));
  }, [query, rows, status]);

  const selected = rows.find(({ recruit }) => recruit.id === selectedId) || null;

  const select = (row: RecruitDashboardRow) => {
    setSelectedId(row.recruit.id);
    setEditing(false);
  };

  const startEditing = (row: RecruitDashboardRow) => {
    const recruit = row.recruit;
    setSelectedId(recruit.id);
    setForm({ companyName: recruit.companyName || "", interviewDate: recruit.interviewDate || "", deadline: recruit.deadline || "", summary: recruit.summary || "" });
    setEditing(true);
    setMessage(null);
  };

  const analyze = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return setMessage({ text: "이미지는 10MB 이하만 업로드할 수 있습니다.", error: true });
    try {
      setWorking(true);
      setMessage({ text: "AI가 공고 이미지를 읽고 있습니다." });
      const recruit = await analyzeRecruit(file);
      await load(recruit.id);
      setForm({ companyName: recruit.companyName || "", interviewDate: recruit.interviewDate || "", deadline: recruit.deadline || "", summary: recruit.summary || "" });
      setEditing(true);
      setMessage({ text: "공고 초안을 만들었습니다. 내용을 확인해주세요." });
    } catch (caught) {
      setMessage({ text: caught instanceof Error ? caught.message : "이미지 분석에 실패했습니다.", error: true });
    } finally {
      setWorking(false);
      event.target.value = "";
    }
  };

  const save = async (publish = false) => {
    if (!selectedId) return;
    if (Object.values(form).some((value) => !value?.trim())) return setMessage({ text: "모든 공고 항목을 입력해주세요.", error: true });
    try {
      setWorking(true);
      await updateRecruit(selectedId, form);
      if (publish) await publishRecruit(selectedId);
      await load(selectedId);
      setEditing(false);
      setMessage({ text: publish ? "공고를 공개했습니다." : "공고를 저장했습니다." });
    } catch (caught) {
      setMessage({ text: caught instanceof Error ? caught.message : "공고를 저장하지 못했습니다.", error: true });
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-5rem)] bg-white px-4 py-8 text-[#17201a] sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1500px]">
          <header className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-sm font-bold text-[#02a946]">TEACHER WORKSPACE</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">취업 공고 지원 현황</h1>
              <p className="mt-2 text-sm text-gray-500">공고와 신청자를 데이터 시트처럼 한 화면에서 확인하세요.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/teacher/forms" className="inline-flex h-11 items-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700">신청 폼 관리</Link>
              <label className={`inline-flex h-11 cursor-pointer items-center rounded-xl bg-[#02C551] px-4 text-sm font-bold text-white ${working ? "pointer-events-none opacity-60" : ""}`}>
                + 공고 이미지 등록
                <input type="file" accept="image/png,image/jpeg,image/webp,image/heic,image/heif" onChange={analyze} className="sr-only" />
              </label>
            </div>
          </header>

          {message && <p role="status" className={`mt-5 rounded-xl border px-4 py-3 text-sm ${message.error ? "border-red-100 bg-red-50 text-red-700" : "border-green-100 bg-green-50 text-green-800"}`}>{message.text}</p>}

          <section className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(31,41,35,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#02C551]" />
                <h2 className="font-bold">공고 데이터</h2>
                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500">{filteredRows.length} records</span>
              </div>
              <div className="flex flex-1 flex-wrap justify-end gap-2">
                <input aria-label="공고 또는 지원자 검색" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="회사·지원자 검색" className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#02C551] sm:max-w-64" />
                <select aria-label="공고 상태" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#02C551]">
                  <option value="ALL">전체 상태</option><option value="PUBLISHED">공개</option><option value="DRAFT">초안</option>
                </select>
                <button type="button" onClick={() => { setLoading(true); void load(selectedId ?? undefined); }} className="h-10 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-600">새로고침</button>
              </div>
            </div>

            <div className="grid min-h-[560px] lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="overflow-x-auto border-b border-gray-200 lg:border-b-0 lg:border-r">
                <table className="w-full min-w-[920px] border-collapse text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-[#f8faf9] text-xs font-bold text-gray-500">
                    <tr><Th className="w-12">#</Th><Th>회사 / 공고</Th><Th>상태</Th><Th>지원 마감</Th><Th>면접일</Th><Th>신청 폼</Th><Th>지원자</Th><Th>최근 지원</Th></tr>
                  </thead>
                  <tbody>
                    {loading ? <EmptyRow text="지원 현황을 불러오는 중…" /> : filteredRows.length === 0 ? <EmptyRow text="조건에 맞는 공고가 없습니다." /> : filteredRows.map((row, index) => {
                      const active = row.recruit.id === selectedId;
                      const latest = [...row.applicants].sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt))[0];
                      return (
                        <tr key={row.recruit.id} className={`border-b border-gray-100 ${active ? "bg-[#effbf3]" : "hover:bg-gray-50"}`}>
                          <Td className="font-mono text-xs text-gray-400">{String(index + 1).padStart(2, "0")}</Td>
                          <Td><button type="button" onClick={() => select(row)} className="block w-full text-left"><strong className="block max-w-52 truncate text-gray-900">{row.recruit.companyName || "회사명 미입력"}</strong><span className="mt-1 block max-w-52 truncate text-xs text-gray-400">{row.recruit.summary || "공고 요약 없음"}</span></button></Td>
                          <Td><Status status={row.recruit.status} /></Td>
                          <Td>{row.recruit.deadline || "—"}</Td>
                          <Td>{row.recruit.interviewDate || "—"}</Td>
                          <Td>{row.form ? <span className="block max-w-40 truncate font-medium text-gray-700" title={row.form.title}>{row.form.title}</span> : <span className="font-semibold text-amber-600">미연결</span>}</Td>
                          <Td><button type="button" onClick={() => select(row)} className="rounded-lg bg-gray-100 px-2.5 py-1.5 font-bold text-gray-700">{row.applicants.length}명</button></Td>
                          <Td className="text-xs text-gray-500">{latest ? formatDate(latest.submittedAt, true) : "—"}</Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <aside className="bg-[#fbfcfb] p-5 sm:p-6">
                {!selected ? <div className="grid h-full min-h-64 place-items-center text-center text-sm text-gray-400">왼쪽에서 공고를 선택해주세요.</div> : editing ? (
                  <Editor row={selected} form={form} setForm={setForm} working={working} cancel={() => setEditing(false)} save={save} />
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0"><Status status={selected.recruit.status} /><h2 className="mt-3 truncate text-2xl font-bold">{selected.recruit.companyName || "회사명 미입력"}</h2><p className="mt-1 text-xs text-gray-400">공고 ID #{selected.recruit.id}</p></div>
                      <button type="button" onClick={() => startEditing(selected)} className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600">수정</button>
                    </div>
                    <dl className="mt-5 grid grid-cols-2 gap-3">
                      <Info label="지원 마감" value={selected.recruit.deadline} /><Info label="면접 일정" value={selected.recruit.interviewDate} />
                    </dl>
                    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                      <p className="text-xs font-bold text-gray-400">연결된 신청 폼</p>
                      {selected.form ? <><p className="mt-2 font-bold text-gray-800">{selected.form.title}</p><Link href={`/teacher/forms/${selected.form.id}/submissions`} className="mt-3 inline-block text-sm font-bold text-[#02a946]">전체 응답 보기 →</Link></> : <><p className="mt-2 text-sm font-semibold text-amber-700">연결된 폼이 없습니다.</p><p className="mt-1 text-xs leading-5 text-gray-400">폼 제목에 회사명을 포함하면 자동 연결됩니다.</p></>}
                    </div>
                    <div className="mt-6 flex items-center justify-between"><h3 className="font-bold">지원자</h3><span className="text-sm font-bold text-[#02a946]">{selected.applicants.length}명</span></div>
                    <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                      {selected.applicants.length === 0 ? <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400">아직 확인할 지원자가 없습니다.</p> : selected.applicants.map((applicant) => (
                        <article key={applicant.id} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e6f9ec] text-sm font-bold text-[#02a946]">{applicant.userName.slice(0, 1)}</span>
                          <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-gray-800">{applicant.userName}</p><p className="mt-0.5 text-xs text-gray-400">{applicant.studentNumber || "학번 없음"}</p></div>
                          <time className="text-right text-[11px] leading-4 text-gray-400">{formatDate(applicant.submittedAt, true)}</time>
                        </article>
                      ))}
                    </div>
                  </>
                )}
              </aside>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function Status({ status }: { status: Recruit["status"] }) {
  return <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-bold ${status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{status === "PUBLISHED" ? "공개" : "초안"}</span>;
}

function Info({ label, value }: { label: string; value: string | null }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-3"><dt className="text-[11px] font-bold text-gray-400">{label}</dt><dd className="mt-1 text-sm font-bold text-gray-800">{value || "—"}</dd></div>;
}

function Editor({ row, form, setForm, working, cancel, save }: { row: RecruitDashboardRow; form: RecruitUpdate; setForm: React.Dispatch<React.SetStateAction<RecruitUpdate>>; working: boolean; cancel: () => void; save: (publish?: boolean) => Promise<void> }) {
  const update = (key: keyof RecruitUpdate, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return <div><div className="flex items-center justify-between"><h2 className="text-xl font-bold">공고 수정</h2><button type="button" onClick={cancel} className="text-sm font-semibold text-gray-400">닫기</button></div><div className="mt-5 space-y-4"><Field label="회사명" value={form.companyName || ""} onChange={(value) => update("companyName", value)} /><Field label="지원 마감" value={form.deadline || ""} onChange={(value) => update("deadline", value)} /><Field label="면접 일정" value={form.interviewDate || ""} onChange={(value) => update("interviewDate", value)} /><label className="block text-xs font-bold text-gray-500">공고 요약<textarea value={form.summary || ""} onChange={(event) => update("summary", event.target.value)} className="mt-2 min-h-36 w-full resize-y rounded-xl border border-gray-200 bg-white p-3 text-sm font-normal leading-6 outline-none focus:border-[#02C551]" /></label></div><div className="mt-5 grid grid-cols-2 gap-2"><button type="button" disabled={working} onClick={() => void save(false)} className="h-11 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-600 disabled:opacity-50">저장</button>{row.recruit.status === "DRAFT" ? <button type="button" disabled={working} onClick={() => void save(true)} className="h-11 rounded-xl bg-[#02C551] text-sm font-bold text-white disabled:opacity-50">공개</button> : <Link href={`/recruit/${row.recruit.id}`} className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-800 text-sm font-bold text-white">학생 화면</Link>}</div></div>;
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-xs font-bold text-gray-500">{label}<input required value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-normal outline-none focus:border-[#02C551]" /></label>;
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <th className={`border-r border-gray-200 px-3 py-3 ${className}`}>{children}</th>; }
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <td className={`border-r border-gray-100 px-3 py-3 align-middle ${className}`}>{children}</td>; }
function EmptyRow({ text }: { text: string }) { return <tr><td colSpan={8} className="px-6 py-28 text-center text-sm text-gray-400">{text}</td></tr>; }
function formatDate(value: string, time = false) { return new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit", ...(time ? { hour: "2-digit", minute: "2-digit" } : {}) }).format(new Date(value)); }
