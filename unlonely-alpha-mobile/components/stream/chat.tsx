import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { easeGradient } from 'react-native-easing-gradient';
import { WebView } from 'react-native-webview';
import { useUserStore } from '../../utils/store/userStore';
import { AnimatedPressable } from '../buttons/animatedPressable';
import { useRouter } from 'expo-router';
import { useBottomSheetStore } from '../../utils/store/bottomSheetStore';
import { UnlonelyTopGradient } from '../nav/topGradient';

const CHAT_WEBVIEW_URL = 'https://www.unlonely.app/mobile/chat';
// const CHAT_WEBVIEW_URL = 'http://192.168.1.69:3000/mobile/chat';

export function Chat() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [chatKey, setChatKey] = useState(0);
  const userData = useUserStore(z => z.userData);
  const { openSettingsSheet, openCKSheet } = useBottomSheetStore(z => ({
    openSettingsSheet: z.openSettingsSheet,
    openCKSheet: z.openCKSheet,
  }));
  const [chatEnabled, setChatEnabled] = useState(false);
  const [finishedLoading, setFinishedLoading] = useState(false);

  const catchWebViewNavigationStateChange = (newNavState: any) => {
    const { url } = newNavState;

    if (url !== CHAT_WEBVIEW_URL) {
      webViewRef.current.stopLoading();
      webViewRef.current.reload();
    }
  };

  const reloadChat = () => {
    setChatKey(chatKey + 1);
    setChatEnabled(true);
  };

  const handleConnection = () => {
    if (userData?.address) {
      reloadChat();
    } else {
      router.push('/');
      openSettingsSheet();
      setTimeout(() => {
        openCKSheet();
      }, 1000);
    }
  };

  useEffect(() => {
    if (userData?.address) {
      // reload webview if userData changes so it has correct headers
      // happens when user goes to chat tab first then connects wallet
      reloadChat();
    } else {
      setChatEnabled(false);
    }
  }, [userData]);

  const handlePresence = async (event: any) => {
    const { data } = event.nativeEvent;

    // console.log(data);
  };

  return (
    <>
      {/* <View
        style={{
          position: 'relative',
          height: 32,
          width: '100%',
          backgroundColor: '#222',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: 'white',
          }}
        >
          chat top controls
        </Text>
      </View> */}
      <View
        style={{
          flex: 1,
          backgroundColor: 'black',
        }}
      >
        <UnlonelyTopGradient />
        <LinearGradient
          colors={colors}
          locations={locations}
          start={[0, 1]}
          end={[0, 0]}
          style={{
            width: '100%',
            height: 80,
            position: 'absolute',
            bottom: -5,
          }}
          pointerEvents="none"
        />
        {!finishedLoading && (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              width: '100%',
              height: '100%',
            }}
          >
            <ActivityIndicator size="large" color="black" />
            <Text style={styles.loadingText}>loading chat...</Text>
          </View>
        )}

        <WebView
          key={chatKey}
          ref={webViewRef}
          source={{ uri: CHAT_WEBVIEW_URL }}
          onNavigationStateChange={catchWebViewNavigationStateChange}
          onContentProcessDidTerminate={webViewRef.current?.reload}
          // reload chat if it crashes?
          // maybe app entitlements needs to request more memory?
          style={{
            // paddingBottom: 100,
            backgroundColor: 'transparent',
          }}
          contentMode="mobile"
          overScrollMode="never"
          scalesPageToFit={false}
          setBuiltInZoomControls={false}
          setDisplayZoomControls={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onLoadStart={() => {
            setFinishedLoading(false);
          }}
          onLoadEnd={() => {
            setFinishedLoading(true);
          }}
          // scrollEnabled={false}
          // @ts-ignore
          zoomScale={1}
          onMessage={handlePresence}
        />
        {!chatEnabled && (
          <MotiView style={styles.overlay}>
            <View
              style={{
                width: '100%',
                height: 80,
                position: 'absolute',
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.25)',
              }}
            ></View>
            <LinearGradient
              colors={colors}
              locations={locations}
              start={[0, 1]}
              end={[0, 0]}
              style={{
                width: '100%',
                height: 220,
                position: 'absolute',
                bottom: 0,
              }}
              pointerEvents="none"
            />

            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={styles.overlayText}>connect your wallet to chat</Text>

              <AnimatedPressable onPress={handleConnection} style={styles.button}>
                <Text style={styles.buttonText}>connect</Text>
              </AnimatedPressable>
            </View>
          </MotiView>
        )}
      </View>
    </>
  );
}

const { colors, locations } = easeGradient({
  // Eased gradient function so it doesn’t look like garbage
  colorStops: {
    0: {
      color: 'rgba(0,0,0,1)',
    },
    1: {
      color: 'rgba(0,0,0,0)',
    },
  },
});

const styles = StyleSheet.create({
  overlay: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  overlayText: {
    fontSize: 16,
    fontFamily: 'NeuePixelSans',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#e2f979',
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  button: {
    backgroundColor: '#be47d1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontFamily: 'NeuePixelSans',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'NeuePixelSans',
    letterSpacing: 0.5,
    color: 'black',
  },
});
