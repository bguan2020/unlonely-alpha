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
      {!playing && (
        <View style={styles.latencyView} pointerEvents="none">
          <Text style={styles.videoOverlayLiveText}>LIVE NOW</Text>
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
    color: '#999',
    fontSize: 14,
    letterSpacing: 0.5,
    fontFamily: 'NeuePixelSans',
    paddingTop: 12,
    position: 'absolute',
    bottom: 40,
  },
  videoOverlayLiveText: {
    color: '#e6f88a',
    fontSize: 14,
    letterSpacing: 1,
    fontFamily: 'NeuePixelSans',
    paddingTop: 12,
    position: 'absolute',
    bottom: 40,
  },
  latencyView: {
    position: 'absolute',
    backgroundColor: 'red',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
});
