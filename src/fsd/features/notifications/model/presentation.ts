export const shouldLoadNotificationList = ({
  notificationCount,
  notificationLoading,
  notificationError,
}: {
  notificationCount: number;
  notificationLoading: boolean;
  notificationError: string | null;
}) => notificationCount === 0 && !notificationLoading && notificationError === null;
