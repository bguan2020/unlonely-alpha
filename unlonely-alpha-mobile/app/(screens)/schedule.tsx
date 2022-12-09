import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useUpcomingSchedule } from '../../api/queries/useUpcomingSchedule';

export default function ScheduleScreen() {
  const { status, data, error, isFetching } = useUpcomingSchedule({
    limit: 9,
  });
  const schedule = data?.getHostEventFeed;

  console.log({ status, error, isFetching });

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Schedule</Text>
        <Link href="/sitemap">Link to all routes overview</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 960,
    marginHorizontal: 'auto',
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 36,
    color: '#38434D',
  },
});
