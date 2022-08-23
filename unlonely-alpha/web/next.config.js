module.exports = {
  async redirects() {
    return [
      {
        source: '/channels/youtube',
        destination: '/channels/brian',
        permanent: true,
      },
    ]
  },
}