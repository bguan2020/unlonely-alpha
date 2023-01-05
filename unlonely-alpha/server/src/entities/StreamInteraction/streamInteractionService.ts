import * as net from "net";

import { Context } from "../../context";
import * as dotenv from "dotenv";

export interface IPostStreamInteractionInput {
  interactionType: string;
}

export const postStreamInteraction = (
  data: IPostStreamInteractionInput,
  ctx: Context
) => {
  dotenv.config();
  const obs_IP_address = process.env.OBS_WEBSOCKET_IP_ADDRESS;
  const obs_port = process.env.OBS_WEBSOCKET_PORT;
  console.log(Number(obs_port), "obs port");
  try {
    console.log("obs_IP_address", obs_IP_address);
    const client = net.createConnection({ port: Number(obs_port), host: obs_IP_address}, () => {
      console.log("connected to server!");
      client.write("scene-change");
    });
  } catch (error) {
    console.log(error);
  }

  // return ctx.prisma.streamInteraction.create({
  //   data: {
  //     interactionType: data.interactionType,
  //     owner: {
  //       connect: {
  //         address: "0x141Edb16C70307Cf2F0f04aF2dDa75423a0E1bEa",
  //       },
  //     },
  //   },
  // });
};

export const getOwner = (
  { ownerAddr }: { ownerAddr: string },
  ctx: Context
) => {
  return ctx.prisma.user.findUnique({ where: { address: ownerAddr } });
};
