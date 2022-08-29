module.exports = {
  async redirects() {
    return [
      {
        source: ['/channels/youtube', '/channels/1'], 
        destination: '/channels/brian',
        permanent: true,
      },
    ]
  },
}