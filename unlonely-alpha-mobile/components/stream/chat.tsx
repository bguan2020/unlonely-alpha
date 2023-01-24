import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { easeGradient } from 'react-native-easing-gradient';
import { WebView } from 'react-native-webview';
import { useUserStore } from '../../utils/store/userStore';
import { AnimatedPressable } from '../buttons/animatedPressable';
import { useLink } from 'expo-router';
import { useBottomSheetStore } from '../../utils/store/bottomSheetStore';

const CHAT_WEBVIEW_URL = 'https://www.unlonely.app/mobile/chat';

export function Chat() {
  const router = useLink();
  const webViewRef = useRef<WebView>(null);
  const [chatKey, setChatKey] = useState(0);
  const userData = useUserStore(z => z.userData);
  const { openSettingsSheet, openCKSheet } = useBottomSheetStore(z => ({
    openSettingsSheet: z.openSettingsSheet,
    openCKSheet: z.openCKSheet,
  }));
  const [chatEnabled, setChatEnabled] = useState(false);

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

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}
    >
      <WebView
        key={chatKey}
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
      {!chatEnabled && (
        <MotiView style={styles.overlay}>
          <View
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
            }}
          ></View>
          <LinearGradient
            colors={colors}
            locations={locations}
            start={[0, 1]}
            end={[0, 0]}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              bottom: 0,
            }}
          />

          <View
            style={{
              paddingVertical: 48,
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
  );
}

const { colors, locations } = easeGradient({
  // Eased gradient function so it doesn’t look like garbage
  colorStops: {
    0: {
      color: '#000',
    },
    1: {
      color: 'transparent',
    },
  },
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 16,
    fontFamily: 'NeuePixelSans',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#e2f979',
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
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
});
