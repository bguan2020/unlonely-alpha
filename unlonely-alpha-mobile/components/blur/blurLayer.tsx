import { useState, useEffect } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';

type BlurLayerProps = {
  style?: StyleProp<ViewStyle>;
  blurType?: 'light' | 'dark' | 'xlight' | 'prominent' | 'regular' | 'extraDark';
  blurAmount?: number;
};

export const BlurLayer = ({ style, blurType, blurAmount }: BlurLayerProps) => {
  const [showBlur, setShowBlur] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShowBlur(true);
    }, 500);
  }, []);

  return (
    <View style={style}>
      {showBlur && (
        <BlurView
          blurAmount={blurAmount}
          blurType={blurType}
          // @ts-expect-error
          overlayColor="transparent"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
        />
      )}
    </View>
  );
};
