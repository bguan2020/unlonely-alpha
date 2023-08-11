if (!self.define) {
  let e,
    s = {};
  const a = (a, c) => (
    (a = new URL(a + ".js", c).href),
    s[a] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = a), (e.onload = s), document.head.appendChild(e);
        } else (e = a), importScripts(a), s();
      }).then(() => {
        let e = s[a];
        if (!e) throw new Error(`Module ${a} didn’t register its module`);
        return e;
      })
  );
  self.define = (c, i) => {
    const n =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[n]) return;
    let r = {};
    const t = (e) => a(e, n),
      d = { module: { uri: n }, exports: r, require: t };
    s[n] = Promise.all(c.map((e) => d[e] || t(e))).then((e) => (i(...e), r));
  };
}
define(["./workbox-50de5c5d"], function (e) {
  "use strict";
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/static/chunks/106-e490c4ddc6a75539.js",
          revision: "e490c4ddc6a75539",
        },
        {
          url: "/_next/static/chunks/1236.e14fd10417d4d1bb.js",
          revision: "e14fd10417d4d1bb",
        },
        {
          url: "/_next/static/chunks/1835-e5cf720ebfed8ca8.js",
          revision: "e5cf720ebfed8ca8",
        },
        {
          url: "/_next/static/chunks/185-0dc8773919d8945a.js",
          revision: "0dc8773919d8945a",
        },
        {
          url: "/_next/static/chunks/1858-c6ae59b276295d0d.js",
          revision: "c6ae59b276295d0d",
        },
        {
          url: "/_next/static/chunks/1bfc9850.449c62c61bc91738.js",
          revision: "449c62c61bc91738",
        },
        {
          url: "/_next/static/chunks/1e74bd89-9a4b024726054093.js",
          revision: "9a4b024726054093",
        },
        {
          url: "/_next/static/chunks/2010.401661d5b7a5e5ac.js",
          revision: "401661d5b7a5e5ac",
        },
        {
          url: "/_next/static/chunks/2102.54097f81e02197d6.js",
          revision: "54097f81e02197d6",
        },
        {
          url: "/_next/static/chunks/214-9cd6a8c91cbba791.js",
          revision: "9cd6a8c91cbba791",
        },
        {
          url: "/_next/static/chunks/2205-47cc861256cc8ec5.js",
          revision: "47cc861256cc8ec5",
        },
        {
          url: "/_next/static/chunks/3337.0ba9d28e9a304cef.js",
          revision: "0ba9d28e9a304cef",
        },
        {
          url: "/_next/static/chunks/3465-a96c77429fdc7f6b.js",
          revision: "a96c77429fdc7f6b",
        },
        {
          url: "/_next/static/chunks/4494.e1d6660acde58fbf.js",
          revision: "e1d6660acde58fbf",
        },
        {
          url: "/_next/static/chunks/5047-5239b390eb7e7920.js",
          revision: "5239b390eb7e7920",
        },
        {
          url: "/_next/static/chunks/5253-e9b8b46feb01b95e.js",
          revision: "e9b8b46feb01b95e",
        },
        {
          url: "/_next/static/chunks/532-a087fdc524fcebe2.js",
          revision: "a087fdc524fcebe2",
        },
        {
          url: "/_next/static/chunks/5423ad26-39739ca4d3674952.js",
          revision: "39739ca4d3674952",
        },
        {
          url: "/_next/static/chunks/556e5be3-18e6dc2c98d1c9be.js",
          revision: "18e6dc2c98d1c9be",
        },
        {
          url: "/_next/static/chunks/5734-df385185c60177a5.js",
          revision: "df385185c60177a5",
        },
        {
          url: "/_next/static/chunks/626.5187aab400121da6.js",
          revision: "5187aab400121da6",
        },
        {
          url: "/_next/static/chunks/6792.5b709590c10ed97e.js",
          revision: "5b709590c10ed97e",
        },
        {
          url: "/_next/static/chunks/6893.74515a55d6255155.js",
          revision: "74515a55d6255155",
        },
        {
          url: "/_next/static/chunks/6909.b3a6ff152a704fe9.js",
          revision: "b3a6ff152a704fe9",
        },
        {
          url: "/_next/static/chunks/7589-764da2335737ee5c.js",
          revision: "764da2335737ee5c",
        },
        {
          url: "/_next/static/chunks/782.95b3b462ef9abf10.js",
          revision: "95b3b462ef9abf10",
        },
        {
          url: "/_next/static/chunks/8162-86fe2cfb04f3d7b9.js",
          revision: "86fe2cfb04f3d7b9",
        },
        {
          url: "/_next/static/chunks/8468-3c7e9875edd9f635.js",
          revision: "3c7e9875edd9f635",
        },
        {
          url: "/_next/static/chunks/9343.73ae72481e4ca734.js",
          revision: "73ae72481e4ca734",
        },
        {
          url: "/_next/static/chunks/9360.f5ff04104e7a242a.js",
          revision: "f5ff04104e7a242a",
        },
        {
          url: "/_next/static/chunks/9459-b68f3d8bac314142.js",
          revision: "b68f3d8bac314142",
        },
        {
          url: "/_next/static/chunks/9794-89c0b610511fcee9.js",
          revision: "89c0b610511fcee9",
        },
        {
          url: "/_next/static/chunks/a0e03aaa.bf8e7b314522b3b4.js",
          revision: "bf8e7b314522b3b4",
        },
        {
          url: "/_next/static/chunks/d0c16330.e3e8f71bc1b721f0.js",
          revision: "e3e8f71bc1b721f0",
        },
        {
          url: "/_next/static/chunks/d2db5d99-f98433b630adf5a0.js",
          revision: "f98433b630adf5a0",
        },
        {
          url: "/_next/static/chunks/d64684d8.54fb1991d4d9f5e6.js",
          revision: "54fb1991d4d9f5e6",
        },
        {
          url: "/_next/static/chunks/d6e1aeb5-e956be940e3906bc.js",
          revision: "e956be940e3906bc",
        },
        {
          url: "/_next/static/chunks/framework-1f1fb5c07f2be279.js",
          revision: "1f1fb5c07f2be279",
        },
        {
          url: "/_next/static/chunks/main-fe180ae1686aa7f2.js",
          revision: "fe180ae1686aa7f2",
        },
        {
          url: "/_next/static/chunks/pages/_error-02cc11fd74b4e5ff.js",
          revision: "02cc11fd74b4e5ff",
        },
        {
          url: "/_next/static/chunks/pages/admin-83bfe60fee7bb60b.js",
          revision: "83bfe60fee7bb60b",
        },
        {
          url: "/_next/static/chunks/pages/channels/%5Bslug%5D-f624f1cb22cc6e7c.js",
          revision: "f624f1cb22cc6e7c",
        },
        {
          url: "/_next/static/chunks/pages/clip-6b422cd1730de59e.js",
          revision: "6b422cd1730de59e",
        },
        {
          url: "/_next/static/chunks/pages/index-ed18d3a7129bb73a.js",
          revision: "ed18d3a7129bb73a",
        },
        {
          url: "/_next/static/chunks/pages/mobile/chat/%5BawsId%5D-5cb10ef0d4ff2dc5.js",
          revision: "5cb10ef0d4ff2dc5",
        },
        {
          url: "/_next/static/chunks/pages/mobile/connect-wallet-58eb8864be353590.js",
          revision: "58eb8864be353590",
        },
        {
          url: "/_next/static/chunks/pages/mobile/notifications-admin-d4a34a1bf570b839.js",
          revision: "d4a34a1bf570b839",
        },
        {
          url: "/_next/static/chunks/pages/mobile/notifications-e91c03bd7f470874.js",
          revision: "e91c03bd7f470874",
        },
        {
          url: "/_next/static/chunks/pages/mobile/notifications-user-05afb9357c075fe8.js",
          revision: "05afb9357c075fe8",
        },
        {
          url: "/_next/static/chunks/pages/nfc/%5BnfcId%5D-510a01513a2fad22.js",
          revision: "510a01513a2fad22",
        },
        {
          url: "/_next/static/chunks/pages/privacy-c60a983dfdc7461d.js",
          revision: "c60a983dfdc7461d",
        },
        {
          url: "/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",
          revision: "837c0df77fd5009c9e46d446188ecfd0",
        },
        {
          url: "/_next/static/chunks/webpack-1ed44d2637e7f4ef.js",
          revision: "1ed44d2637e7f4ef",
        },
        {
          url: "/_next/static/css/7ce69af32259ac47.css",
          revision: "7ce69af32259ac47",
        },
        {
          url: "/_next/static/ubpnhSSqcmr-KsCfgFs__/_buildManifest.js",
          revision: "97807f8cc47a0a4d37f84d0683b133a6",
        },
        {
          url: "/_next/static/ubpnhSSqcmr-KsCfgFs__/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        { url: "/cursor.svg", revision: "6841927381d719fc86dd7a5693615533" },
        {
          url: "/fonts/NeuePixelSans.ttf",
          revision: "28f40e8260a122aee8e6a84c9bb5ebd5",
        },
        {
          url: "/fonts/SpaceMono-Regular.ttf",
          revision: "49a79d66bdea2debf1832bf4d7aca127",
        },
        {
          url: "/icons/icon-192x192.png",
          revision: "f9991f021680b30c37a48bf4718d2ccf",
        },
        {
          url: "/icons/icon-512x512.png",
          revision: "47dfc527d130e6e770ac96b133f73a0c",
        },
        {
          url: "/images/TikTok_logo.png",
          revision: "2cc00bd07207dd7aae8a4b5b1d4545e1",
        },
        {
          url: "/images/YT_logo.png",
          revision: "1523ea028e9130e8446546369d6c5026",
        },
        {
          url: "/images/badges/lvl1_host.png",
          revision: "e2706d36d4a90e8ff260828121c6501f",
        },
        {
          url: "/images/badges/lvl1_poweruser.png",
          revision: "65a2295fa2c081407c8720ea75adf4ea",
        },
        {
          url: "/images/badges/lvl1_videosavant.png",
          revision: "6f225a82d8bb70ecf257aafd49282a80",
        },
        {
          url: "/images/badges/lvl2_host.png",
          revision: "b27d5932caf070f01eb47da33472d53d",
        },
        {
          url: "/images/badges/lvl2_poweruser.png",
          revision: "a2e992746d9e989b8bcaf8a53219cea8",
        },
        {
          url: "/images/badges/lvl2_videosavant.png",
          revision: "d9751a6af659037ec60856d1ca5fe4ed",
        },
        {
          url: "/images/badges/lvl3_host.png",
          revision: "299733752ba9799e88f3fa7551a8b4ab",
        },
        {
          url: "/images/badges/lvl3_poweruser.png",
          revision: "cef91c0b5e2c7d21c1d488794fc05e2a",
        },
        {
          url: "/images/badges/lvl3_videosavant.png",
          revision: "a3eada3f581c9e81d1fa24523c335117",
        },
        {
          url: "/images/badges/nfc_rank_1.png",
          revision: "36a628c88a20c1f9e951d08b045a11a3",
        },
        {
          url: "/images/farcaster_logo.png",
          revision: "4594618ec6f4cf330ab5b783c006dbbf",
        },
        {
          url: "/images/favicon-16x16.png",
          revision: "aeedd619968d4286cc56ec0f9ddd36c5",
        },
        {
          url: "/images/favicon-32x32.png",
          revision: "9ee3b54341082d31e00a9907964317ec",
        },
        {
          url: "/images/favicon.ico",
          revision: "a474d792054791d6332e7b272f1814ad",
        },
        {
          url: "/images/lens_logo.png",
          revision: "c18c390f290c5f3b6afdcd059322df81",
        },
        {
          url: "/images/opensea-blue_logo.png",
          revision: "b026ccd2a6476482bcbbe445e5c45ed4",
        },
        {
          url: "/images/playIcon.png",
          revision: "cdb0abe30324e009ea76459f3ba0555a",
        },
        {
          url: "/images/social_banner.png",
          revision: "162116398e83335bfeb2b89aaf9e3a7b",
        },
        {
          url: "/images/unlonely2.jpg",
          revision: "db2d65fd80a73ce11b602b36db0c38bc",
        },
        {
          url: "/images/unlonely3.jpg",
          revision: "250da0740fbdb167087bf381920a4cda",
        },
        {
          url: "/images/unlonelyone.jpg",
          revision: "7079e7f99d08cb74ad0b34e52cca837c",
        },
        { url: "/manifest.json", revision: "336ae253801373388a18085a53060574" },
        {
          url: "/svg/arcade/buy-hover.svg",
          revision: "bfd2ea02d756d3624ff636f0e134af79",
        },
        {
          url: "/svg/arcade/buy.svg",
          revision: "9753f770b8b6fa0869fb6ff001fe505c",
        },
        {
          url: "/svg/arcade/coin-hover.svg",
          revision: "d38fef2800062daff6ed9c8eb64700f1",
        },
        {
          url: "/svg/arcade/coin.svg",
          revision: "c87844a74e395c6963027e113b0f4762",
        },
        {
          url: "/svg/arcade/control-hover.svg",
          revision: "6f7ae141d9d1cb04fcc58cee48a1e5fc",
        },
        {
          url: "/svg/arcade/control.svg",
          revision: "b454ab1afb5535c3cd78838e65ea34b5",
        },
        {
          url: "/svg/arcade/custom-hover.svg",
          revision: "9164c0526fa4bd071e5727a6ca29c30d",
        },
        {
          url: "/svg/arcade/custom.svg",
          revision: "2735160e99005b0f2fcb2f185397c634",
        },
        {
          url: "/svg/arcade/dice-hover.svg",
          revision: "523bc4f860f6f018125be64ce50554b8",
        },
        {
          url: "/svg/arcade/dice.svg",
          revision: "dfae76647fde79919fe4624f35a04a69",
        },
        {
          url: "/svg/arcade/sword-hover.svg",
          revision: "f6a8e620b08c61577197e84d3602554a",
        },
        {
          url: "/svg/arcade/sword.svg",
          revision: "f515dafdd6e308e050fe1c7df1ccb835",
        },
        {
          url: "/svg/blast-send.svg",
          revision: "5737b02ce15de6a9c682bbd89b7728f3",
        },
        { url: "/svg/blast.svg", revision: "cea91c51d23fc10f99745ff3ba3d7e9b" },
        {
          url: "/svg/calendar.svg",
          revision: "eb2d4c66e22532c7059b5814ffc39557",
        },
        { url: "/svg/close.svg", revision: "954ee418a9ec447a98553e25e165887f" },
        {
          url: "/svg/custom-actions.svg",
          revision: "f7688c6c9f4f6c8351a8f7eb1ab9d98d",
        },
        {
          url: "/svg/custom-commands.svg",
          revision: "308bd0265f3d8f298f671ae364ddf36c",
        },
        { url: "/svg/cut.svg", revision: "074a87a7409ee0a7478be3079f422413" },
        { url: "/svg/edit.svg", revision: "77ca85b544f4dc87cfd7492aa1328ca5" },
        { url: "/svg/emoji.svg", revision: "d92f02429dd6be1a850b83686437f514" },
        {
          url: "/svg/holder-1.svg",
          revision: "3477d7c9486c91cf9eadcb874a68e560",
        },
        {
          url: "/svg/holder-2.svg",
          revision: "99dc349f96206d01a58466d2d3c88dd1",
        },
        {
          url: "/svg/holder-3.svg",
          revision: "f02e290e562a9e06db23ff1e38cd1687",
        },
        {
          url: "/svg/holder-general.svg",
          revision: "bb0098a3c90fe193a13605a08f19b1a0",
        },
        {
          url: "/svg/notifications.svg",
          revision: "56e76dd58c533a6c0cef2fe8e8469f4f",
        },
        {
          url: "/svg/pop-out.svg",
          revision: "b74f23ceb44f3f41b1eb53dbbc0f8911",
        },
        {
          url: "/svg/preview-video.svg",
          revision: "4862293649b00c45f38d2074819468db",
        },
        { url: "/svg/send.svg", revision: "270bdaceac02718a3d8c569efef3d6f8" },
        {
          url: "/svg/token-sale.svg",
          revision: "c2a9b226b7190eac5a62ba2a7558863f",
        },
        { url: "/tie-dye.png", revision: "01cc3c4f10f8f3e4813787d7b482f0af" },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: a,
              state: c,
            }) =>
              s && "opaqueredirect" === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: "OK",
                    headers: s.headers,
                  })
                : s,
          },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const s = e.pathname;
        return !s.startsWith("/api/auth/") && !!s.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "others",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      "GET"
    );
});
