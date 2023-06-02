import { View, Text, StyleSheet, Pressable } from 'react-native';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { AnimatedPressable } from '../buttons/animatedPressable';
import { schedulePushNotification } from '../../utils/notifications';
import { useAppSettingsStore } from '../../utils/store/appSettingsStore';
import { useUserStore } from '../../utils/store/userStore';

const version = Constants.manifest.version;
const buildNumber = Constants.manifest.ios.buildNumber;

export const DeveloperSettings = () => {
  const [timesPressed, setTimesPressed] = useState(0);
  const [showDevMenu, setShowDevMenu] = useState(false);
  const { revokeNotificationsPermission, setNotificationsToken, setNotificationsLive, setNotificationsNFCs } =
    useAppSettingsStore(z => ({
      revokeNotificationsPermission: z.revokeNotificationsPermission,
      setNotificationsToken: z.setNotificationsToken,
      setNotificationsLive: z.setNotificationsLive,
      setNotificationsNFCs: z.setNotificationsNFCs,
    }));
  const { clearUser, clearConnectedWallet, setUserDataLoading } = useUserStore(z => ({
    clearUser: z.clearUser,
    clearConnectedWallet: z.clearConnectedWallet,
    setUserDataLoading: z.setUserDataLoading,
  }));

  useEffect(() => {
    if (timesPressed > 9) {
      setShowDevMenu(true);
    }
  }, [timesPressed]);

  const resetNotificationPermissions = () => {
    revokeNotificationsPermission();
    setNotificationsToken(null);
    setNotificationsLive(false);
    setNotificationsNFCs(false);
  };

  const resetNotificationTokens = () => {
    resetNotificationPermissions();
  };

  const clearWallet = () => {
    clearUser();
    clearConnectedWallet();
    setUserDataLoading(false);
  };

  return (
    <>
      {showDevMenu && (
        <View
          style={{
            paddingBottom: 32,
          }}
        >
          <Text style={styles.title}>Developer Settings</Text>
          <Text
            style={[
              styles.subtitle,
              {
                fontSize: 14,
                color: '#666',
              },
            ]}
          >
            please do not touch any of this shit
          </Text>

          <AnimatedPressable onPress={schedulePushNotification}>
            <View style={styles.settingsToggleRow}>
              <Text style={styles.subtitle}>send local test notification</Text>
              <Text style={styles.subtitle}>🔔</Text>
            </View>
          </AnimatedPressable>

          <AnimatedPressable onPress={resetNotificationPermissions}>
            <View style={styles.settingsToggleRow}>
              <Text style={styles.subtitle}>reset notification permissions</Text>
              <Text style={styles.subtitle}>🔕</Text>
            </View>
          </AnimatedPressable>

          <AnimatedPressable onPress={clearWallet}>
            <View style={styles.settingsToggleRow}>
              <Text style={styles.subtitle}>clear connected wallet</Text>
              <Text style={styles.subtitle}>☠️</Text>
            </View>
          </AnimatedPressable>

          {/* <AnimatedPressable>
            <View style={styles.settingsToggleRow}>
              <Text style={styles.subtitle}>clear app settings</Text>
              <Text style={styles.subtitle}>💣️</Text>
            </View>
          </AnimatedPressable> */}

          <AnimatedPressable onPress={resetNotificationTokens}>
            <View style={styles.settingsToggleRow}>
              <Text style={styles.subtitle}>reset notification permissions</Text>
              <Text style={styles.subtitle}>⚠️</Text>
            </View>
          </AnimatedPressable>
        </View>
      )}
      <Pressable onPress={() => setTimesPressed(pressed => pressed + 1)}>
        <Text style={styles.versionText}>unlonely mobile</Text>
        <Text style={styles.versionNumber}>
          version {version} ({buildNumber})
        </Text>
      </Pressable>
      <View style={styles.scrollViewFiller} />
    </>
  );
};

const styles = StyleSheet.create({
  scrollViewFiller: {
    height: 120,
  },
  versionText: {
    fontSize: 16,
    fontFamily: 'NeuePixelSans',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#e2f979',
    textAlign: 'center',
    marginTop: 32,
  },
  versionNumber: {
    fontSize: 12,
    fontFamily: 'NeuePixelSans',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#666',
    textAlign: 'center',
  },
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
    color: '#b04fcb',
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
