importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.0.0/workbox-sw.js');

if (workbox && !self.location.hostname.startsWith('localhost')) {
  workbox.core.skipWaiting()
  workbox.core.clientsClaim()
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

}