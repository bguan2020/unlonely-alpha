-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_commentId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_videoId_fkey";

-- AlterTable
ALTER TABLE "Like" ALTER COLUMN "commentId" DROP NOT NULL,
ALTER COLUMN "videoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
