import type { MetadataRoute } from "next";
import { getProjets } from "@/lib/projets";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pagesStatiques: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "monthly" },
    { url: `${SITE_URL}/projets`, changeFrequency: "weekly" },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly" },
  ];

  const projets = await getProjets().catch(() => []);
  const pagesProjets: MetadataRoute.Sitemap = projets.map((projet) => ({
    url: `${SITE_URL}/projets/${projet.slug}`,
    changeFrequency: "monthly",
  }));

  return [...pagesStatiques, ...pagesProjets];
}
