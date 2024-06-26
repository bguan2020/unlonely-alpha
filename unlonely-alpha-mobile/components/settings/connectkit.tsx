import BottomSheet from '@gorhom/bottom-sheet';
import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { useUser } from '../../api/queries/useUser';
import { useHaptics } from '../../utils/haptics';
import { useBottomSheetStore } from '../../utils/store/bottomSheetStore';
import { useUserStore } from '../../utils/store/userStore';

const CONNECTKIT_WEBVIEW_URL = 'https://www.unlonely.app/mobile/connect-wallet';
// const CONNECTKIT_WEBVIEW_URL = 'http://192.168.1.165:3000/mobile/connect-wallet';

export const ConnectKitSheet = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const webViewRef = useRef<WebView>(null);
  const [webViewKey, setWebViewKey] = useState(0);
  const [resetToInitialCKPage, setResetToInitialCKPage] = useState(false);

  // store
  const { isSettingsSheetOpen, isCKSheetOpen, closeCKSheet } = useBottomSheetStore();
  const {
    _hasHydrated,
    connectedWallet,
    setConnectedWallet,
    clearConnectedWallet,
    setUser,
    clearUser,
    setUserDataLoading,
  } = useUserStore(z => ({
    _hasHydrated: z._hasHydrated,
    connectedWallet: z.connectedWallet,
    setConnectedWallet: z.setConnectedWallet,
    clearConnectedWallet: z.clearConnectedWallet,
    setUser: z.setUser,
    clearUser: z.clearUser,
    setUserDataLoading: z.setUserDataLoading,
  }));
  const hydratedWalletAddress = _hasHydrated && connectedWallet ? connectedWallet.address : 'user';

  // query
  const { data: apiUser, run: getUserData } = useUser(hydratedWalletAddress, { address: hydratedWalletAddress });

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      closeCKSheet();

      if (resetToInitialCKPage) {
        setResetToInitialCKPage(false);
        console.log('[connectkit] reloading webview back to intial page...');
        setWebViewKey(webViewKey + 1); // reloads the webview back to initial page
      }
    }
  };

  const handleNavigationStateChange = (newNavState: any) => {
    const { url } = newNavState;

    if (url !== CONNECTKIT_WEBVIEW_URL) {
      setResetToInitialCKPage(true);
      console.log('[connectkit] webview is changing url...', url);
      webViewRef.current.stopLoading();
    }
  };

  const handleWebConnectKitConnection = async (event: any) => {
    const { data } = event.nativeEvent;

    if (data === 'ck_modal_closed') {
      console.log('[connectkit] modal closed ⬇️');
      closeCKSheet();
      return;
    }

    if (data === 'wallet_disconnected') {
      console.log('[connectkit] wallet disconnected 🗑️');
      clearUser();
      clearConnectedWallet();
      return;
    }

    if (data === 'wallet_connected') {
      console.log('[connectkit] wallet connected ✅');
      if (!connectedWallet) {
        setUserDataLoading(true);
      }
    }

    if (data.includes('address')) {
      const walletData = JSON.parse(data);
      const sameAddress = connectedWallet?.address === walletData.address;
      const sameName = connectedWallet?.ensName === walletData.ensName;
      const sameAvatar = connectedWallet?.ensAvatar === walletData.ensAvatar;

      if (sameAddress && sameName && sameAvatar) {
        setUserDataLoading(false);
        return;
      }
      console.log('[connectkit] saving connected wallet data...');
      setConnectedWallet(walletData);
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

  useEffect(() => {
    if (isCKSheetOpen && apiUser?.getUser) {
      console.log('[ck] saving userData to zustand...');
      setUser(apiUser.getUser);
    }
  }, [apiUser]);

  useEffect(() => {
    if (connectedWallet !== null) {
      getUserData();
      setUserDataLoading(true);
    }
  }, [connectedWallet]);

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
        {isSettingsSheetOpen && (
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
              // @ts-ignore
              zoomScale={1}
              source={{ uri: CONNECTKIT_WEBVIEW_URL }}
              onMessage={handleWebConnectKitConnection}
              style={styles.webView}
            />
          </View>
        )}
      </BottomSheet>
    </View>
  );
};

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
