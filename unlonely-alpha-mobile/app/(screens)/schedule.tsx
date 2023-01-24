import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useUpcomingSchedule } from '../../api/queries/useUpcomingSchedule';
import { ScheduleCard } from '../../components/schedule/scheduleCard';

export default function ScheduleScreen() {
  // const { status, data, error, isFetching } = useUpcomingSchedule({
  //   limit: 9,
  // });
  // const schedule = data?.getHostEventFeed;

  // console.log(schedule);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Upcoming Streams</Text>
        <View style={styles.empty}>
          <Text style={[styles.title, styles.subtitle]}>nothing planned</Text>
        </View>
        {/* <ScheduleCard />
        <ScheduleCard /> */}
        <Text style={[styles.title, styles.subtitle]}>Previous Streams</Text>
        <View style={styles.empty}>
          <Text style={[styles.title, styles.subtitle]}>none</Text>
        </View>
        {/* <ScheduleCard />
        <ScheduleCard />
        <ScheduleCard /> */}
      </View>
      {/* <View style={[styles.main, styles.center]}>
        <Text style={[styles.title, styles.subtitle]}>no upcoming streams</Text>
      </View> */}
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
  center: {
    flex: 1,
    height: 800,
    justifyContent: 'center',
    alignItems: 'center',
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
  empty: {
    paddingVertical: 8,
    marginVertical: 8,
    marginBottom: 32,
    backgroundColor: '#111',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
