module.exports = {
  async redirects() {
    return [
      {
        source: '/channels/youtube', 
        destination: '/channels/brian',
        permanent: true,
      },
      {
        source: '/channels/1', 
        destination: '/channels/brian',
        permanent: true,
      },
    ]
  },
}