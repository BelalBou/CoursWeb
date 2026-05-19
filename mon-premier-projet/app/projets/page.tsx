import type { Metadata } from "next";
import Link from "next/link";
import { getProjets } from "@/lib/projets";

export const metadata: Metadata = {
  title: "Projets",
  description:
    "La selection des projets que je construis pendant ma formation au developpement web.",
};

export const dynamic = "force-dynamic";

export default async function ProjetsPage() {
  const projets = await getProjets();

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Mes projets</h1>
        <p className="text-gray-500 mb-10">
          Voici une selection des projets que je construis pendant ma formation.
        </p>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projets.map((projet) => (
            <li key={projet.slug}>
              <Link
                href={`/projets/${projet.slug}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-gray-900 transition-colors"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {projet.titre}
                </h2>
                <p className="text-gray-500 mb-4">{projet.description}</p>
                <div className="flex flex-wrap gap-2">
                  {projet.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
