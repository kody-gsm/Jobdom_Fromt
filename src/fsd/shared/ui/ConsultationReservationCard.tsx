type ConsultationReservationCardProps = {
  type: string;
  date: string;
  period: string;
  canCancel?: boolean;
  canceling?: boolean;
  onCancel?: () => void;
};

export const ConsultationReservationCard = ({
  type,
  date,
  period,
  canCancel = false,
  canceling = false,
  onCancel,
}: ConsultationReservationCardProps) => {
  const displayDate = date.replaceAll("-", ".");

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-[#F7F8FA] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-bold text-ink">{type}</p>
        <p className="mt-1 text-sm text-[#7A8592]">
          {displayDate} / {period}
        </p>
      </div>
      {onCancel ? (
        <button
          type="button"
          disabled={!canCancel || canceling}
          onClick={onCancel}
          className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-[#A8AFB8] disabled:hover:bg-transparent"
        >
          {canceling ? "취소 중" : "예약 취소"}
        </button>
      ) : null}
    </div>
  );
};
