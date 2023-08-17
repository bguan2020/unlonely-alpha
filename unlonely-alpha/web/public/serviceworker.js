self.addEventListener("push", async (event) => {
  const { notification } = await event.data.json();
  console.log("Received push", notification);
  const data = await self.registration.showNotification(notification.title, {
    body: notification.body,
  });
});