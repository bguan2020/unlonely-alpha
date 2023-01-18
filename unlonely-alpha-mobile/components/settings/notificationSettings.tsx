import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import { useUserNotifications } from '../../api/mutations/useUserNotifications';
import { useUser } from '../../api/queries/useUser';
import { useHaptics } from '../../utils/haptics';
import { allowsNotificationsAsync, mergeTokens, registerForPushNotificationsAsync } from '../../utils/notifications';
import { useAppSettingsStore } from '../../utils/store/appSettingsStore';
import { useBottomSheetStore } from '../../utils/store/bottomSheetStore';
import { useUserStore } from '../../utils/store/userStore';
import { AnimatedPressable } from '../buttons/animatedPressable';
import { toast } from '../toast/toast';

export const NotificationSettings = () => {
  const [loading, setLoading] = useState(false);
  const [liveEnabled, setLiveEnabled] = useState(false); // default before data loads
  const [nfcEnabled, setNfcEnabled] = useState(false); // default before data loads
  const { isNotificationPermissionGranted, grantNotificationPermissions, revokeNotificationsPermission } =
    useAppSettingsStore(z => ({
      isNotificationPermissionGranted: z.isNotificationsPermissionGranted,
      grantNotificationPermissions: z.grantNotificationsPermission,
      revokeNotificationsPermission: z.revokeNotificationsPermission,
    }));
  const { userData, setUser, connectedWallet, _hasHydrated } = useUserStore(z => ({
    _hasHydrated: z._hasHydrated,
    connectedWallet: z.connectedWallet,
    userData: z.userData,
    setUser: z.setUser,
  }));
  const allowed = isNotificationPermissionGranted && userData;

  const hydratedWalletAddress = _hasHydrated && connectedWallet ? connectedWallet.address : 'user';
  const isSettingsSheetOpen = useBottomSheetStore(z => z.isSettingsSheetOpen);
  const { data: apiUser, run: getUserData } = useUser(hydratedWalletAddress, { address: hydratedWalletAddress });
  const userNotifications = useUserNotifications();

  const toggleLive = () => {
    if (userData) {
      userNotifications?.mutate({
        notificationsLive: !liveEnabled,
      });
      setLoading(true);
      setUser({
        ...userData,
        notificationsLive: !liveEnabled,
      });
    }
  };

  const toggleNfc = () => {
    if (userData) {
      userNotifications?.mutate({
        notificationsNFCs: !nfcEnabled,
      });
      setLoading(true);
      setUser({
        ...userData,
        notificationsNFCs: !nfcEnabled,
      });
    }
  };

  const grantPermissions = async () => {
    registerForPushNotificationsAsync().then(token => {
      grantNotificationPermissions();
      // read tokens and settings first. add new token if not already there
      // and send the mutation with the new token and default settings

      if (userData?.notificationsTokens?.includes(token)) return;
      if (token === null) return;

      userNotifications.mutate({
        notificationsLive: liveEnabled,
        notificationsNFCs: nfcEnabled,
        notificationsTokens: mergeTokens(userData?.notificationsTokens, token),
      });
    });
  };

  useEffect(() => {
    allowsNotificationsAsync().then(enabled => {
      if (enabled) {
        grantPermissions();
        console.log('🔔 [allowsNotificationsAsync] enabled');
      } else {
        revokeNotificationsPermission();
        console.log('🔕 [allowsNotificationsAsync] disabled');
      }
      // figure out extra permission stuff here for displaying the button and
      // setting zustand variable settings
    });
  }, []);

  useEffect(() => {
    // handle default & disconnected state
    if (userData) {
      setLiveEnabled(userData?.notificationsLive);
      setNfcEnabled(userData?.notificationsNFCs);
    } else {
      setLiveEnabled(false);
      setNfcEnabled(false);
    }
  }, [loading, userData, apiUser]);

  useEffect(() => {
    if (userNotifications?.data?.updateUserNotifications) {
      setLoading(false);
      toast('notifications updated');
      useHaptics('light');
    }
  }, [userNotifications?.data]);

  useEffect(() => {
    if (connectedWallet?.address) {
      getUserData();
    }
  }, [isSettingsSheetOpen]);

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
        <Text style={styles.subtitle}>stream goes live</Text>
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
    textAlign: 'left',
    marginTop: 8,
  },
  activitySwitch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
