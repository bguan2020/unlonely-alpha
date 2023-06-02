const PrismaClient = require("@prisma/client").PrismaClient;
const axios = require("axios");
const moment = require("moment");

const YT_PUBLIC_KEY = "AIzaSyAobxgmgOkLIOnwDsKMF_e_4fFSUrcUIxk";

(async () => {
  const prisma = new PrismaClient();
  const videos = await prisma.video.findMany({
    where: { duration: 0 },
  });
  for (let i = 0; i < videos.length; i++) {
    const videoId = videos[i].youtubeId;
    console.log(videoId);
    const duration = await getVideoDurations(videoId);
    // update video duration in database
    await prisma.video.update({
      where: { youtubeId: videoId },
      data: { duration },
    });
    console.log("updated video", videoId, "with duration", duration);
  }
})();

const getVideoDurations = async (youtubeId) => {
  const { data } = await axios.get(
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&part=snippet&id=${youtubeId}&key=${YT_PUBLIC_KEY}`
  );
  console.log(data);
  let videoLength;
  try {
    videoLength = moment
      .duration(data.items[0].contentDetails.duration)
      .asSeconds();
  } catch {
    videoLength = 0;
  }

  return videoLength;
};
