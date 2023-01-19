import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet } from 'react-native';
import { easeGradient } from 'react-native-easing-gradient';

const { colors, locations } = easeGradient({
  // Eased gradient function so it doesn’t look like garbage
  colorStops: {
    0: {
      color: '#000',
    },
    1: {
      color: 'transparent',
    },
  },
});

export const FadedTabBar = () => (
  // Custom tab bar background that fades out at the top
  <View style={StyleSheet.absoluteFillObject}>
    <LinearGradient
      colors={colors}
      locations={locations}
      start={[0, 1]}
      end={[0, 0]}
      style={{
        width: '100%',
        height: '140%',
        position: 'absolute',
        bottom: 0,
      }}
    />
  </View>
);
