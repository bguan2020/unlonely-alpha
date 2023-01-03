import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Linking, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MenuView } from '@react-native-menu/menu';
import Clipboard from '@react-native-clipboard/clipboard';

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
      // setShouldPlay(true);
      // TODO: uncomment play stuff before release
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
        // whole view for video and other elements that's on top of the blur
      >
        <NfcVideo item={props.item} videoRef={ref} height={props.height} play={shouldPlay} />

        <View
          // shit under the video
          style={{
            // backgroundColor: 'rgba(255,255,0,0.25)',
            flex: 1,
            position: 'absolute',
            left: 0,
            bottom: 0,
            height: props.height / 2.7,
            width: '100%',
          }}
        >
          <View
            style={{
              // backgroundColor: 'rgba(255,0,0,0.25)',
              height: 64,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <MenuView
              onPressAction={({ nativeEvent }) => {
                if (nativeEvent.event === 'opensea') {
                  Linking.openURL(props.item.openseaLink);
                }
                if (nativeEvent.event === 'copy-link') {
                  Clipboard.setString(`https://www.unlonely.app/nfc/${props.item.id}`);
                }
                if (nativeEvent.event === 'share') {
                  Share.share({
                    message: `https://www.unlonely.app/nfc/${props.item.id}`,
                  });
                }
              }}
              actions={[
                {
                  id: 'opensea',
                  title: 'view on OpenSea',
                  image: Platform.select({
                    ios: 'globe',
                    android: 'language',
                  }),
                },
                {
                  id: 'copy-link',
                  title: 'copy NFC link',
                  image: Platform.select({
                    ios: 'link',
                    android: 'link',
                  }),
                },
                {
                  id: 'share',
                  title: 'share',
                  image: Platform.select({
                    ios: 'square.and.arrow.up',
                    android: 'share',
                  }),
                },
              ]}
              style={{
                // backgroundColor: 'blue',
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View>
                <MaterialCommunityIcons name="dots-horizontal" size={32} color="rgba(255,255,255,0.75)" />
              </View>
            </MenuView>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={styles.likedCount}>1,234</Text>
              <Pressable
                style={{
                  // backgroundColor: 'rgba(255,255,0,0.25)',
                  width: 48,
                  height: 48,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="md-heart-outline" size={32} color="rgba(255,255,255,0.75)" />
              </Pressable>
            </View>
          </View>
          <View
            style={{
              // backgroundColor: 'rgba(0,255,0,0.25)',
              flex: 1,
              justifyContent: 'flex-end',
              paddingBottom: 100, // get tab bar height here
            }}
          >
            {/* nfc title and shit wrapper */}
            <View
              style={{
                // backgroundColor: 'rgba(0,255,255,0.25)',
                flex: 1,
                justifyContent: 'flex-end',
                paddingHorizontal: 16,
              }}
            >
              {/* nfc title */}
              {/* owned by ENS */}
              <Text style={styles.title}>{props.item.title}</Text>
              <Text style={styles.subtitle}>owned by {props.item.owner.username}</Text>
            </View>
          </View>
        </View>
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
  title: {
    fontSize: 28,
    lineHeight: 32,
    color: 'white',
    fontFamily: 'NeuePixelSans',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.75)',
    paddingVertical: 16,
    fontFamily: 'NeuePixelSans',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  likedCount: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.75)',
    paddingVertical: 16,
    fontFamily: 'NeuePixelSans',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    marginRight: 8,
  },
});
