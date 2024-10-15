const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: false,
});


module.exports = withBundleAnalyzer({
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  transpilePackages: ["@privy-io/react-auth"],
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
