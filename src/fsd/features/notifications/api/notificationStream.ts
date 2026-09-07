import { issueNotificationSubscribeTicket, type NotificationItem } from "./notifications.ts";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "/backend").replace(/\/$/, "");

export function subscribeNotifications(
  onNotification: (item: NotificationItem) => void,
  onConnect: () => void,
  signal: AbortSignal,
) {
  let stream: EventSource | null = null;
  let retry: ReturnType<typeof setTimeout> | undefined;

  const reconnect = () => {
    stream?.close();
    stream = null;
    if (!signal.aborted) retry = setTimeout(() => void connect(), 3000);
  };
  const connect = async () => {
    if (signal.aborted) return;
    try {
      // 티켓은 일회용이므로 재연결할 때마다 새로 발급한다.
      const { ticket } = await issueNotificationSubscribeTicket();
      if (signal.aborted) return;
      stream = new EventSource(`${API_BASE_URL}/api/notifications/subscribe?ticket=${encodeURIComponent(ticket)}`);
      stream.addEventListener("connect", onConnect);
      stream.addEventListener("notification", (event) => {
        try {
          onNotification(JSON.parse((event as MessageEvent).data));
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
  }, { once: true });
  void connect();
}
