import {
  isReservationRealtimeEvent,
  type ReservationRealtimeEvent,
} from "@fsd/entities/consultation";
import { issueNotificationSubscribeTicket, type NotificationItem } from "./notifications.ts";

const FIRST_RETRY_MS = 3000;
const MAX_RETRY_MS = 60_000;
/** 연속 실패 횟수에 따른 재연결 대기 시간: 3초, 6초, 12초 … 최대 60초. */
export const getReconnectDelay = (failures: number) =>
  Math.min(FIRST_RETRY_MS * 2 ** Math.max(0, failures), MAX_RETRY_MS);

const isDocumentHidden = () => typeof document !== "undefined" && document.visibilityState === "hidden";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "/backend").replace(/\/$/, "");

export function subscribeNotifications(
  onNotification: (item: NotificationItem) => void,
  onConnect: (isReconnect: boolean) => void,
  signal: AbortSignal,
  onReservation?: (event: ReservationRealtimeEvent) => void,
  onDisconnect?: () => void,
) {
  let stream: EventSource | null = null;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let hasConnected = false;
  let failures = 0;
  let waitingForVisibility = false;

  const connectWhenVisible = () => {
    if (signal.aborted || isDocumentHidden()) return;
    document.removeEventListener("visibilitychange", connectWhenVisible);
    waitingForVisibility = false;
    void connect();
  };
  const reconnect = () => {
    // 같은 연결에서 오류 이벤트가 여러 번 와도 재연결 예약은 한 번만 한다.
    if (retry !== undefined || waitingForVisibility) return;
    stream?.close();
    stream = null;
    clearTimeout(retry);
    onDisconnect?.();
    if (!signal.aborted) {
      // 서버가 내려가 있을 때 탭마다 3초 간격으로 티켓을 계속 요청하지 않도록 간격을 늘린다.
      const delay = getReconnectDelay(failures);
      failures += 1;
      retry = setTimeout(() => {
        retry = undefined;
        // 숨겨진 탭은 다시 보일 때 연결한다. 보이는 순간 놓친 내용은 연결 이벤트에서 다시 받는다.
        if (isDocumentHidden()) {
          if (!waitingForVisibility) {
            waitingForVisibility = true;
            document.addEventListener("visibilitychange", connectWhenVisible);
          }
          return;
        }
        void connect();
      }, delay);
    }
  };
  const connect = async () => {
    if (signal.aborted) return;
    try {
      // 티켓은 일회용이므로 재연결할 때마다 새로 발급한다.
      const { ticket } = await issueNotificationSubscribeTicket();
      if (signal.aborted) return;
      stream = new EventSource(`${API_BASE_URL}/api/notifications/subscribe?ticket=${encodeURIComponent(ticket)}`);
      stream.addEventListener("connect", () => {
        const isReconnect = hasConnected;
        hasConnected = true;
        failures = 0;
        onConnect(isReconnect);
      });
      stream.addEventListener("notification", (event) => {
        try {
          onNotification(JSON.parse((event as MessageEvent).data));
        } catch { /* 잘못된 이벤트는 무시한다. */ }
      });
      stream.addEventListener("reservation", (event) => {
        try {
          const parsed: unknown = JSON.parse((event as MessageEvent).data);
          if (isReservationRealtimeEvent(parsed)) onReservation?.(parsed);
        } catch { /* 잘못된 이벤트는 무시한다. */ }
      });
      stream.addEventListener("error", reconnect);
    } catch {
      reconnect();
    }
  };
  signal.addEventListener("abort", () => {
    clearTimeout(retry);
    stream?.close();
    if (waitingForVisibility) document.removeEventListener("visibilitychange", connectWhenVisible);
  }, { once: true });
  void connect();
}
