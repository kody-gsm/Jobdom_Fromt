type SummaryActionCardProps = {
  title: string;
  detail: string;
  actionLabel?: string;
  pendingActionLabel?: string;
  actionDisabled?: boolean;
  actionPending?: boolean;
  onAction?: () => void;
  onSelect?: () => void;
};

export const SummaryActionCard = ({
  title,
  detail,
  actionLabel,
  pendingActionLabel,
  actionDisabled = false,
  actionPending = false,
  onAction,
  onSelect,
}: SummaryActionCardProps) => {
  const content = (
    <div className={`relative z-10 flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${onSelect ? "pointer-events-none" : ""}`}>
      <div className="min-w-0">
        <p className="font-bold text-ink">{title}</p>
        <p className="mt-1 text-sm text-secondary-text">{detail}</p>
      </div>
      {onAction && actionLabel ? (
        <button
          type="button"
          disabled={actionDisabled || actionPending}
          onClick={(event) => {
            event.stopPropagation();
            onAction();
          }}
          className="pointer-events-auto inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-disabled-text disabled:hover:bg-transparent"
        >
          {actionPending ? pendingActionLabel ?? actionLabel : actionLabel}
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="group relative flex min-h-20 rounded-2xl bg-panel p-5 transition-colors hover:bg-brand-soft">
      {onSelect ? (
        <button
          type="button"
          aria-label={`${title} ${detail} 상세 보기`}
          onClick={onSelect}
          className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand focus:ring-inset"
        />
      ) : null}
      {content}
    </div>
  );
};
