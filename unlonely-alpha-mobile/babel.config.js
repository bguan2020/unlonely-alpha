module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo']],
    plugins: [
      require.resolve('expo-router/babel'),
      'module:react-native-dotenv',
      '@babel/plugin-proposal-export-namespace-from',
      'react-native-reanimated/plugin',
      [
        'expo-notifications',
        {
          // icon: './local/path/to/myNotificationIcon.png',
          color: '#ffffff',
          // sounds: ['./local/path/to/mySound.wav', './local/path/to/myOtherSound.wav'],
          // mode: 'production',
        },
      ],
    ],
  };
};
