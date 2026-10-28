export const shouldLoadNotificationList = ({
  notificationLoaded,
  notificationLoading,
  notificationError,
}: {
  notificationLoaded: boolean;
  notificationLoading: boolean;
  notificationError: string | null;
}) =>
  !notificationLoaded
  && !notificationLoading
  && notificationError === null;
