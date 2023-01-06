import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useWindowDimensions, StyleSheet, ScrollView } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useAppSettingsStore } from '../../utils/store';
import { useHaptics } from '../../utils/haptics';
import { NotificationSettings } from './notificationSettings';
import { AppSettings } from './appSettings';
import { UserSettings } from './userSettings';

const bottomSheetOptions = {
  index: -1,
  enablePanDownToClose: true,
  style: {
    shadowColor: 'black',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  backgroundStyle: {
    backgroundColor: 'hsl(0, 0%, 8%)',
  },
  handleStyle: {
    backgroundColor: 'hsl(0, 0%, 8%)',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  handleIndicatorStyle: {
    backgroundColor: 'white',
  },
};

export const SettingsSheet = () => {
  const { isSettingsSheetOpen, closeSettingsSheet } = useAppSettingsStore(z => ({
    isSettingsSheetOpen: z.isSettingsSheetOpen,
    closeSettingsSheet: z.closeSettingsSheet,
  }));
  const { height } = useWindowDimensions();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [height - 130], [height]); // figure out top bar height and add it here?
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) closeSettingsSheet();
  }, []);

  useEffect(() => {
    if (isSettingsSheetOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
    useHaptics('light');
  }, [isSettingsSheetOpen]);

  return (
    <>
      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} onChange={handleSheetChanges} {...bottomSheetOptions}>
        <ScrollView style={styles.main}>
          <UserSettings />
          <NotificationSettings />
          <AppSettings />
        </ScrollView>
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  main: {
    width: '100%',
    paddingHorizontal: 16,
    backgroundColor: 'hsl(0, 0%, 8%)',
    flex: 1,
  },
});
