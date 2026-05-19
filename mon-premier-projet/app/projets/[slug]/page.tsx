import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjetParSlug } from "@/lib/projets";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const projet = await getProjetParSlug(slug);

  if (!projet) {
    return {
      title: "Projet introuvable",
    };
  }

  return {
    title: projet.titre,
    description: projet.description,
    openGraph: {
      title: projet.titre,
      description: projet.description,
      type: "article",
    },
  };
}

export default async function ProjetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projet = await getProjetParSlug(slug);

  if (!projet) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/projets"
          className="text-sm text-gray-500 hover:text-gray-900 mb-6 inline-block"
        >
          &lt;- Retour aux projets
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {projet.titre}
        </h1>
        <p className="text-lg text-gray-600 mb-6">{projet.description}</p>

        <div className="flex flex-wrap gap-2">
          {projet.technologies.map((tech) => (
            <span
              key={tech}
              className="text-sm bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
