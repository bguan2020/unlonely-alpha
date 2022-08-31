import React, { useEffect } from "react";
import videojs from "video.js";
import {
  VideoJSQualityPlugin,
  VideoJSIVSTech,
  VideoJSEvents,
  TextMetadataCue,
} from "amazon-ivs-player";
import Head from "next/head";

// 디폴트 playback url
const defaultPlaybackUrl =
  "https://0ef8576db087.us-west-2.playback.live-video.net/api/video/v1/us-west-2.500434899882.channel.8e2oKm7LXNGq.m3u8";

function IVSPlayer() {
  useEffect(() => {
    const PLAYBACK_URL = defaultPlaybackUrl;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.registerIVSTech(videojs);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.registerIVSQualityPlugin(videojs);

    /**
     * 플레이어를 초기화하고 instantiate 합니다.
     */
    const player = videojs(
      // 플레이어에 연동될 video 태그의 id
      "amazon-ivs-videojs",
      // 플레이어 옵션
      {
        techOrder: ["AmazonIVS"], // 플레이어 인스턴스를 생성할 때, IVS 를 첫 번째 테크로 제공해주어야 합니다.
        autoplay: true,
      },
      // video.js ready 이벤트 핸들러 추가
      () => {
        // playback url 을 src 로 설정합니다. autoplay 가 옵션으로 주어진다면 바로 play 됩니다.
        console.log("IVS Player is READY!");
        player.src(PLAYBACK_URL);
      }
    ) as videojs.Player & VideoJSIVSTech & VideoJSQualityPlugin;

    // 위에서 등록한 플러그인을 enable 시켜주어야 UI 버튼들이 나타납니다.
    player.enableIVSQualityPlugin();

    /**
     * 이벤트 리스너를 추가해줍니다
     * video.js 외의 IVS Player 에서 발생하는 event 는 다음과 같이 추가하고 제거할 수 있습니다.
     */
    const events: VideoJSEvents = player.getIVSEvents();
    const ivsPlayer = player.getIVSPlayer();

    // PLAYING 이벤트 핸들러 추가
    ivsPlayer.addEventListener(events.PlayerState.PLAYING, () => {
      console.log("IVS Player is PLAYING");
    });
    // IDLE 이벤트 핸들러 추가
    ivsPlayer.addEventListener(events.PlayerState.IDLE, () => {
      console.log("IVS Player is IDLE");
    });
    // BUFFERING 이벤트 핸들러 추가
    ivsPlayer.addEventListener(events.PlayerState.BUFFERING, () => {
      console.log("IVS Player is BUFFERING");
    });
    // ENDED 이벤트 핸들러 추가
    ivsPlayer.addEventListener(events.PlayerState.ENDED, () => {
      console.log("IVS Player is ENDED");
    });

    /**
     * 에러 핸들러를 추가해줍니다.
     */
    // video.js 에러 핸들러 추가
    player.on("error", () => {
      console.log(player.error());
    });
    // IVS 플레이어 에러 핸들러 추가
    ivsPlayer.addEventListener(events.PlayerEventType.ERROR, (payload) => {
      const { type, code, source, message } = payload;
      console.log(type, code, source, message);
      alert(message);
    });
  }, []);

  return (
    <>
      <Head>
        {/** IVS 플레이어에서 제공해주는 플러그인 UI를 스타일링 하는 css */}
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/video.js/7.6.6/video-js.css"
          rel="stylesheet"
        />
      </Head>
        <video
          id="amazon-ivs-videojs"
          className="video-js vjs-4-3 vjs-big-play-centered"
          controls
          autoPlay
          playsInline
        ></video>
    </>
  );
}

export default IVSPlayer;