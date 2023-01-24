import { differenceInHours, format, parseISO } from 'date-fns';
import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTimer } from 'react-timer-hook';
import { countdownText } from '../../utils/countdown';

type TimeInfoProps = {
  hostDate: string;
};

export const TimeInfo = ({ hostDate }: TimeInfoProps) => {
  const parsedDate = parseISO(hostDate);
  const formattedDate = format(parsedDate, 'EEEE, MMM dd h:mm a');
  const [isCountdownEnded, setIsCountdownEnded] = useState(false);
  const decayedHours = differenceInHours(new Date(), parsedDate) > 2;
  const isLive = isCountdownEnded && !decayedHours;

  const { seconds, minutes, hours, days } = useTimer({
    expiryTimestamp: parsedDate,
    onExpire: () => setIsCountdownEnded(true),
  });

  return (
    <View style={styles.timeInfo}>
      <View style={styles.timeAbsolute}>
        <Text style={styles.timeAbsoluteText}>{formattedDate}</Text>
      </View>
      {!isCountdownEnded && (
        <View style={styles.timeRelative}>
          <Text style={styles.timeRelativeText}>{countdownText(days, hours, minutes, seconds)}</Text>
        </View>
      )}
      {isLive && <Text style={styles.liveNowText}>LIVE NOW</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  timeRelative: {},
  timeRelativeText: {
    color: '#fff',
    fontVariant: ['tabular-nums'],
    fontFamily: 'NeuePixelSans',
    letterSpacing: 0.5,
    textAlign: 'right',
  },
  liveNowText: {
    textTransform: 'uppercase',
    color: '#e2f979',
    fontFamily: 'NeuePixelSans',
    textAlign: 'right',
    letterSpacing: 0.5,
  },
  timeAbsolute: {},
  timeAbsoluteText: {
    color: '#666',
    fontFamily: 'NeuePixelSans',
    letterSpacing: 0.5,
  },
});
