import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import IVSPlayer, { IVSPlayerRef } from 'amazon-ivs-react-native-player';
import { useEffect, useRef } from 'react';
import { statusBarHeight } from '../../utils/statusbar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { easeGradient } from 'react-native-easing-gradient';
import { WebView } from 'react-native-webview';

const CHAT_WEBVIEW_URL = 'https://www.unlonely.app/mobile/chat';

const { colors, locations } = easeGradient({
  // Eased gradient function so it doesn’t look like garbage
  colorStops: {
    0: {
      color: 'rgba(0, 0, 0, 1)',
    },
    1: {
      color: 'rgba(0, 0, 0, 0.5)',
    },
  },
});

export default function LiveScreen() {
  const { width } = useWindowDimensions();
  const mediaPlayerRef = useRef<IVSPlayerRef>(null);
  const webViewRef = useRef<WebView>(null);

  const togglePip = () => {
    console.log('toggling pip');
    mediaPlayerRef.current?.togglePip();
  };

  const handlePlay = () => {
    mediaPlayerRef.current?.play();
  };

  const handlePause = () => {
    mediaPlayerRef.current?.pause();
  };

  const catchWebViewNavigationStateChange = (newNavState: any) => {
    const { url } = newNavState;

    if (url !== CHAT_WEBVIEW_URL) {
      webViewRef.current.stopLoading();
      webViewRef.current.reload();
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.videoContainer,
          {
            width: '100%',
            height: Math.round(width * (9 / 16)),
          },
        ]}
      >
        <IVSPlayer
          style={styles.videoPlayer}
          resizeMode={'aspectFit'}
          streamUrl={
            'https://0ef8576db087.us-west-2.playback.live-video.net/api/video/v1/us-west-2.500434899882.channel.8e2oKm7LXNGq.m3u8'
          }
          onLiveLatencyChange={latency => {
            console.log('live latency: ', latency);
          }}
          autoplay={false}
          liveLowLatency={true}
          ref={mediaPlayerRef}
        />
        <View style={styles.videoOverlay}>
          <LinearGradient
            colors={colors}
            locations={locations}
            start={[0, 1]}
            end={[0, 0]}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
            }}
          />
          <MaterialCommunityIcons name="antenna" size={64} color="white" />
          <Text style={styles.videoOverlayText}>loading live stream...</Text>
        </View>
      </View>
      {/* <View style={styles.bar}>
        <Pressable onPress={togglePip}>
          <Text style={styles.pip}>Toggle PiP</Text>
        </Pressable>

        <Pressable onPress={handlePlay}>
          <Text style={styles.pip}>Play</Text>
        </Pressable>

        <Pressable onPress={handlePause}>
          <Text style={styles.pip}>Pause</Text>
        </Pressable>
      </View> */}
      <WebView
        ref={webViewRef}
        source={{ uri: CHAT_WEBVIEW_URL }}
        onNavigationStateChange={catchWebViewNavigationStateChange}
        onContentProcessDidTerminate={webViewRef.current?.reload}
        // reload chat if it crashes?
        // maybe app entitlements needs to request more memory?
        style={{
          paddingBottom: 100,
        }}
      />
      <View
        // this is a hack to make the webview not go under the tab bar
        style={{
          backgroundColor: 'black',
          height: 90,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: statusBarHeight - 2,
  },
  videoContainer: {
    backgroundColor: 'hsl(0, 0%, 2%)',
  },
  videoPlayer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  videoOverlayText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'NeuePixelSans',
    paddingTop: 8,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: 'blue',
    justifyContent: 'center',
  },
  pip: {
    fontSize: 16,
    color: 'white',
    padding: 8,
  },
});
