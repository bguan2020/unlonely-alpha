/*
  Warnings:

  - Added the required column `description` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerAddr` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnail` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "ownerAddr" TEXT NOT NULL,
ADD COLUMN     "pause" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "skip" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "thumbnail" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_ownerAddr_fkey" FOREIGN KEY ("ownerAddr") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
