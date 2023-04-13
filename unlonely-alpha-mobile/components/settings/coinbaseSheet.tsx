import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Linking } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useHaptics } from '../../utils/haptics';
import { useBottomSheetStore } from '../../utils/store/bottomSheetStore';
import { AnimatedPressable } from '../buttons/animatedPressable';
import { Ionicons } from '@expo/vector-icons';
import WebView from 'react-native-webview';

// const COINBASE_WALLET_URL = 'https://go.cb-w.com/dapp?cb_url=https%3A%2F%2Funlonely.app%2Fmobile%2Fcoinbase';
const COINBASE_WALLET_URL = 'https://go.cb-w.com/dapp?cb_url=http%3A%2F%2F192.168.1.165%3A3000%2Fmobile%2Fcoinbase';
// const COINBASE_PASTE_URL = 'https://unlonely.app/mobile/coinbase-paste';
const COINBASE_PASTE_URL = 'http://192.168.1.165:3000/mobile/coinbase-paste';

const bottomSheetOptions = {
  index: -1,
  enablePanDownToClose: true,
  backgroundStyle: {
    backgroundColor: 'hsl(0, 0%, 12%)',
    borderRadius: 32,
  },
  handleStyle: {
    backgroundColor: 'transparent',
  },
  handleIndicatorStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    top: 10,
  },
  style: {
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
};

export const CoinbaseSheet = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ['50%'];
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
    Linking.openURL(COINBASE_WALLET_URL);
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

  return (
    <>
      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} onChange={handleSheetChanges} {...bottomSheetOptions}>
        {showCoinbasePasteView ? (
          <View
            style={{
              flex: 1,
              padding: 20,
            }}
          >
            <WebView
              source={{
                uri: COINBASE_PASTE_URL,
              }}
              contentMode="mobile"
              overScrollMode="never"
              scalesPageToFit={false}
              setBuiltInZoomControls={false}
              setDisplayZoomControls={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              geolocationEnabled={true}
              // @ts-ignore
              zoomScale={1}
              style={{
                borderRadius: 32,
                height: 160,
              }}
            />
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
      </BottomSheet>
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
