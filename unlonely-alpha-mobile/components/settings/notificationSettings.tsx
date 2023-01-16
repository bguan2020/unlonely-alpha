import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useUserNotifications } from '../../api/mutations/useUserNotifications';
import { allowsNotificationsAsync, registerForPushNotificationsAsync } from '../../utils/notifications';
import { useAppSettingsStore } from '../../utils/store/appSettingsStore';
import { useUserStore } from '../../utils/store/userStore';
import { AnimatedPressable } from '../buttons/animatedPressable';

export const NotificationSettings = () => {
  const [liveEnabled, setLiveEnabled] = useState(false); // default before data loads
  const [nfcEnabled, setNfcEnabled] = useState(false); // default before data loads
  const { isNotificationPermissionGranted, grantNotificationPermissions } = useAppSettingsStore(z => ({
    isNotificationPermissionGranted: z.isNotificationsPermissionGranted,
    grantNotificationPermissions: z.grantNotificationsPermission,
  }));
  const { userData, setUser } = useUserStore();

  // const userNotifications = useUserNotifications();

  const allowed = isNotificationPermissionGranted && userData;

  const grantPermissions = () => {
    registerForPushNotificationsAsync().then(token => {
      grantNotificationPermissions();
      // userNotifications.mutate({
      //   notificationsLive: liveEnabled,
      //   notificationsNFCs: nfcEnabled,
      //   notificationsTokens: JSON.stringify([token]),
      // });
      // console.log('grantPermissions =====');
    });
  };

  useEffect(() => {
    allowsNotificationsAsync().then(enabled => {
      // console.log('[notification setttings]: isNotificationPermissionGranted change');
      if (enabled) {
        grantNotificationPermissions();
        // if userData.notificationsToken does not include the token then we need to
        // register it with a mutation
      }

      // figure out extra permission stuff here for displaying the button and
      // setting zustand variable settings
    });
  }, []);

  // useEffect(() => {
  //   if (userNotifications.data) {
  //     // setUser(userNotifications.data.updateUserNotifications);
  //     setLiveEnabled(userNotifications.data.updateUserNotifications.notificationsLive);
  //     setNfcEnabled(userNotifications.data.updateUserNotifications.notificationsNFCs);
  //   }
  // }, [userNotifications.data]);

  // useEffect(() => {
  //   console.log('[settings] liveEnabled', liveEnabled);
  //   console.log('[settings] nfcEnabled', nfcEnabled);

  //   if (userData) {
  //     userNotifications.mutate({
  //       notificationsLive: liveEnabled,
  //       notificationsNFCs: nfcEnabled,
  //       // notificationsTokens: JSON.stringify([new Date().getMinutes(), new Date().getMilliseconds()]),
  //     });
  //   }
  // }, [liveEnabled, nfcEnabled]);

  const toggleLive = () => {
    setUser({
      ...userData,
      notificationsLive: !liveEnabled,
    });
  };

  const toggleNfc = () => {
    setUser({
      ...userData,
      notificationsNFCs: !nfcEnabled,
    });
  };

  useEffect(() => {
    // handle default & disconnected state
    if (userData) {
      setLiveEnabled(userData.notificationsLive);
      setNfcEnabled(userData.notificationsNFCs);
    } else {
      setLiveEnabled(false);
      setNfcEnabled(false);
    }
  }, [userData]);

  return (
    <>
      {userData && (
        <>
          <View style={styles.settingsToggleRow}>
            <Text style={styles.subtitle}>address</Text>
            <Text
              style={[
                styles.subtitle,
                {
                  fontSize: 11,
                },
              ]}
            >
              {userData.address}
            </Text>
          </View>
          <View style={styles.settingsToggleRow}>
            <Text style={styles.subtitle}>username</Text>
            <Text style={styles.subtitle}>{userData.username}</Text>
          </View>
          <View style={styles.settingsToggleRow}>
            <Text style={styles.subtitle}>tokens</Text>
            <Text style={styles.subtitle}>{userData.notificationsTokens}</Text>
          </View>
          <View style={styles.settingsToggleRow}>
            <Text style={styles.subtitle}>live</Text>
            <Text style={styles.subtitle}>{userData.notificationsLive.toString()}</Text>
          </View>
          <View style={styles.settingsToggleRow}>
            <Text style={styles.subtitle}>nfc</Text>
            <Text style={styles.subtitle}>{userData.notificationsNFCs.toString()}</Text>
          </View>
        </>
      )}

      {/*  */}

      <Text style={styles.title}>Notify me when</Text>
      <View
        style={[
          styles.settingsToggleRow,
          {
            opacity: allowed ? 1 : 0.5,
          },
        ]}
      >
        <Text style={styles.subtitle}>stream goes live</Text>
        <Switch
          value={liveEnabled}
          onValueChange={toggleLive}
          trackColor={{
            true: '#be47d1',
          }}
          disabled={!allowed}
        />
      </View>
      <View
        style={[
          styles.settingsToggleRow,
          {
            opacity: allowed ? 1 : 0.5,
          },
        ]}
      >
        <Text style={styles.subtitle}>new NFCs created</Text>
        <Switch
          value={nfcEnabled}
          onValueChange={toggleNfc}
          trackColor={{
            true: '#be47d1',
          }}
          disabled={!allowed}
        />
      </View>
      {!isNotificationPermissionGranted ? (
        <View style={styles.notificationPermissionsBox}>
          <Text style={styles.notificationPermissionsText}>
            enable notifications to receive updates when things happen on unlonely
          </Text>
          <AnimatedPressable style={styles.notificationPermissionsButton} onPress={grantPermissions}>
            <Text style={styles.notificationPermissionsButtonText}>enable</Text>
            {/* redirect to app settings page when permission revoked with Linking from rn */}
          </AnimatedPressable>
        </View>
      ) : (
        <Text style={styles.notificationsExplainerText}>
          {!allowed
            ? 'connect your wallet to change notification settings'
            : 'notification settings are shared across multiple mobile devices'}
        </Text>
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
  notificationsExplainerText: {
    fontSize: 12,
    fontFamily: 'NeuePixelSans',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    width: 280,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
});
