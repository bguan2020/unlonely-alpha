export const createLivepeerPlaybackLink = (assetPlaybackId: string, videoHeight: number) => {
    return `https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/${assetPlaybackId}/${videoHeight}p0.mp4`
}
