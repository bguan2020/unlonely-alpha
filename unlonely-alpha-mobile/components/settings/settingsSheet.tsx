import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useWindowDimensions, StyleSheet, ScrollView, View } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useHaptics } from '../../utils/haptics';
import { NotificationSettings } from './notificationSettings';
import { AppSettings } from './appSettings';
import { UserSettings } from './userSettings';
import { LinearGradient } from 'expo-linear-gradient';
import { easeGradient } from 'react-native-easing-gradient';
import { DeveloperSettings } from './developerSettings';
import { useBottomSheetStore } from '../../utils/store/bottomSheetStore';

const { colors, locations } = easeGradient({
  colorStops: {
    1: {
      color: 'hsl(0, 0%, 8%)',
    },
    0: {
      color: 'hsla(0, 0%, 8%, 0)',
    },
  },
});

const bottomSheetOptions = {
  index: -1,
  enablePanDownToClose: true,
  backgroundStyle: {
    backgroundColor: 'transparent',
  },
  handleStyle: {
    backgroundColor: 'transparent',
  },
  handleIndicatorStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    top: 26,
  },
  style: {
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
};

export const SettingsSheet = () => {
  const { height } = useWindowDimensions();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [height - 112], [height]); // figure out top bar height and add it here?
  const { isSettingsSheetOpen, closeSettingsSheet } = useBottomSheetStore(z => ({
    isSettingsSheetOpen: z.isSettingsSheetOpen,
    closeSettingsSheet: z.closeSettingsSheet,
  }));

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) closeSettingsSheet();
  }, []);

  useEffect(() => {
    if (isSettingsSheetOpen) {
      bottomSheetRef.current?.expand();
      useHaptics('light');
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isSettingsSheetOpen]);

  return (
    <>
      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} onChange={handleSheetChanges} {...bottomSheetOptions}>
        <View style={[styles.main, styles.sheetWrapper]}>
          <LinearGradient colors={colors} locations={locations} start={[0, 1]} end={[0, 0]} style={styles.fade} />
          {isSettingsSheetOpen && (
            <ScrollView style={[styles.main, styles.scroll]}>
              <UserSettings />
              <NotificationSettings />
              <AppSettings />
              <DeveloperSettings />
            </ScrollView>
          )}
        </View>
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  sheetWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  main: {
    width: '100%',
    backgroundColor: 'hsl(0, 0%, 8%)',
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  fade: {
    width: '120%',
    height: 40,
    position: 'absolute',
    top: 0,
    zIndex: 4,
  },
});
