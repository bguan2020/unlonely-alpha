import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useWindowDimensions, View } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useAppSettingsStore } from '../../utils/store';
import { useHaptics } from '../../utils/haptics';

export const SettingsSheet = () => {
  const { height } = useWindowDimensions();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [height - 130], [height]); // figure out top bar height and add it here?
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  // settings
  const { isSettingsSheetOpen } = useAppSettingsStore(z => ({
    isSettingsSheetOpen: z.isSettingsSheetOpen,
  }));

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
      >
        <View
          style={{
            backgroundColor: 'red',
            flex: 1,
          }}
        ></View>
      </BottomSheet>
    </>
  );
};
