const PrismaClient = require("@prisma/client").PrismaClient;
const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const email = "brianguan98@gmail.com";
const password = "brianguanwordpass1234";

(async () => 
{   
  puppeteerExtra.use(StealthPlugin());
  // run chrome
  const browser = await puppeteerExtra.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: false,
    args: ["--window-size=1920,1080"],
  });
  const prisma = new PrismaClient();
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900});
  await page.goto('https://accounts.google.com/signin/v2/identifier?service=youtube&uilel=3&passive=true&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Ddesktop%26hl%3Den%26next%3Dhttps%253A%252F%252Fwww.youtube.com%252F&hl=en&ec=65620&ifkv=AQN2RmVHAScFBpJy13LMNfxicEe8jYAPphuBv924B5wYynh_PjwXcMz_bC0lYbYdAaOfFmQ_I8Aoxw&flowName=GlifWebSignIn&flowEntry=ServiceLogin');
  await page.type('[type="email"]', email);
  await page.click('#identifierNext');
  await page.waitForTimeout(1500);

  await page.type('[type="password"', password);
  await page.click('#passwordNext');

  await page.waitForTimeout(10000);
  
  // run below code on for loop 1000 times
  for (let i = 0; i < 1000; i++)
  {
    const videos = await prisma.video.findMany({
      where: { isDeleted: false },
      // order by score desc and then by createdat asc
      orderBy: [{
        score: "desc",
      },
      {
        createdAt: "asc",
      }],
    });
    console.log("hit this");
    console.log(videos);
    const topVideoId = videos[0].youtubeId;
    // go to youtube with video id topVideoId

    await page.goto(`https://www.youtube.com/watch?v=${topVideoId}`);
    // set video to currentVideo true
    await prisma.video.update({
      where: { youtubeId: topVideoId },
      data: { currentVideo: true },
    });
    // read video length from youtube page
    const videoLength = await page.evaluate(() => {
      const videoLength = document.querySelector(".ytp-time-duration").innerText;
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
    const videoLengthMilliseconds = convertVideoLengthToMilliseconds(videoLength);
    await page.waitForTimeout(videoLengthMilliseconds);

    await prisma.video.update({
      where: { youtubeId: topVideoId },
      data: { currentVideo: false, isDeleted: true },
    });

    await page.goto("https://www.youtube.com/watch?v=D6zoWztZ9N4");
    await page.waitForTimeout(33000);
}
})();