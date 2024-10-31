import { Context } from "../../context";

export interface IUpdateRoomsInput {
  roomNameToUse: string;
}

export const updateRooms = async (data: IUpdateRoomsInput, ctx: Context) => {
  const _room = await ctx.prisma.room.findFirst({
    where: {
      roomName: data.roomNameToUse,
    },
  });

  if (!_room) {
    throw new Error("room not found");
  }

  // set the current room whose isUse is true to false if it's a different room from roomNameToUse
  const currentRoom = await ctx.prisma.room.findFirst({
    where: {
      inUse: true,
    },
  });
  if (currentRoom && currentRoom.roomName !== data.roomNameToUse) {
    await ctx.prisma.room.update({
      where: {
        roomName: currentRoom.roomName,
      },
      data: {
        inUse: false,
      },
    });
  } else if (currentRoom && currentRoom.roomName === data.roomNameToUse) {
    throw new Error("room already in use");
  }
  return await ctx.prisma.room.update({
    where: {
      roomName: data.roomNameToUse,
    },
    data: {
      inUse: true,
    },
  });
};

export const getRooms = (ctx: Context) => {
  return ctx.prisma.room.findMany();
};
