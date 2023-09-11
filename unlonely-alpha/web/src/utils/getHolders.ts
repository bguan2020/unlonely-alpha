import centerEllipses from "./centerEllipses";

export const getHolders = (
  holders: {
    quantity: number;
    user: {
      username?: string | null | undefined;
      address: string;
    };
  }[]
) => {
  return holders
    .map((holder: any) => {
      return {
        name: holder.user.username ?? centerEllipses(holder.user.address, 10),
        quantity: holder.quantity,
      };
    })
    .sort((a: any, b: any) => b.quantity - a.quantity)
    .slice(0, 10);
};
