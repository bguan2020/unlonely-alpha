import { getStatusBarHeight } from 'react-native-safearea-height';

// 59 - iPhone 14 Pro / 14 Pro Max
// 50 - iPhone 13 mini / 12 mini
// 47 - iPhone 12 / 12 Pro / 13 / 13 Pro / 13 Pro Max / 14 / 14 Plus
// 44 - on iPhone X / XS / 11 Pro
// 20 - on iOS device
// X - on Android platfrom (runtime value)
// 0 - on all other platforms (default)
export const statusBarHeight = getStatusBarHeight();
