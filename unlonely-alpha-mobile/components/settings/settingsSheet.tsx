import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useWindowDimensions, View, Text } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useAppSettingsStore } from '../../utils/store';
import { useHaptics } from '../../utils/haptics';

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
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        onChange={handleSheetChanges}
        enablePanDownToClose
        style={{
          shadowColor: 'black',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.5,
          shadowRadius: 15,
        }}
      >
        <View
          style={{
            backgroundColor: 'yellow',
            flex: 1,
          }}
        >
          <Text>start putting shit in here so it actually works</Text>
          <Text>same with connectkit wallet and grabbing ens and avatar</Text>
        </View>
      </BottomSheet>
    </>
  );
};
