// import TwitterApi, { EUploadMimeType } from "twitter-api-v2";
// import fs from "fs";

// const client = new TwitterApi({
//     appKey: process.env.TWITTER_CONSUMER_KEY,
//     appSecret: process.env.TWITTER_CONSUMER_SECRET,
//     accessToken: process.env.TWITTER_ACCESS_TOKEN,
//     accessSecret: process.env.TWITTER_ACCESS_SECRET,
//   } as any);

//   const rwClient = client.readWrite;
  

export interface IPostVideoOnTwitterInput {
  videoFile: Express.Multer.File;
  status: string;
}

export const postVideoOnTwitter = async (data: IPostVideoOnTwitterInput) => {
  // try {
  //   const videoPath = data.videoFile.path;
  //   const mediaType = "video/mp4"; // You can derive this from the file if necessary
  //   const mediaSize = fs.statSync(videoPath).size;
  //   const mediaData = fs.readFileSync(videoPath);

  //   // INIT the upload
  //   const initResponse = await rwClient.v1.mediaInit({
  //     command: "INIT",
  //     total_bytes: mediaSize,
  //     media_type: mediaType,
  //   });

  //   const mediaId = initResponse.media_id_string;

  //   // APPEND the upload chunks
  //   const chunkSize = 1024 * 1024; // 1MB per chunk
  //   for (let i = 0; i < mediaSize; i += chunkSize) {
  //     const chunk = mediaData.slice(i, i + chunkSize);
  //     await rwClient.v1.mediaAppend({
  //       command: "APPEND",
  //       media_id: mediaId,
  //       segment_index: i / chunkSize,
  //       media: chunk,
  //     });
  //   }

  //   // FINALIZE the upload
  //   await rwClient.v1.mediaFinalize({
  //     command: "FINALIZE",
  //     media_id: mediaId,
  //   });

  //   // Post the tweet with the uploaded video"s media ID
  //   await rwClient.v1.tweet(data.status, { media_ids: [mediaId] });

  //   // Clean up the temporary file
  //   fs.unlinkSync(videoPath);

  //   console.log("Tweet posted successfully!");
  // } catch (error) {
  //   console.error("Failed to post tweet:", error);
  // }return null
};