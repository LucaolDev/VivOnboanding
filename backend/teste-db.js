import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Conectou ao banco!');
  } catch (e) {
    console.error('Erro ao conectar:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
