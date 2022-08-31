module.exports = {
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
  webpack(config) {
    config.module.rules.push({
        /**
        * Developers packaging the IVS player into an app are required to resolve and import the following assets via URL:
        *
        * 'amazon-ivs-player/dist/assets/amazon-ivs-wasmworker.min.wasm'
        * 'amazon-ivs-player/dist/assets/amazon-ivs-wasmworker.min.js';
        * 'amazon-ivs-player/dist/assets/amazon-ivs-worker.min.js';
        *
        * These assets must not be re-compiled during packaging.
        * The webpack file-loader (https://webpack.js.org/loaders/file-loader/) accomplishes this.
        * Rollup's plugin-url (https://github.com/rollup/plugins/tree/master/packages/url) also seems to do this, but has not been tested.
        */
        test: /[\/\\]amazon-ivs-player[\/\\].*dist[\/\\]assets[\/\\]/,
        loader: 'file-loader',
        type: 'javascript/auto',
        options: {
            name: '[name].[ext]',
            outputPath: 'static/ivs-player',
            publicPath: '/_next/static/ivs-player'
        }
    })
    return config
  },
};
