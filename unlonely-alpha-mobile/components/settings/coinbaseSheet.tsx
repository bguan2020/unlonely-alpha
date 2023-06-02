import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Linking } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useHaptics } from '../../utils/haptics';
import { useBottomSheetStore } from '../../utils/store/bottomSheetStore';
import { AnimatedPressable } from '../buttons/animatedPressable';
import { Ionicons } from '@expo/vector-icons';
import { ConnectKitSheet } from './connectkit';

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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = [280, 590];
  const { isCoinbaseSheetOpen, closeCoinbaseSheet, openCKSheet } = useBottomSheetStore(z => ({
    isCoinbaseSheetOpen: z.isCoinbaseSheetOpen,
    closeCoinbaseSheet: z.closeCoinbaseSheet,
    openCKSheet: z.openCKSheet,
  }));
  const [showCoinbaseExplainerView, setShowCoinbaseExplainerView] = useState(false);

  const handleYes = () => {
    setShowCoinbaseExplainerView(true);
    bottomSheetRef.current?.snapToIndex(1);
  };

  const handleNo = () => {
    setShowCoinbaseExplainerView(false);
    closeCoinbaseSheet();
    openCKSheet();
  };

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      closeCoinbaseSheet();
      setShowCoinbaseExplainerView(false);
    }
  }, []);

  useEffect(() => {
    if (isCoinbaseSheetOpen) {
      bottomSheetRef.current?.snapToIndex(0);
      useHaptics('light');
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isCoinbaseSheetOpen]);

  return (
    <>
      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} onChange={handleSheetChanges} {...bottomSheetOptions}>
        {!showCoinbaseExplainerView && (
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
              <Text style={styles.title}>sorry but...</Text>
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: 'white',
                    marginBottom: 8,
                  },
                ]}
              >
                Coinbase Wallet is not supported in the Unlonely mobile app at this time.
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  {
                    marginBottom: 12,
                  },
                ]}
              >
                Please use a different mobile wallet by importing your recovery phrase from Coinbase Wallet into it. We
                recommend using Rainbow.
              </Text>
              <ExplainerItem counter="1" text="tap the button below to download and install Rainbow" />
              <AnimatedPressable
                onPress={() => {
                  Linking.openURL('https://learn.rainbow.me/add-an-existing-eth-wallet');
                }}
                minimal
              >
                <ExplainerItem counter="2" text="import your Coinbase recovery phrase into Rainbow" />
              </AnimatedPressable>
              <ExplainerItem counter="3" text="once that’s done, come back to Unlonely and connect your wallet" />
            </View>
            <View
              style={{
                flexDirection: 'row',
                paddingTop: 16,
              }}
            >
              <AnimatedPressable
                style={[styles.button, styles.buttonPrimary]}
                onPress={() => {
                  Linking.openURL('https://rainbow.me');
                }}
              >
                <Text style={styles.buttonText}>get rainbow</Text>
              </AnimatedPressable>
              <AnimatedPressable
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => {
                  closeCoinbaseSheet();
                  openCKSheet();
                }}
              >
                <Text style={styles.buttonText}>connect wallet</Text>
              </AnimatedPressable>
            </View>
          </View>
        )}
      </BottomSheet>
      <ConnectKitSheet />
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
          backgroundColor: '#e2f979',
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
            color: 'black',
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 48,
    paddingTop: 48,
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
    color: '#e2f979',
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
    backgroundColor: '#be47d1',
  },
  buttonSecondary: {
    backgroundColor: '#333',
  },
});
