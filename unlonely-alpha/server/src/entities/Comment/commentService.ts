import { User } from "@prisma/client";

import { Context } from "../../context";

const COLORS = [
  "#76D201",
  "#FC8F32",
  "#FF3EA5",
  "#59CBE8",
  "#BB29BB",
  "#0A6202",
  "#FFCC15",
  "#FF6D6A",
  "#517EF5",
  "#717BA7",
  "#27415E",
];

export const getCommentsByVideoId = ({ id }: { id: number }, ctx: Context) => {
  return ctx.prisma.comment.findMany({ where: { videoId: id } });
};

export interface IPostCommentInput {
  text: string;
  videoId: number;
  videoTimestamp: number;
  location_x: number;
  location_y: number;
}

export const postComment = (
  data: IPostCommentInput,
  user: User,
  ctx: Context
) => {
  function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  return ctx.prisma.comment.create({
    data: {
      text: data.text,
      videoTimestamp: data.videoTimestamp,
      location_x: data.location_x,
      location_y: data.location_y,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      score: getRandomInt(-20, 500),
      owner: {
        connect: { address: user.address },
      },
      video: {
        connect: { id: data.videoId },
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
