import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View, FlatList, useWindowDimensions } from 'react-native';
import { ResizeMode, Video, Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { FlashList } from '@shopify/flash-list';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';
import { Canvas, Blur, Image, ColorMatrix, useImage, Group, BackdropBlur, Fill } from '@shopify/react-native-skia';
import { BlurView } from 'expo-blur';

type FullscreenNfcProps = {
  height: number;
  ref: any;
  uri: string;
  width: number;
};

type NfcVideoProps = {
  blurred?: boolean;
  height: number;
  play: boolean;
  uri: string;
  videoRef: any;
};

const NfcVideo = (props: NfcVideoProps) => (
  <Video
    isLooping={true}
    isMuted={props.blurred ? true : false}
    posterSource={{ uri: `${props.uri}#t=0.01` }}
    posterStyle={{ width: '100%', height: props.height, resizeMode: 'contain' }}
    ref={props.videoRef}
    resizeMode={props.blurred ? ResizeMode.COVER : ResizeMode.CONTAIN}
    shouldPlay={props.play}
    source={{ uri: props.uri }}
    style={styles.video}
    usePoster
    videoStyle={{ width: '100%', height: props.height }}
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
        <NfcVideo uri={props.uri} videoRef={ref} height={props.height} blurred play={shouldPlay} />
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
        <NfcVideo uri={props.uri} videoRef={ref} height={props.height} play={shouldPlay} />
        <Text style={styles.subtitle}>brian explains the blockchain in iceland geography</Text>
        <Text style={styles.subtitle}>nfc by cassie.eth</Text>
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
