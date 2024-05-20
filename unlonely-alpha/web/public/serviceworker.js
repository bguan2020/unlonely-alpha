self.addEventListener("push", async (event) => {
  try {
    const { notification } = await event.data.json();
    console.log("Received push", notification);
    const showNotificationPromise = self.registration.showNotification(
      notification.title,
      {
        body: notification.body,
        data: {
          url: notification.data.url, // Pass the URL data to the notification
        },
      }
    );
    event.waitUntil(showNotificationPromise);
  } catch (e) {
    console.log("error in push event", e);
  }
});

self.addEventListener("notificationclick", event => {
  event.notification.close(); // Close the notification

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      const targetUrl = new URL(event.notification.data.url || "/", self.location.origin).href; // Construct full URL

      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }

      // If target URL is root ("/")
      if (targetUrl === "/") {
        const rootClient = clientList.find(client => client.url === "/");
        if (rootClient) {
          return rootClient.focus();
        } else if (clients.openWindow) {
          return clients.openWindow("/");
        }
      }

      // If target URL is a channel URL
      const specificClient = clientList.find(client => client.url === targetUrl);
      if (specificClient) {
        return specificClient.focus();
      } else if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }

      // If no client is open, open a new one with the target URL
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});