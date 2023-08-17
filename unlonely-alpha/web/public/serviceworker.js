self.addEventListener('push', function(event) {

  var myNotif = event.data.json();
  const promiseChain = self.registration.showNotification(myNotif.title);

  event.waitUntil(promiseChain);
});