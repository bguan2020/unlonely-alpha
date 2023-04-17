import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Linking } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import BottomSheet from '@gorhom/bottom-sheet';
import { useHaptics } from '../../utils/haptics';
import { useBottomSheetStore } from '../../utils/store/bottomSheetStore';
import { AnimatedPressable } from '../buttons/animatedPressable';
import { Ionicons } from '@expo/vector-icons';
import { ConnectKitSheet } from './connectkit';

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
  const snapPoints = [360];
  const { isCoinbaseSheetOpen, closeCoinbaseSheet, openCKSheet } = useBottomSheetStore(z => ({
    isCoinbaseSheetOpen: z.isCoinbaseSheetOpen,
    closeCoinbaseSheet: z.closeCoinbaseSheet,
    openCKSheet: z.openCKSheet,
  }));
  const [showCoinbasePasteView, setShowCoinbasePasteView] = useState(false);

  const handleYes = () => {
    // open coinbase-paste webview
    setShowCoinbasePasteView(true);
    // redirect to url
    // Linking.openURL(COINBASE_WALLET_URL);
  };

  const handleNo = () => {
    closeCoinbaseSheet();
    openCKSheet();
  };

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      closeCoinbaseSheet();
      setShowCoinbasePasteView(false);
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
      // console.log(content);
      childRef.current.handleCoinbaseConnection(content);
    });

    // todo: make a button in coinbase page that signs a message with wagmi first before you can copy the session
    // 1. grab clipboard
    // 2. send to ConnectKitSheet
    // 3. show loading spinner in coinbase sheet
    // 4. send with postMessage to webview with CK
    // or maybe just do `injectJavaScript` which grabs the clipboard and loops through it to turn it into localStorage
    // 5. refresh CK webview to register new session with coinbase in the background
    // 6. close coinbase sheet
    // 7. show user data in settings
  };

  return (
    <>
      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} onChange={handleSheetChanges} {...bottomSheetOptions}>
        {!showCoinbasePasteView ? (
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
        ) : (
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
              {/* <Text style={styles.title}>coinbase wallet</Text> */}
              <Text style={styles.title}>coinbase wallet is currently unsupported</Text>
              <Text style={styles.subtitle}>please use another wallet</Text>
            </View>
            {/* <View
              style={{
                flexDirection: 'row',
                paddingTop: 16,
              }}
            >
              <AnimatedPressable style={[styles.button, styles.buttonPrimary]} onPress={handlePaste}>
                <Text style={styles.buttonText}>paste session</Text>
              </AnimatedPressable>
            </View> */}
          </View>
        )}
      </BottomSheet>
      <ConnectKitSheet ref={childRef} />
    </>
  );
};

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
