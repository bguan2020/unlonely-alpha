import { getStatusBarHeight } from 'react-native-safearea-height';

// 59 - iPhone 14 Pro / 14Pro Max
// 50 - iPhone 13 mini
// 47 - iPhone 12 / 12Pro / 13 / 13Pro / 13Pro Max / 14 / 14 Plus
// 44 - on iPhoneX
// 20 - on iOS device
// X - on Android platfrom (runtime value)
// 0 - on all other platforms (default)
export const statusBarHeight = getStatusBarHeight();
