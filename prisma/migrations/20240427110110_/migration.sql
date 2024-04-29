/*
  Warnings:

  - You are about to drop the column `valueId` on the `ProductSku` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductSku" DROP CONSTRAINT "ProductSku_valueId_fkey";

-- AlterTable
ALTER TABLE "ProductSku" DROP COLUMN "valueId";

-- CreateTable
CREATE TABLE "_ProductOptionValueToProductSku" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductOptionValueToProductSku_AB_unique" ON "_ProductOptionValueToProductSku"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductOptionValueToProductSku_B_index" ON "_ProductOptionValueToProductSku"("B");

-- AddForeignKey
ALTER TABLE "_ProductOptionValueToProductSku" ADD CONSTRAINT "_ProductOptionValueToProductSku_A_fkey" FOREIGN KEY ("A") REFERENCES "ProductOptionValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductOptionValueToProductSku" ADD CONSTRAINT "_ProductOptionValueToProductSku_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductSku"("id") ON DELETE CASCADE ON UPDATE CASCADE;
