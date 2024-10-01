-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_orderId_fkey`;

-- AlterTable
ALTER TABLE `orderitem` ADD COLUMN `orderUpdateId` INTEGER NULL,
    MODIFY `orderId` INTEGER NULL;

-- CreateTable
CREATE TABLE `OrderUpdate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL,
    `printedForKitchen` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderUpdate` ADD CONSTRAINT `OrderUpdate_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderUpdateId_fkey` FOREIGN KEY (`orderUpdateId`) REFERENCES `OrderUpdate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
