import BottomSheet from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions, View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { useHaptics } from '../../utils/haptics';
import { useConnectedWalletStore } from '../../utils/store';
import { useUserCredentials } from '../../utils/useUserCredentials';

const CONNECTKIT_WEBVIEW_URL = 'https://www.unlonely.app/mobile/connect-wallet';

export function ConnectKitSheet() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const webViewRef = useRef<WebView>(null);
  const { height, width } = useWindowDimensions();
  const { userCredentials, storeCredentials } = useUserCredentials();
  const { isCKSheetOpen, closeCKSheet } = useConnectedWalletStore(z => ({
    isCKSheetOpen: z.isCKSheetOpen,
    closeCKSheet: z.closeCKSheet,
  }));
  const [webViewKey, setWebViewKey] = useState(0);
  const [showResetButton, setShowResetButton] = useState(false);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      closeCKSheet();
      if (showResetButton) {
        setShowResetButton(false);
        // console.log('[connectkit] reloading webview back to intial page...');
        // don't reload if wallet_disconnected?
        // setWebViewKey(webViewKey + 1); // reloads the webview back to initial page
      }
    }
  }, []);

  useEffect(() => {
    if (isCKSheetOpen) {
      bottomSheetRef.current?.expand();
      useHaptics('light');
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isCKSheetOpen]);

  const handleNavigationStateChange = (newNavState: any) => {
    const { url } = newNavState;

    if (url !== CONNECTKIT_WEBVIEW_URL) {
      console.log('[connectkit] webview is changing url...', url);
      // webViewRef.current.stopLoading();
      // closeCKSheet();
      setShowResetButton(true);
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: isCKSheetOpen ? 100 : 1,
      }}
      pointerEvents={isCKSheetOpen ? 'auto' : 'none'}
    >
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['100%']}
        onChange={handleSheetChanges}
        enablePanDownToClose
        bottomInset={100}
        backgroundStyle={styles.transparentBg}
        detached
        handleIndicatorStyle={styles.grabHandle}
        style={styles.transparentBg}
      >
        <View style={styles.viewWrapper}>
          <WebView
            ref={webViewRef}
            key={webViewKey}
            onNavigationStateChange={handleNavigationStateChange}
            contentMode="mobile"
            overScrollMode="never"
            scalesPageToFit={false}
            setBuiltInZoomControls={false}
            setDisplayZoomControls={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            forceDarkOn
            // @ts-ignore
            zoomScale={1}
            source={{ uri: CONNECTKIT_WEBVIEW_URL }}
            onMessage={event => {
              const { data } = event.nativeEvent;
              // these events will always fire so we need to check
              // against wallet data stored in async storage and zustand
              storeCredentials(data);
              // figure out a way to store this and subscribe to different parts
              // of ui based on what is stored in userCredentials
              // best bet would be to store this data in zustand
              // if ck_modal_closed, don't change any data, etc.
              // if wallet_disconnected, clear storage and wipe user data
              // if address, store address and set isWalletConnected to true
              // and manage the ui based on these states

              console.log(data);

              if (data === 'ck_modal_closed') {
                closeCKSheet();
                // bottomSheetRef.current?.collapse();
              }

              if (data === 'wallet_disconnected') {
                // clear storage
                closeCKSheet();
              }
            }}
            style={styles.webView}
          />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  viewWrapper: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    zIndex: 100,
  },
  webView: {
    height: '100%',
    width: '100.5%',
    left: -1,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  transparentBg: {
    backgroundColor: 'transparent',
  },
  grabHandle: {
    backgroundColor: 'white',
    top: 20,
    opacity: 0,
  },
});
