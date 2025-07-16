/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Gestor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Gestor_email_key" ON "Gestor"("email");
