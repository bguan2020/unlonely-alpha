self.addEventListener("push", async (event) => {
  try {
    const { notification } = await event.data.json();
    console.log("Received push", notification);
    const showNotificationPromise = self.registration.showNotification(
      notification.title,
      {
        body: notification.body,
      }
    );
    event.waitUntil(showNotificationPromise);
  } catch (e) {
    console.log("error in push event", e);
  }
});
