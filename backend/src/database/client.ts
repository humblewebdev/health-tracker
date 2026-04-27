import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Handle cleanup on process termination
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
