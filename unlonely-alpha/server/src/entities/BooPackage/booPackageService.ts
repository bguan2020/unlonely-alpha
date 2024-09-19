import { Context } from "../../context";

export interface IUpdateBooPackageInput {
    packageName: string;
    cooldownInSeconds: number;
    priceMultiplier: string;
}

export const updateBooPackage = async (
    data: IUpdateBooPackageInput,
    ctx: Context
) => {
    const booPackage = await ctx.prisma.booPackage.findFirst({
        where: {
            packageName: data.packageName,
        },
    });

    if (!booPackage) {
        throw new Error("BooPackage not found");
    }

    return ctx.prisma.booPackage.update({
        where: {
            id: booPackage.id,
        },
        data: {
            cooldownInSeconds: data.cooldownInSeconds,
            priceMultiplier: data.priceMultiplier,
        },
    });
};


export const getBooPackages = (ctx: Context) => {
    return ctx.prisma.booPackage.findMany();
}