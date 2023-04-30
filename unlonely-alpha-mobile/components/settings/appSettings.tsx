import { View, Text, StyleSheet, Switch } from 'react-native';
import { useAppSettingsStore } from '../../utils/store/appSettingsStore';

export const AppSettings = () => {
  const { isBlurEnabled, isNfcAutoplayEnabled, toggleBlur, toggleNfcAutoplay } = useAppSettingsStore();

  return (
    <>
      <Text style={styles.title}>App Settings</Text>
      {/* <View style={styles.settingsToggleRow}>
        <Text style={styles.subtitle}>autoplay NFCs</Text>
        <Switch
          value={isNfcAutoplayEnabled}
          onValueChange={toggleNfcAutoplay}
          trackColor={{
            true: '#be47d1',
          }}
          thumbColor="white"
          disabled
        />
      </View> */}
      <View style={styles.settingsToggleRow}>
        <Text style={styles.subtitle}>blur</Text>
        <Switch
          value={isBlurEnabled}
          onValueChange={toggleBlur}
          trackColor={{
            true: '#be47d1',
          }}
          thumbColor="white"
        />
      </View>
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
    marginTop: 32,
  },
  subtitle: {
    color: 'white',
    fontFamily: 'NeuePixelSans',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  settingsToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: 'hsl(0, 0%, 12%)',
    borderBottomWidth: 1,
  },
});
