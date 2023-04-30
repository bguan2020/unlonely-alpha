import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Linking } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import BottomSheet from '@gorhom/bottom-sheet';
import { useHaptics } from '../../utils/haptics';
import { useBottomSheetStore } from '../../utils/store/bottomSheetStore';
import { AnimatedPressable } from '../buttons/animatedPressable';
import { Ionicons } from '@expo/vector-icons';
import { ConnectKitSheet } from './connectkit';
import { useUserStore } from '../../utils/store/userStore';

const COINBASE_WALLET_URL = 'https://go.cb-w.com/dapp?cb_url=https%3A%2F%2Funlonely.app%2Fmobile%2Fcoinbase';
// const COINBASE_WALLET_URL = 'https://go.cb-w.com/dapp?cb_url=http%3A%2F%2F192.168.1.165%3A3000%2Fmobile%2Fcoinbase';
const COINBASE_PASTE_URL = 'https://unlonely.app/mobile/coinbase-paste';
// const COINBASE_PASTE_URL = 'http://192.168.1.165:3000/mobile/coinbase-paste';

const bottomSheetOptions = {
  index: -1,
  enablePanDownToClose: true,
  backgroundStyle: {
    backgroundColor: 'transparent',
  },
  handleStyle: {
    backgroundColor: 'transparent',
  },
  handleIndicatorStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    top: 26,
  },
  style: {
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
};

