import { prisma } from '../src/lib/prisma';

async function main() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true }
  });
  console.log('CATEGORIES_RESULT:', JSON.stringify(categories, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
