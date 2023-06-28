import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator, AppState } from 'react-native';
import { useHaptics } from '../../utils/haptics';
import { allowsNotificationsAsync, registerForPushNotificationsAsync } from '../../utils/notifications';
import { useAppSettingsStore } from '../../utils/store/appSettingsStore';
import { useBottomSheetStore } from '../../utils/store/bottomSheetStore';
import { AnimatedPressable } from '../buttons/animatedPressable';
import { toast } from '../toast/toast';
import { useDeviceNotifications } from '../../api/queries/useDeviceNotifications';
import { useUpdateNotificationSettings } from '../../api/mutations/useUpdateNotificationSettings';
import { useCreateNotificationSettings } from '../../api/mutations/useCreateNotificationSettings';

export const NotificationSettings = () => {
  const {
    isNotificationPermissionGranted,
    grantNotificationPermissions,
    revokeNotificationsPermission,
    notificationsToken,
    setNotificationsToken,
    isNotificationsLiveEnabled,
    isNotificationsNFCsEnabled,
    setNotificationsLive,
    setNotificationsNFCs,
  } = useAppSettingsStore(z => ({
    isNotificationPermissionGranted: z.isNotificationsPermissionGranted,
    grantNotificationPermissions: z.grantNotificationsPermission,
    revokeNotificationsPermission: z.revokeNotificationsPermission,
    notificationsToken: z.notificationsToken,
    setNotificationsToken: z.setNotificationsToken,
    isNotificationsLiveEnabled: z.isNotificationsLiveEnabled,
    isNotificationsNFCsEnabled: z.isNotificationsNFCsEnabled,
    setNotificationsLive: z.setNotificationsLive,
    setNotificationsNFCs: z.setNotificationsNFCs,
  }));
  const allowed = isNotificationPermissionGranted;
  const isSettingsSheetOpen = useBottomSheetStore(z => z.isSettingsSheetOpen);
  const createNotifications = useCreateNotificationSettings();
  const updateNotifications = useUpdateNotificationSettings();
  const [loading, setLoading] = useState(false);
  const [liveEnabled, setLiveEnabled] = useState(isNotificationsLiveEnabled);
  const [nfcEnabled, setNfcEnabled] = useState(isNotificationsNFCsEnabled);
  const { data: notificationsData, run: getNotificationSettings } = useDeviceNotifications(notificationsToken, {
    token: notificationsToken,
  });
  const [inBackground, setInBackground] = useState(false);

  const handleAppStateChange = nextAppState => {
    if (nextAppState === 'active') {
      setInBackground(false);
    } else {
      setInBackground(true);
    }
  };

  const toggleLive = () => {
    setLiveEnabled(!liveEnabled);
    setLoading(true);
    updateNotifications.mutate({
      token: notificationsToken,
      notificationsLive: !isNotificationsLiveEnabled,
      notificationsNFCs: isNotificationsNFCsEnabled,
    });
  };

  const toggleNfc = () => {
    setNfcEnabled(!nfcEnabled);
    setLoading(true);
    updateNotifications.mutate({
      token: notificationsToken,
      notificationsLive: isNotificationsLiveEnabled,
      notificationsNFCs: !isNotificationsNFCsEnabled,
    });
  };

  const grantPermissions = async () => {
    registerForPushNotificationsAsync().then(token => {
      if (token === null || token === undefined) return;

      grantNotificationPermissions();

      if (token === notificationsToken) {
        getNotificationSettings();
        return;
      }

      setNotificationsToken(token);

      console.log(
        '🔔 [grantPermissions] enabling notifications by default and saving to the database with token:',
        token
      );

      setLoading(true);
      createNotifications.mutate({
        token,
        notificationsLive: true,
        notificationsNFCs: true,
      });
    });
  };

  useEffect(() => {
    getNotificationSettings();
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    if (isSettingsSheetOpen) {
      appStateSubscription.remove();
    }
  }, [isSettingsSheetOpen]);

  useEffect(() => {
    allowsNotificationsAsync().then(enabled => {
      if (enabled) {
        grantPermissions();
        console.log('🔔 [allowsNotificationsAsync] enabled');
      } else {
        revokeNotificationsPermission();
        console.log('🔕 [allowsNotificationsAsync] disabled');
      }
    });
  }, [inBackground, isSettingsSheetOpen]);

  useEffect(() => {
    const queryData = notificationsData?.getDeviceByToken;

    if (queryData) {
      const { notificationsLive, notificationsNFCs } = queryData;
      setNotificationsLive(notificationsLive);
      setNotificationsNFCs(notificationsNFCs);
      setLoading(false);
    } else {
      setNotificationsLive(false);
      setNotificationsNFCs(false);
      setLoading(false);
    }
  }, [notificationsData?.getDeviceByToken]);

  useEffect(() => {
    if (updateNotifications?.data?.updateDeviceToken) {
      toast('notifications updated');
      setLoading(false);
      useHaptics('light');
    }

    if (createNotifications?.data?.postDeviceToken) {
      toast('enabled notifications');
      setLoading(false);
      useHaptics('light');
    }
  }, [updateNotifications?.data, createNotifications?.data]);

  useEffect(() => {
    if (updateNotifications?.error || createNotifications?.error) {
      setLoading(false);
      toast('notifications error', 'error');
      useHaptics('medium');
    }
  }, [updateNotifications?.error, createNotifications?.error]);

  return (
    <>
      <Text style={styles.title}>Notify me when</Text>
      <View
        style={[
          styles.settingsToggleRow,
          {
            opacity: allowed ? 1 : 0.5,
          },
        ]}
      >
        <Text style={styles.subtitle}>streams go live</Text>
        <View style={styles.activitySwitch}>
          {loading && (
            <ActivityIndicator
              size="small"
              color={'#ccc'}
              style={{
                paddingRight: 8,
              }}
            />
          )}
          <Switch
            value={liveEnabled}
            onValueChange={toggleLive}
            trackColor={{
              true: '#be47d1',
            }}
            thumbColor="white"
            disabled={!allowed || loading}
          />
        </View>
      </View>
      <View
        style={[
          styles.settingsToggleRow,
          {
            opacity: allowed ? 1 : 0.5,
          },
        ]}
      >
        <Text style={styles.subtitle}>new NFCs are created</Text>
        <View style={styles.activitySwitch}>
          {loading && (
            <ActivityIndicator
              size="small"
              color={'#ccc'}
              style={{
                paddingRight: 8,
              }}
            />
          )}
          <Switch
            value={nfcEnabled}
            onValueChange={toggleNfc}
            trackColor={{
              true: '#be47d1',
            }}
            thumbColor="white"
            disabled={!allowed || loading}
          />
        </View>
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
            ? 'enable notifications to get the most out of unlonely'
            : 'notification settings are not synced between multiple devices'}
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
    textAlign: 'left',
    marginTop: 8,
  },
  activitySwitch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
