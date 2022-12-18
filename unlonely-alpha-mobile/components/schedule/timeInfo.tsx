import { differenceInHours, format, parseISO } from 'date-fns';
import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTimer } from 'react-timer-hook';

type TimeInfoProps = {
  hostDate: string;
};

const ComputedTimeString = ({ days, hours, minutes, seconds }) => {
  let string;

  if (seconds > 0) {
    string = `in ${seconds}s`;
  }

  if (minutes > 0) {
    string = `in ${minutes}m ${seconds}s`;
  }

  if (hours > 0) {
    string = `in ${hours}h ${minutes}m ${seconds}s`;
  }

  if (days > 0) {
    string = `in ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  return <Text style={styles.timeRelativeText}>{string}</Text>;
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
          <ComputedTimeString days={days} hours={hours} minutes={minutes} seconds={seconds} />
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
