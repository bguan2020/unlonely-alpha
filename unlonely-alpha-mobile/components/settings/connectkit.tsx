import BottomSheet from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { useHaptics } from '../../utils/haptics';
import { useConnectedWalletStore } from '../../utils/store';

const CONNECTKIT_WEBVIEW_URL = 'https://www.unlonely.app/mobile/connect-wallet';

export function ConnectKitSheet() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const webViewRef = useRef<WebView>(null);
  const { isCKSheetOpen, closeCKSheet, clearConnectedWallet, setConnectedWallet, connectedWallet, _hasHydrated } =
    useConnectedWalletStore(z => ({
      isCKSheetOpen: z.isCKSheetOpen,
      closeCKSheet: z.closeCKSheet,
      clearConnectedWallet: z.clearConnectedWallet,
      setConnectedWallet: z.setConnectedWallet,
      connectedWallet: z.connectedWallet,
      _hasHydrated: z._hasHydrated,
    }));
  const [webViewKey, setWebViewKey] = useState(0);
  const [showResetButton, setShowResetButton] = useState(false);

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      closeCKSheet();

      if (showResetButton) {
        setShowResetButton(false);
        console.log('[connectkit] reloading webview back to intial page...');
        setWebViewKey(webViewKey + 1); // reloads the webview back to initial page
      }
    }
  };

  const handleNavigationStateChange = (newNavState: any) => {
    const { url } = newNavState;

    if (url !== CONNECTKIT_WEBVIEW_URL) {
      setShowResetButton(true);
      console.log('[connectkit] webview is changing url...', url);
      webViewRef.current.stopLoading();
    }
  };

  const handleWebConnectKitConnection = (event: any) => {
    const { data } = event.nativeEvent;

    if (data === 'ck_modal_closed') {
      closeCKSheet();
      return;
    }

    if (data === 'wallet_disconnected') {
      closeCKSheet();
      clearConnectedWallet();
      return;
    }

    if (data === 'wallet_connected') {
      // loading wallet info...
      closeCKSheet();
    }

    if (data.includes('address')) {
      const walletData = JSON.parse(data);
      const sameAddress = connectedWallet?.address === walletData.address;
      const sameName = connectedWallet?.ensName === walletData.ensName;
      const sameAvatar = connectedWallet?.ensAvatar === walletData.ensAvatar;

      if (sameAddress && sameName && sameAvatar) return;
      console.log('[connectkit] walletData', walletData);
      setConnectedWallet(walletData);
      // figure out a way to fix the flash when ensName and ensAvatar come back
      // as null from the webview. maybe delay the postMessage until the data is ready?
    }
  };

  useEffect(() => {
    if (isCKSheetOpen) {
      bottomSheetRef.current?.expand();
      useHaptics('light');
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isCKSheetOpen]);

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
        style={[
          styles.transparentBg,
          {
            shadowColor: 'black',
            shadowOffset: {
              width: 0,
              height: 10,
            },
            shadowOpacity: 1,
            shadowRadius: 20,
          },
        ]}
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
            onMessage={handleWebConnectKitConnection}
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
