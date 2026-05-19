export type Projet = {
  id: string;
  slug: string;
  titre: string;
  description: string;
  technos: readonly string[];
};

const PROJETS: readonly Projet[] = [
  {
    id: "1",
    slug: "mon-portfolio",
    titre: "Mon portfolio",
    description:
      "Le site que tu lis en ce moment. Construit avec Next.js, TypeScript et Tailwind CSS.",
    technos: ["Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    id: "2",
    slug: "carnet-de-recettes",
    titre: "Carnet de recettes",
    description:
      "Une petite app pour stocker mes recettes preferees. Avec recherche et categories.",
    technos: ["Next.js", "Prisma", "PostgreSQL"],
  },
  {
    id: "3",
    slug: "tableau-de-bord",
    titre: "Tableau de bord",
    description:
      "Un dashboard pour visualiser mes statistiques quotidiennes.",
    technos: ["Next.js", "NestJS", "Chart.js"],
  },
];

export function listerProjets(): readonly Projet[] {
  return PROJETS;
}

export function trouverProjet(slug: string): Projet | undefined {
  return PROJETS.find((projet) => projet.slug === slug);
}

export function listerSlugs(): readonly string[] {
  return PROJETS.map((projet) => projet.slug);
}
