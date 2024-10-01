/*
  Warnings:

  - You are about to drop the column `currentTableId` on the `order` table. All the data in the column will be lost.
  - The values [SERVER] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[currentOrderId]` on the table `Table` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `waiterId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `waiterId` to the `OrderUpdate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_currentTableId_fkey`;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `currentTableId`,
    ADD COLUMN `printedForKitchen` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `totalAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `waiterId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `orderitem` ADD COLUMN `price` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `orderupdate` ADD COLUMN `updateAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `waiterId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `table` ADD COLUMN `currentOrderId` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('KITCHEN', 'WAITER', 'CASHIER') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Table_currentOrderId_key` ON `Table`(`currentOrderId`);

-- AddForeignKey
ALTER TABLE `Table` ADD CONSTRAINT `Table_currentOrderId_fkey` FOREIGN KEY (`currentOrderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_waiterId_fkey` FOREIGN KEY (`waiterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderUpdate` ADD CONSTRAINT `OrderUpdate_waiterId_fkey` FOREIGN KEY (`waiterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
