const {default: OBSWebSocket} = require('obs-websocket-js');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

let authenticated = false;


// connect to obs-websocket running on localhost with same port

(async () => {
  // cloud
  const ws = new WebSocket('ws://192.168.0.232:4455');
  ws.on('open', () => {
    console.log('Successfully connected to OBS via WebSocket!');
    const requestId = uuidv4();
    const data = ws.send(JSON.stringify({
      "request-type": "GetSceneList",
      "message-id": requestId,
      "response-expected": true,
    }));
    console.log(data, "first send");
  });

  ws.on('message', data => {
    const response = JSON.parse(data);
    console.log(response);
    if (response.op === 0 && response.d.authentication) {
      // received an authentication challenge message
      console.log('Received authentication challenge from OBS.');
  
      // extract the salt and challenge values from the authentication challenge message
      const salt = response.d.authentication.salt;
      const challenge = response.d.authentication.challenge;
  
      const hmac = obsAuth(salt, challenge);
  
      // send an Authenticate message to the OBS WebSocket server
      const requestId = uuidv4();
      ws.send(JSON.stringify({
        "request-type": "Authenticate",
        "message-id": requestId,
        "auth": hmac
      }));
      console.log("hit this");
      ws.send(JSON.stringify({
        "request-type": "GetSceneList",
        "message-id": requestId,
        "response-expected": true,
      }));
    } else {
      console.log('Received response from OBS:', response);
      authenticated = true;
      const requestId = uuidv4();
      ws.send(JSON.stringify({
        "request-type": "GetSceneList",
        "message-id": requestId,
        "response-expected": true,
    }));
    }
  });

  const requestId = uuidv4();
  ws.send(JSON.stringify({
    "request-type": "GetSceneList",
    "message-id": requestId,
    "response-expected": true,
  }));


  // console.log(OBSWebSocket);
  // const obs = new OBSWebSocket();
  // obs.connect('ws://127.0.0.1:4455', 'VllUxAIAhTwVUMBE').then(async () => {
  //   console.log('Successfully connected to OBS!');
  //   const {currentProgramSceneName} = await obs.call('GetCurrentProgramScene');
  //   console.log(currentProgramSceneName);

  //   // get scene list
  //   const {scenes} = await obs.call('GetSceneList');
  //   // remove scene from scenes array if sceneName === currentProgramSceneName
  //   const filteredScenes = scenes.filter(scene => {
  //     // remove if scene name === currentProgramSceneName or if scene name === "desktop+cam"
  //     return scene.sceneName !== currentProgramSceneName && scene.sceneName !== 'desktop+cam' && scene.sceneName !== 'face-cam';
  //   });
  //   console.log(filteredScenes);

  //   // pick a random one from the filteredScenes array and set it as the currentProgramSceneName
  //   const randomScene = filteredScenes[Math.floor(Math.random() * filteredScenes.length)];
  //   console.log(randomScene);
  //   await obs.call('SetCurrentProgramScene', {sceneName: randomScene.sceneName});
  //   console.log('done');
    
  // }).catch(err => {
  //   console.error(`issue sending ${err}`);
  // });
})();

const password = 'VllUxAIAhTwVUMBE';

const obsAuth = (salt, challenge) => {
  // decode the salt and challenge values from base64
  const saltBuffer = Buffer.from(salt, 'base64');
  const challengeBuffer = Buffer.from(challenge, 'base64');

  // concatenate the salt and challenge values
  const authData = Buffer.concat([saltBuffer, challengeBuffer]);

  // compute the HMAC-SHA256 hash of the concatenation
  const hmac = crypto.createHmac('sha256', password).update(authData).digest('base64');

  return hmac;
}