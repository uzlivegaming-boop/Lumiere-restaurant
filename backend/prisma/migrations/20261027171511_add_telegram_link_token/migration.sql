/*
  Warnings:

  - A unique constraint covering the columns `[telegramLinkToken]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[telegramLinkToken]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "telegramLinkToken" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "telegramLinkToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_telegramLinkToken_key" ON "Booking"("telegramLinkToken");

-- CreateIndex
CREATE UNIQUE INDEX "Order_telegramLinkToken_key" ON "Order"("telegramLinkToken");
