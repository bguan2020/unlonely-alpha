const PrismaClient = require("@prisma/client").PrismaClient;
const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { performance } = require("perf_hooks");

const email = "brianguan98@gmail.com";
const password = "brianguanwordpass1234";

(async () => {
  puppeteerExtra.use(StealthPlugin());
  // run chrome
  const browser = await puppeteerExtra.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: false,
    args: ["--window-size=1920,1080"],
  });
  const prisma = new PrismaClient();
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  // await page.goto(
  //   "https://accounts.google.com/signin/v2/identifier?service=youtube&uilel=3&passive=true&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Ddesktop%26hl%3Den%26next%3Dhttps%253A%252F%252Fwww.youtube.com%252F&hl=en&ec=65620&ifkv=AQN2RmVHAScFBpJy13LMNfxicEe8jYAPphuBv924B5wYynh_PjwXcMz_bC0lYbYdAaOfFmQ_I8Aoxw&flowName=GlifWebSignIn&flowEntry=ServiceLogin"
  // );
  // await page.type('[type="email"]', email);
  // await page.click("#identifierNext");
  // await page.waitForTimeout(1500);

  // await page.type('[type="password"', password);
  // await page.click("#passwordNext");

  // await page.waitForTimeout(10000);

  // run below code on for loop 1000 times
  for (let i = 0; i < 1000; i++) {
    const videos = await prisma.video.findMany({
      where: { isDeleted: false },
      // order by score desc and then by createdat asc
      orderBy: [
        {
          score: "desc",
        },
        {
          createdAt: "asc",
        },
      ],
    });
    const topVideoYoutubeId = videos[0].youtubeId;
    const topVideoId = videos[0].id;
    const isScoreZero = videos[0].score === 0;
    // go to youtube with video id topVideoId

    await page.goto(`https://www.youtube.com/watch?v=${topVideoYoutubeId}`);
    // set video to currentVideo true
    await prisma.video.update({
      where: { id: topVideoId },
      data: { currentVideo: true },
    });
    // read video length from youtube page
    const videoLength = await page.evaluate(() => {
      const videoLength =
        document.querySelector(".ytp-time-duration").innerText;
      return videoLength;
    });
    // convert video length to milliseconds
    // count number of colons in video length
    const numberOfColons = (videoLength.match(/:/g) || []).length;
    if (numberOfColons >= 2) {
      // iterate to next video
      return;
    }
    const convertVideoLengthToMilliseconds = (videoLength) => {
      const videoLengthArray = videoLength.split(":");
      const videoLengthMilliseconds =
        parseInt(videoLengthArray[0]) * 60 * 1000 +
        parseInt(videoLengthArray[1]) * 1000;
      return videoLengthMilliseconds;
    };

    let videoLengthMilliseconds = convertVideoLengthToMilliseconds(videoLength);
    let startTime = performance.now();
    let endTime = startTime + videoLengthMilliseconds;
    // while waiting for video to finish playing, check video score every 5 seconds
    let isSkipped = false;
    while (endTime - startTime > 1000) {
      await page.waitForTimeout(5000);
      // query video score from database
      const videoScore = await prisma.video.findUnique({
        where: { id: topVideoId },
      });

      // if video score is less than or equal to 0, iterate to next video
      if (videoScore.score <= 0 && !isScoreZero) {
        console.log("skipping video");
        isSkipped = true;
        startTime = endTime;
      } else {
        startTime = performance.now();
        console.log("time left", endTime - startTime);
      }
    }

    await prisma.video.update({
      where: { id: topVideoId },
      data: { currentVideo: false, isDeleted: true },
    });
    if (isSkipped) {
      await page.goto("https://youtu.be/ijxG2fVa3Mg");
      await page.waitForTimeout(8000);
    } else {
      await page.goto("https://www.youtube.com/watch?v=D6zoWztZ9N4");
      await page.waitForTimeout(33000);
    }
  }
})();
