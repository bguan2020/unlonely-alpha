const { default: OBSWebSocket } = require("obs-websocket-js");
const net = require("net");

// Create a server socket and bind it to a local port
(async () => {
  console.log(net);
    const server = net.createServer((client) => {
      console.log('Client connected');
  
    // Receive messages from the client and execute code as needed
    client.on('data', (data) => {
      const message = data.toString();
      if (message === 'do something') {
        // Execute some code here
        client.write('done');
      } else if (message === 'do something else') {
        // Execute some different code here
        client.write('done');
      }
      // etc.
    });
});

server.on('error', (err) => {
  console.error(`Error: ${err.message}`);
});

// listen on all available interfaces
server.listen(12346, '0.0.0.0');
})();  







const obs_IP = "192.168.1.84:4455";
const obs_password = "VllUxAIAhTwVUMBE";
(async () => {
  const obs = new OBSWebSocket();
  obs
    .connect(`ws://${obs_IP}`, obs_password)
    .then(async () => {
      console.log("Successfully connected to OBS!");
      const { currentProgramSceneName } = await obs.call(
        "GetCurrentProgramScene"
      );
      console.log(currentProgramSceneName);

      // get scene list
      const { scenes } = await obs.call("GetSceneList");
      // remove scene from scenes array if sceneName === currentProgramSceneName
      const filteredScenes = scenes.filter((scene) => {
        // remove if scene name === currentProgramSceneName or if scene name === "desktop+cam"
        return (
          scene.sceneName !== currentProgramSceneName &&
          scene.sceneName !== "desktop+cam" &&
          scene.sceneName !== "face-cam" &&
          scene.sceneName !== "ZOOM-face-cam only"
        );
      });
      console.log(filteredScenes);

      // pick a random one from the filteredScenes array and set it as the currentProgramSceneName
      const randomScene =
        filteredScenes[Math.floor(Math.random() * filteredScenes.length)];
      console.log(randomScene);
      await obs.call("SetCurrentProgramScene", {
        sceneName: randomScene.sceneName,
      });
      console.log("done");
    })
    .catch((err) => {
      console.error(`issue sending ${err}`);
    });
})();
