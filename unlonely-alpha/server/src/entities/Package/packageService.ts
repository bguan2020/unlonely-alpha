import { Context } from "../../context";

export interface IUpdatePackageInput {
    packageName: string;
    cooldownInSeconds: number;
    tokenHoldingPrice: string;
}

export const updatePackage = async (
    data: IUpdatePackageInput,
    ctx: Context
) => {
    const _package = await ctx.prisma.package.findFirst({
        where: {
            packageName: data.packageName,
        },
    });

    if (!_package) {
        throw new Error("Package not found");
    }

    return ctx.prisma.package.update({
        where: {
            id: _package.id,
        },
        data: {
            cooldownInSeconds: data.cooldownInSeconds,
            tokenHoldingPrice: data.tokenHoldingPrice,
        },
    });
};


export const getPackages = (ctx: Context) => {
    return ctx.prisma.package.findMany();
}