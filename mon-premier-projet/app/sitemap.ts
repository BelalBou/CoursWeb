import type { MetadataRoute } from "next";
import { listerProjets } from "@/lib/projets";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const pagesStatiques: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "monthly" },
    { url: `${SITE_URL}/projets`, changeFrequency: "weekly" },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly" },
  ];

  const pagesProjets: MetadataRoute.Sitemap = listerProjets().map((projet) => ({
    url: `${SITE_URL}/projets/${projet.slug}`,
    changeFrequency: "monthly",
  }));

  return [...pagesStatiques, ...pagesProjets];
}
