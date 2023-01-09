import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useUpcomingSchedule } from '../../api/queries/useUpcomingSchedule';
import { ScheduleCard } from '../../components/schedule/scheduleCard';

export default function ScheduleScreen() {
  const { status, data, error, isFetching } = useUpcomingSchedule({
    limit: 9,
  });
  const schedule = data?.getHostEventFeed;

  console.log(schedule);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Upcoming Streams</Text>
        <ScheduleCard />
        <ScheduleCard />
        <Text style={[styles.title, styles.subtitle]}>Previous Streams</Text>
        <ScheduleCard />
        <ScheduleCard />
        <ScheduleCard />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  main: {
    width: '100%',
    paddingHorizontal: 8,
    paddingTop: 76,
    paddingBottom: 100,
  },
  title: {
    fontSize: 16,
    fontFamily: 'NeuePixelSans',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#e2f979',
    textAlign: 'left',
    paddingHorizontal: 16,
  },
  subtitle: {
    color: '#666',
  },
});
