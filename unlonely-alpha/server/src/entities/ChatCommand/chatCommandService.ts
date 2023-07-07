import { Context } from "../../context";

interface IChatCommand {
  command: string;
  response: string;
}

export interface IUpdateDeleteChatCommandInput {
  id: number;
  chatCommands: [IChatCommand];
}

export const updateDeleteChatCommands = async (
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
    data: data.chatCommands.map((command) => ({
      command: command.command,
      response: command.response,
      channelId: data.id,
    })),
  });

  return {
    id: data.id,
    chatCommands: newChatCommands,
  };
};
