import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { BlurView } from 'expo-blur';

type FullscreenNfcProps = {
  height: number;
  ref: any;
  width: number;
  item: any;
};

type NfcVideoProps = {
  blurred?: boolean;
  height: number;
  play: boolean;
  item: any;
  videoRef?: any;
};

const VIDEO_START_POSITION = 1500; // milliseconds

const NfcVideo = (props: NfcVideoProps) => (
  <Video
    isLooping={true}
    isMuted={props.blurred ? true : false}
    positionMillis={VIDEO_START_POSITION}
    usePoster
    posterSource={{ uri: `${props.item.videoLink}#t=${VIDEO_START_POSITION / 1000}` }}
    // loading a still from the video start position rather than the poster image
    // so it doesn’t create an awkward repeating transition when a new video starts playing
    posterStyle={{ width: '100%', height: props.height, resizeMode: 'contain' }}
    ref={props.videoRef}
    resizeMode={props.blurred ? ResizeMode.COVER : ResizeMode.CONTAIN}
    shouldPlay={props.play}
    source={{ uri: props.item.videoLink }}
    videoStyle={{ width: '100%', height: props.height }}
    style={styles.video}
  />
);

export const FullscreenNfc = forwardRef((props: FullscreenNfcProps, parentRef) => {
  const ref = useRef(null);
  const [shouldPlay, setShouldPlay] = useState(false);

  useImperativeHandle(parentRef, () => ({
    play,
    // unload,
    pause,
  }));

  const play = async () => {
    if (ref.current === null) return;
    const status = await ref.current.getStatusAsync();
    if (status?.isPlaying) return;

    try {
      // await ref.current.playAsync();
      setShouldPlay(true);
    } catch {
      alert('error playing video');
    }
  };

  const pause = async () => {
    if (ref.current === null) return;
    const status = await ref.current.getStatusAsync();
    if (!status?.isPlaying) return;

    try {
      // await ref.current.pauseAsync();
      setShouldPlay(false);
    } catch {
      alert('error stopping video');
    }
  };

  // const unload = async () => {
  //   if (ref.current === null) return;

  //   try {
  //     console.log('unloading video');
  //     await ref.current.unloadAsync();
  //   } catch {
  //     console.error('error unloading video');
  //   }
  // };

  // useEffect(() => {
  //   unload();
  // }, []);

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        height: props.height,
      }}
    >
      <View
        style={{
          flex: 1,
          width: '100%',
          height: props.height,
          position: 'absolute',
        }}
      >
        {/* make it a user selectable setting to disable these blurs for better performance */}
        {/* also disable on android */}
        <NfcVideo item={props.item} height={props.height} blurred play={shouldPlay} />
      </View>
      <BlurView
        intensity={80}
        tint="dark"
        style={{
          position: 'absolute',
          height: props.height,
          width: '100%',
          backgroundColor: 'rgba(0,0,0, 0.5)',
        }}
      />
      <View
        style={{
          flex: 1,
          width: '100%',
          height: props.height,
        }}
      >
        <NfcVideo item={props.item} videoRef={ref} height={props.height} play={shouldPlay} />
        <Text style={styles.subtitle}>{props.item.title}</Text>
        <Text style={styles.subtitle}>owned by {props.item.owner.username}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  subtitle: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'NeuePixelSans',
    paddingVertical: 24,
    paddingHorizontal: 24,
    bottom: 80,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
});
