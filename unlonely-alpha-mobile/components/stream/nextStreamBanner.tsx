import { parseISO } from 'date-fns';
import { MotiView } from 'moti';
import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTimer } from 'react-timer-hook';
import { countdownText } from '../../utils/countdown';
import { statusBarHeight } from '../../utils/statusbar';
import { UnlonelyTopGradient } from '../nav/topGradient';

export function NextStreamBanner({ hostDate }: { hostDate: string }) {
  const parsedDate = parseISO(hostDate);
  const [isCountdownEnded, setIsCountdownEnded] = useState(false);

  const { seconds, minutes, hours, days } = useTimer({
    expiryTimestamp: parsedDate,
    onExpire: () => setIsCountdownEnded(true),
  });

  return (
    <MotiView
      from={{
        translateY: -40,
      }}
      animate={{
        translateY: isCountdownEnded ? -40 : -8,
      }}
      transition={{
        delay: isCountdownEnded ? 100 : 1000,
        type: 'spring',
        stiffness: 300,
        mass: 1,
        damping: 20,
      }}
      style={[
        styles.container,
        {
          top: statusBarHeight,
        },
      ]}
    >
      <UnlonelyTopGradient />
      <MotiView
        from={{
          opacity: 0,
          scale: 0.9,
        }}
        animate={{
          opacity: isCountdownEnded ? 0 : 1,
          scale: isCountdownEnded ? 0.9 : 1,
        }}
        transition={{
          type: 'timing',
          duration: 150,
          delay: isCountdownEnded ? 0 : 1100,
        }}
      >
        <Text style={styles.countdownText}>live {countdownText(days, hours, minutes, seconds)}</Text>
      </MotiView>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'yellow',
    width: '100%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 5,
  },
  countdownText: {
    fontSize: 16,
    fontFamily: 'NeuePixelSans',
    letterSpacing: 0.5,
  },
});
