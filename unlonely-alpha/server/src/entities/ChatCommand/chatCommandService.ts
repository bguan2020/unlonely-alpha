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
  console.log("updateDeleteChatCommands data:", data);
  try {
    const deletedChatCommands = await ctx.prisma.chatCommand.updateMany({
      where: {
        channelId: Number(data.id),
      },
      data: {
        softDelete: true,
      },
    });
  } catch (e) {
    console.log("updateDeleteChatCommands deletedChatCommands error:", e);
  }

  let newChatCommands: any = [];

  try {
    // create new chat commands for channel
    newChatCommands = await ctx.prisma.chatCommand.createMany({
      data: data.chatCommands.map((command) => ({
        command: command.command,
        response: command.response,
        channelId: Number(data.id),
      })),
    });
  } catch (e) {
    console.log("updateDeleteChatCommands newChatCommands error:", e);
  }

  return {
    id: data.id,
    chatCommands: newChatCommands,
  };
};
