import { Text, StyleSheet } from 'react-native';

export const UserSettings = () => {
  return (
    <>
      <Text style={styles.title}>Connected Wallet</Text>
      <Text style={styles.subtitle}>lonely anon</Text>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontFamily: 'NeuePixelSans',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#e2f979',
    textAlign: 'left',
    marginTop: 16,
  },
  subtitle: {
    color: 'white',
    fontFamily: 'NeuePixelSans',
    fontSize: 20,
    letterSpacing: 0.5,
  },
});
