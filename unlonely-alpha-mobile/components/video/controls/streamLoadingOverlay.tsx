import { MotiView } from 'moti';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { fadeInScale } from '../../../utils/animations';

export function StreamLoadingOverlay() {
  return (
    <MotiView style={styles.center} {...fadeInScale}>
      <ActivityIndicator size="large" color="white" />
      <Text style={styles.videoOverlayText}>loading live stream...</Text>
    </MotiView>
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
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingTop: 12,
  },
});
