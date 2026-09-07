type SummaryActionCardProps = {
  title: string;
  detail: string;
  actionLabel?: string;
  pendingActionLabel?: string;
  actionDisabled?: boolean;
  actionPending?: boolean;
  onAction?: () => void;
};

export const SummaryActionCard = ({
  title,
  detail,
  actionLabel,
  pendingActionLabel,
  actionDisabled = false,
  actionPending = false,
  onAction,
}: SummaryActionCardProps) => (
  <div className="flex flex-col gap-3 rounded-2xl bg-panel p-5 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="font-bold text-ink">{title}</p>
      <p className="mt-1 text-sm text-secondary-text">{detail}</p>
    </div>
    {onAction && actionLabel ? (
      <button
        type="button"
        disabled={actionDisabled || actionPending}
        onClick={onAction}
        className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-disabled-text disabled:hover:bg-transparent"
      >
        {actionPending ? pendingActionLabel ?? actionLabel : actionLabel}
      </button>
    ) : null}
  </div>
);
