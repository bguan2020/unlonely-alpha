/* eslint-disable @typescript-eslint/no-var-requires */
const withPWA = require("next-pwa")({
  dest: "public", // this is where the service worker will check for assets to cache
  mode: "production",
});
/* eslint-enable @typescript-eslint/no-var-requires */

module.exports = withPWA({
  async redirects() {
    return [
      {
        source: "/channels/youtube",
        destination: "/channels/brian",
        permanent: true,
      },
      {
        source: "/channels/1",
        destination: "/channels/brian",
        permanent: true,
      },
    ];
  },
  // any other configurations you have...
});
