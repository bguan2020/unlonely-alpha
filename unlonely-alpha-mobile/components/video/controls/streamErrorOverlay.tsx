import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { MotiView } from 'moti';
import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { fadeInScale } from '../../../utils/animations';
import { AnimatedPressable } from '../../buttons/animatedPressable';

const bottomSheetOptions = {
  index: -1,
  enablePanDownToClose: true,
  backgroundStyle: {
    backgroundColor: '#111',
  },
  handleStyle: {
    backgroundColor: 'transparent',
  },
  handleIndicatorStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  style: {
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
};

export function StreamErrorOverlay({ error, retry }) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <>
      <MotiView style={styles.center} {...fadeInScale}>
        <MaterialCommunityIcons name="sleep" size={48} color="#999" />
        <Text style={styles.videoOverlayText}>stream is offline</Text>
        <View
          style={{
            flexDirection: 'row',
            paddingTop: 24,
          }}
        >
          <AnimatedPressable style={[styles.button, styles.buttonPrimary]} onPress={retry}>
            <Text style={styles.buttonText}>reload</Text>
          </AnimatedPressable>
          <AnimatedPressable onPress={() => bottomSheetRef.current?.expand()} style={styles.button}>
            <Text style={styles.buttonText}>show info</Text>
          </AnimatedPressable>
        </View>
      </MotiView>
      <BottomSheet ref={bottomSheetRef} snapPoints={['75%']} {...bottomSheetOptions}>
        <ScrollView style={styles.bottomSheetBackground}>
          <Text style={styles.errorText}>{error.toString()}</Text>
        </ScrollView>
        <View
          style={{
            paddingBottom: 8,
          }}
        >
          <AnimatedPressable onPress={() => bottomSheetRef.current?.close()} style={styles.button}>
            <Text style={styles.buttonText}>close</Text>
          </AnimatedPressable>
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOverlayText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'NeuePixelSans',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingTop: 12,
  },
  bottomSheetBackground: {
    backgroundColor: '#111',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  errorText: {
    color: 'white',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontFamily: 'NeuePixelSans',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  buttonPrimary: {
    backgroundColor: '#be47d1',
  },
});
