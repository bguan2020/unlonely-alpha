import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { StyleSheet, Text, View } from 'react-native';
import { fadeInScale } from '../../../utils/animations';
import { AnimatedPressable } from '../../buttons/animatedPressable';
import { UnlonelyTopGradient } from '../../nav/topGradient';

export function StreamPlaybackOverlay({
  play,
  pause,
  playing,
  latency,
}: {
  play: () => void;
  pause: () => void;
  playing: boolean;
  latency: number;
}) {
  const latencySeconds = latency / 1000;
  const formattedLatency = latencySeconds.toFixed(1);
  return (
    <>
      <MotiView style={styles.center} {...fadeInScale}>
        {!playing && (
          <AnimatedPressable onPress={play}>
            <Ionicons name="md-play" size={64} color="white" />
          </AnimatedPressable>
        )}
        {playing && (
          <AnimatedPressable onPress={pause}>
            <Ionicons name="md-pause" size={64} color="white" />
          </AnimatedPressable>
        )}
      </MotiView>
      {playing && (
        <View style={styles.latencyView} pointerEvents="none">
          <Text style={styles.videoOverlayText}>stream delay: {formattedLatency}s</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOverlayText: {
    color: '#666',
    fontSize: 14,
    letterSpacing: 0.5,
    fontFamily: 'NeuePixelSans',
    paddingTop: 12,
    position: 'absolute',
    bottom: 10,
  },
  latencyView: {
    position: 'absolute',
    backgroundColor: 'red',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
});
