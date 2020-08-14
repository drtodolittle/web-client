importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js');

if (workbox) {
  workbox.core.skipWaiting()
  workbox.core.clientsClaim()
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

}