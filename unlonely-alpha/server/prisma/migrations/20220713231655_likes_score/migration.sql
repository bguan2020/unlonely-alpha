/*
  Warnings:

  - Added the required column `videoId` to the `Like` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "videoId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
