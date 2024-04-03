import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const setLivepeerStreamIsLive = async (id: string, isLive: boolean) => {
    const existingChannel = await prisma.channel.findFirst({
        where: {
            livepeerStreamId: id
        }
    });

    if (!existingChannel) {
        console.error("Channel not found for livepeer stream id", id);
        return;
    }

    console.log(`channel ${existingChannel.id} is live: ${isLive}`)

    await prisma.channel.update({
        where: {
            id: existingChannel.id
        },
        data: {
            isLive
        }
    });
}