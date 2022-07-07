import { Context } from "../../context";

//~~~~~~~~~~~~add user services here~~~~~~~~~~~~~~~

// example:

// export const articlesByUser = (
//   { address }: { address: string },
//   ctx: Context
// ) => {
//   return ctx.prisma.user
//     .findUnique({
//       where: {
//         address,
//       },
//     })
//     .articles();
// };
export const getLeaderboard = (ctx: Context) => {
  return ctx.prisma.user.findMany({
    orderBy: [
      {
        reputation: "desc",
      },
    ],
  });
};

export interface IGetUserInput {
  address: string;
}

export const getUser = async (data: IGetUserInput, ctx: Context) => {
  return ctx.prisma.user.findUnique({
    where: { address: data.address },
  });
};
