const { Client } = require("pg");
const { default: OBSWebSocket } = require("obs-websocket-js");

const obs_IP = "192.168.1.84:4455";
const obs_password = "VllUxAIAhTwVUMBE";

const obs = new OBSWebSocket();
const client = new Client({
  host: "db-postgresql-sfo3-16817-do-user-11088919-0.b.db.ondigitalocean.com",
  port: 25060,
  database: "unlonely_v1_staging",
  user: "doadmin",
  password: "AVNS__XJW01bZjuI2pG6",
  ssl: {
    rejectUnauthorized: false,
  },
});

(async () => {
  await client.connect(async (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected to database");
    }
  });

  const data = await client.query('LISTEN "StreamInteraction"');
  client.on("notification", (msg) => {
    console.log(`Received notification: ${msg.payload}`);
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
  });
})().catch((e) => console.error(e));
