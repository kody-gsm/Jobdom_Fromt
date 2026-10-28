export const shouldLoadNotificationList = ({
  notificationCount,
  notificationLoaded,
  notificationLoading,
  notificationError,
}: {
  notificationCount: number;
  notificationLoaded: boolean;
  notificationLoading: boolean;
  notificationError: string | null;
}) =>
  !notificationLoaded
  && notificationCount === 0
  && !notificationLoading
  && notificationError === null;
