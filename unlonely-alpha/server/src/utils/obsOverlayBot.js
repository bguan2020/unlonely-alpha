const {default: OBSWebSocket} = require('obs-websocket-js');
// connect to obs-websocket running on localhost with same port

(async () => {
  console.log(OBSWebSocket);
  const obs = new OBSWebSocket();
  obs.connect('ws://127.0.0.1:4455', 'VllUxAIAhTwVUMBE').then(async () => {
    console.log('Successfully connected to OBS!');
    const {currentProgramSceneName} = await obs.call('GetCurrentProgramScene');
    console.log(currentProgramSceneName);

    // Get the current scene
    obs.sceneName().then(data => {
      console.log(data);
      const currentScene = data.name;

      // Add a new text source to the current scene
      obs.send('AddTextGDIPlusSource', {
        sourceName: 'My Text Source',
        fontSize: 36,
        text: 'Hello, World!',
        sceneName: currentScene
      });
    });
  }).catch(err => {
    console.error(`issue sending ${err}`);
  });
})();