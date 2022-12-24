const { default: OBSWebSocket } = require("obs-websocket-js");

// connect to obs-websocket running on localhost with same port
const obs_IP = "192.168.0.232:4455";
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
          scene.sceneName !== "face-cam"
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
