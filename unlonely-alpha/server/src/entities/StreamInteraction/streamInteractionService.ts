import { Context } from "../../context";
import OBSWebSocket from "obs-websocket-js";

export interface IPostStreamInteractionInput {
  interactionType: string;
}

const obs_IP = "192.168.0.232:4455";
const obs_password = "VllUxAIAhTwVUMBE";

export const postStreamInteraction = (data: IPostStreamInteractionInput, ctx: Context) => {
  // obs-websocket-js
  const obs = new OBSWebSocket();
  obs.connect(`ws://${obs_IP}`, obs_password).then(async () => {
    console.log('Successfully connected to OBS!');
    const {currentProgramSceneName} = await obs.call('GetCurrentProgramScene');
    console.log("current scene ", currentProgramSceneName);

    // get scene list
    const {scenes} = await obs.call('GetSceneList');
    // remove scene from scenes array if sceneName === currentProgramSceneName
    const filteredScenes = scenes.filter(scene => {
      // remove if scene name === currentProgramSceneName or if scene name === "desktop+cam"
      return scene.sceneName !== currentProgramSceneName && scene.sceneName !== 'desktop+cam' && scene.sceneName !== 'face-cam';
    });
    // pick a random one from the filteredScenes array and set it as the currentProgramSceneName
    const randomScene = filteredScenes[Math.floor(Math.random() * filteredScenes.length)];
    console.log("randomScene", randomScene.sceneName?.toString());
    if (!randomScene || !randomScene.sceneName) {
      return;
    }
    await obs.call('SetCurrentProgramScene', {sceneName: randomScene.sceneName?.toString()});
    console.log('done');
    
  }).catch(err => {
    console.error(`issue sending ${err}`);
    return err;
  });
  // update the original host event to have a challenger
  return ctx.prisma.streamInteraction.create({
    data: {
      interactionType: data.interactionType,
      owner: {
        connect: {
          address: "0x141Edb16C70307Cf2F0f04aF2dDa75423a0E1bEa",
        }
      },
    },
  });
};

export const getOwner = (
  { ownerAddr }: { ownerAddr: string },
  ctx: Context
) => {
  return ctx.prisma.user.findUnique({ where: { address: ownerAddr } });
};
