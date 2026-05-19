export type Projet = {
  slug: string;
  titre: string;
  description: string;
  technologies: string[];
  lien: string;
};

const API_URL = process.env.API_URL ?? "http://localhost:3001";

export async function getProjets(): Promise<Projet[]> {
  const response = await fetch(`${API_URL}/projets`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error("Impossible de charger les projets");
  }

  return response.json() as Promise<Projet[]>;
}

export async function getProjetParSlug(slug: string): Promise<Projet | null> {
  const response = await fetch(`${API_URL}/projets/${slug}`, {
    next: { revalidate: 60 },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Erreur lors du chargement du projet");
  }

  return response.json() as Promise<Projet>;
}