export const CoinbaseSheet = () => {
  const childRef = useRef(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = [500];
  const { setCoinbaseSession, coinbaseSession, connectedWallet, clearConnectedWallet, clearUser } = useUserStore(z => ({
    coinbaseSession: z.coinbaseSession,
    setCoinbaseSession: z.setCoinbaseSession,
    connectedWallet: z.connectedWallet,
    clearConnectedWallet: z.clearConnectedWallet,
    clearUser: z.clearUser,
  }));
  const { isCoinbaseSheetOpen, closeCoinbaseSheet, openCKSheet } = useBottomSheetStore(z => ({
    isCoinbaseSheetOpen: z.isCoinbaseSheetOpen,
    closeCoinbaseSheet: z.closeCoinbaseSheet,
    openCKSheet: z.openCKSheet,
  }));
  const [showCoinbasePasteView, setShowCoinbasePasteView] = useState(false);
  const [showCoinbaseExplainerView, setShowCoinbaseExplainerView] = useState(false);

  const handleYes = () => {
    if (connectedWallet?.address && coinbaseSession) {
      setCoinbaseSession(null);
      clearConnectedWallet();
      clearUser();
      closeCoinbaseSheet();
    } else {
      setShowCoinbaseExplainerView(true);
    }
  };

  const handleNo = () => {
    setShowCoinbasePasteView(false);
    setShowCoinbaseExplainerView(false);
    closeCoinbaseSheet();
    openCKSheet();
  };

  const handleOpenCoinbaseApp = () => {
    // open coinbase-paste webview
    setShowCoinbasePasteView(true);
    // redirect to url
    Linking.openURL(COINBASE_WALLET_URL);
  };

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      closeCoinbaseSheet();
      setShowCoinbasePasteView(false);
      setShowCoinbaseExplainerView(false);
    }
  }, []);

  useEffect(() => {
    if (isCoinbaseSheetOpen) {
      bottomSheetRef.current?.expand();
      useHaptics('light');
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isCoinbaseSheetOpen]);

  const handlePaste = () => {
    Clipboard.getString().then(content => {
      if (content.includes('coinbase')) {
        childRef.current.handleCoinbaseConnection(content);
        // closeCoinbaseSheet();
      } else {
        alert('invalid session. make sure the coinbase session is in your clipboard and try pasting it again.');
      }
    });
  };

  return (
    <>
      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} onChange={handleSheetChanges} {...bottomSheetOptions}>
        {!showCoinbaseExplainerView && !showCoinbasePasteView && (
          <View style={[styles.main, styles.sheetWrapper]}>
            <View
              style={{
                position: 'absolute',
                right: 4,
                top: 4,
                zIndex: 9,
              }}
            >
              <AnimatedPressable
                style={{
                  width: 44,
                  height: 44,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => bottomSheetRef.current?.close()}
              >
                <Ionicons name="close-circle" size={24} color="#333" />
              </AnimatedPressable>
            </View>
            <View>
              <Text style={styles.title}>are you using coinbase wallet?</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                paddingTop: 16,
              }}
            >
              <AnimatedPressable style={[styles.button, styles.buttonPrimary]} onPress={handleYes}>
                <Text style={styles.buttonText}>yes</Text>
              </AnimatedPressable>
              <AnimatedPressable style={styles.button} onPress={handleNo}>
                <Text style={styles.buttonText}>no</Text>
              </AnimatedPressable>
            </View>
          </View>
        )}
        {showCoinbaseExplainerView && (
          <View style={[styles.main, styles.sheetWrapper]}>
            <View
              style={{
                position: 'absolute',
                right: 4,
                top: 4,
                zIndex: 9,
              }}
            >
              <AnimatedPressable
                style={{
                  width: 44,
                  height: 44,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => bottomSheetRef.current?.close()}
              >
                <Ionicons name="close-circle" size={24} color="#333" />
              </AnimatedPressable>
            </View>
            <View>
              <Text style={styles.title}>coinbase wallet instructions</Text>
              <ExplainerItem counter="1" text="tap the button below to open the coinbase wallet app" />
              <ExplainerItem counter="2" text="connect your wallet inside coinbase" />
              <ExplainerItem counter="3" text="sign a transaction" />
              <ExplainerItem counter="4" text="copy your session from coinbase wallet" />
              <ExplainerItem counter="5" text="go back to unlonely and tap the paste button to connect" />
            </View>
            <View
              style={{
                flexDirection: 'row',
                paddingTop: 16,
              }}
            >
              {showCoinbasePasteView ? (
                <AnimatedPressable style={[styles.button, styles.buttonPrimary]} onPress={handlePaste}>
                  <Text style={styles.buttonText}>paste</Text>
                </AnimatedPressable>
              ) : (
                <AnimatedPressable style={[styles.button, styles.buttonPrimary]} onPress={handleOpenCoinbaseApp}>
                  <Text style={styles.buttonText}>open coinbase wallet</Text>
                </AnimatedPressable>
              )}
            </View>
          </View>
        )}
      </BottomSheet>
      <ConnectKitSheet ref={childRef} />
    </>
  );
};

function ExplainerItem({ counter, text }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        maxWidth: 320,
        paddingVertical: 8,
      }}
    >
      <View
        style={{
          backgroundColor: '#2151f5',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: 24,
          height: 24,
          borderRadius: 100,
        }}
      >
        <Text
          style={{
            color: 'white',
          }}
        >
          {counter}
        </Text>
      </View>
      <View
        style={{
          paddingLeft: 12,
        }}
      >
        <Text style={styles.explainerText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  main: {
    width: '100%',
    backgroundColor: 'hsl(0, 0%, 12%)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 48,
    paddingTop: 0,
  },
  title: {
    fontSize: 18,
    fontFamily: 'NeuePixelSans',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#fff',
    textAlign: 'center',
    paddingBottom: 4,
  },
  subtitle: {
    color: '#666',
    fontFamily: 'NeuePixelSans',
    fontSize: 16,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 8,
  },
  explainerText: {
    color: '#999',
    fontFamily: 'NeuePixelSans',
    fontSize: 16,
    letterSpacing: 0.5,
    textAlign: 'left',
  },
  button: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginHorizontal: 8,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontFamily: 'NeuePixelSans',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  buttonPrimary: {
    backgroundColor: '#2151f5',
  },
});
