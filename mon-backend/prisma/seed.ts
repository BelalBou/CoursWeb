import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const projets = [
  {
    slug: 'portfolio',
    titre: 'Portfolio personnel',
    description: 'Mon site vitrine en Next.js et Tailwind.',
    lien: 'https://exemple.com/portfolio',
    technologies: ['Next.js', 'TypeScript', 'Tailwind'],
  },
  {
    slug: 'gestion-tacos',
    titre: 'App de commande de tacos',
    description: 'Une petite app pour commander son tacos prefere.',
    lien: 'https://exemple.com/tacos',
    technologies: ['React', 'Node.js'],
  },
];

async function main() {
  await prisma.projetTechnologie.deleteMany();
  await prisma.technologie.deleteMany();
  await prisma.projet.deleteMany();

  for (const projet of projets) {
    await prisma.projet.create({
      data: {
        slug: projet.slug,
        titre: projet.titre,
        description: projet.description,
        lien: projet.lien,
        technologies: {
          create: projet.technologies.map((nom) => ({
            technologie: {
              connectOrCreate: {
                where: { nom },
                create: { nom },
              },
            },
          })),
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
