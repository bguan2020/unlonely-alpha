self.addEventListener('push', function(event) {
  console.log("Push notification received", event);

  var myNotif = event.data.json();
  const promiseChain = self.registration.showNotification(myNotif.title);
  console.log(promiseChain);

  event.waitUntil(promiseChain);
});