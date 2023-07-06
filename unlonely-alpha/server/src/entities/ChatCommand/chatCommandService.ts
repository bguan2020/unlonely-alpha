import { Context } from "../../context";

interface IChatCommand {
  command: string;
  response: string;
}

export interface IUpdateDeleteChatCommandInput {
  id: number;
  commandArray: [IChatCommand]
}

export const updateDeleteChannelChatCommands = async (
  data: IUpdateDeleteChatCommandInput,
  ctx: Context
) => {
  // soft delete all chat commands for channel
  const deletedChatCommands = await ctx.prisma.chatCommand.updateMany({
    where: {
      channelId: data.id,
    },
    data: {
      softDelete: true,
    },
  });

  // create new chat commands for channel
  const newChatCommands = await ctx.prisma.chatCommand.createMany({
    data: data.commandArray.map((command) => ({
      command: command.command,
      response: command.response,
      channelId: data.id,
    })),
  });

  return newChatCommands;
}

