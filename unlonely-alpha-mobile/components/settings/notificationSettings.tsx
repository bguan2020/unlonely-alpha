import { View, Text, StyleSheet, Switch } from 'react-native';
import { registerForPushNotificationsAsync } from '../../utils/notifications';
import { useAppSettingsStore } from '../../utils/store';
import { AnimatedPressable } from '../buttons/animatedPressable';

export const NotificationSettings = () => {
  const {
    isNotificationPermissionGranted,
    isLivePushNotificationsEnabled,
    isNewNfcPushNotificationsEnabled,
    grantNotificationPermissions,
    toggleLivePushNotifications,
    toggleNewNfcPushNotifications,
  } = useAppSettingsStore(z => ({
    isNotificationPermissionGranted: z.isNotificationPermissionGranted,
    isLivePushNotificationsEnabled: z.isLivePushNotificationsEnabled,
    isNewNfcPushNotificationsEnabled: z.isNewNfcPushNotificationsEnabled,
    grantNotificationPermissions: z.grantNotificationPermissions,
    toggleLivePushNotifications: z.toggleLivePushNotifications,
    toggleNewNfcPushNotifications: z.toggleNewNfcPushNotifications,
  }));

  const grantPermissions = () => {
    registerForPushNotificationsAsync().then(token => {
      grantNotificationPermissions();
    });
  };

  return (
    <>
      <Text style={styles.title}>Notify me when</Text>
      <View
        style={[
          styles.settingsToggleRow,
          {
            opacity: isNotificationPermissionGranted ? 1 : 0.5,
          },
        ]}
      >
        <Text style={styles.subtitle}>stream goes live</Text>
        <Switch
          value={isLivePushNotificationsEnabled}
          onValueChange={toggleLivePushNotifications}
          trackColor={{
            true: '#be47d1',
          }}
          disabled={!isNotificationPermissionGranted}
        />
      </View>
      <View
        style={[
          styles.settingsToggleRow,
          {
            opacity: isNotificationPermissionGranted ? 1 : 0.5,
          },
        ]}
      >
        <Text style={styles.subtitle}>new NFCs created</Text>
        <Switch
          value={isNewNfcPushNotificationsEnabled}
          onValueChange={toggleNewNfcPushNotifications}
          trackColor={{
            true: '#be47d1',
          }}
          disabled={!isNotificationPermissionGranted}
        />
      </View>
      {!isNotificationPermissionGranted && (
        <View style={styles.notificationPermissionsBox}>
          <Text style={styles.notificationPermissionsText}>
            enable notifications to receive updates when things happen on unlonely
          </Text>
          <AnimatedPressable style={styles.notificationPermissionsButton} onPress={grantPermissions}>
            <Text style={styles.notificationPermissionsButtonText}>enable</Text>
          </AnimatedPressable>
        </View>
      )}
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
  notificationPermissionsBox: {
    backgroundColor: 'hsl(0, 0%, 12%)',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  notificationPermissionsText: {
    textAlign: 'center',
    color: 'white',
    fontFamily: 'NeuePixelSans',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  notificationPermissionsButton: {
    backgroundColor: '#be47d1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  notificationPermissionsButtonText: {
    textAlign: 'center',
    color: 'white',
    fontFamily: 'NeuePixelSans',
    fontSize: 18,
    letterSpacing: 0.5,
  },
});
