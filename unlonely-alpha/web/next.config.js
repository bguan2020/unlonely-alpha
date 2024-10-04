const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: true,
});

module.exports = withBundleAnalyzer({
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
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
  async headers() {
    return [
      {
        source: "/clip",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
        ],
      },
    ];
  },
});
