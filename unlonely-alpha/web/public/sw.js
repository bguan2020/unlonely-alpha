self.addEventListener("push", function (event) {
  const options = event.data.json().notification; // Customize this as per the payload you send
  event.waitUntil(self.registration.showNotification(options.title, options));
});
