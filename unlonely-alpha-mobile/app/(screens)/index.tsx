import { StyleSheet, Text, View } from 'react-native';

export default function NFCs() {
  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>NFCs</Text>
        {/* <Subtitle>This is the video stream and chat page.</Subtitle> */}
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
