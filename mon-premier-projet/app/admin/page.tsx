import type { Metadata } from "next";
import { creerProjetAction, repondreMessageAction } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
  description: "Administration locale du portfolio.",
};

export const dynamic = "force-dynamic";

type Message = {
  id: string;
  nom: string;
  email: string;
  message: string;
  recuLe: string;
};

type ProjetAdmin = {
  id: number;
  slug: string;
  titre: string;
  description: string;
  lien: string;
  estPublie: boolean;
  technologies: {
    technologie: {
      nom: string;
    };
  }[];
};

type AdminPageProps = {
  searchParams?: Promise<{
    status?: string;
    error?: string;
  }>;
};

const API_URL = process.env.API_URL ?? "http://localhost:3001";

async function adminFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    headers: {
      "x-admin-token": process.env.ADMIN_TOKEN ?? "",
    },
  });

  if (!response.ok) {
    throw new Error("Impossible de charger l'admin.");
  }

  return response.json() as Promise<T>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = searchParams ? await searchParams : {};
  const [messages, projets] = await Promise.all([
    adminFetch<Message[]>("/admin/messages"),
    adminFetch<ProjetAdmin[]>("/admin/projets"),
  ]);

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin</h1>
          <p className="mt-2 text-gray-500">
            Messages recus, reponses par SMTP et ajout de projets.
          </p>
        </div>

        {params.status && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {params.status}
          </div>
        )}

        {params.error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {params.error}
          </div>
        )}

        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Ajouter un projet
          </h2>
          <form action={creerProjetAction} className="grid gap-4 md:grid-cols-2">
            <input
              name="titre"
              placeholder="Titre"
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
              required
            />
            <input
              name="slug"
              placeholder="slug-du-projet"
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
              required
            />
            <input
              name="lien"
              placeholder="https://exemple.com"
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
              required
            />
            <input
              name="technologies"
              placeholder="Next.js, NestJS, PostgreSQL"
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              className="min-h-28 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 md:col-span-2"
              required
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input name="estPublie" type="checkbox" defaultChecked />
              Publier le projet
            </label>
            <button className="rounded-lg bg-gray-900 px-6 py-3 font-medium text-white hover:bg-gray-700 md:justify-self-end">
              Ajouter
            </button>
          </form>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Messages recus
          </h2>
          <div className="grid gap-4">
            {messages.map((message) => (
              <article
                key={message.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{message.nom}</h3>
                    <p className="text-sm text-gray-500">{message.email}</p>
                  </div>
                  <time className="text-sm text-gray-400">
                    {new Date(message.recuLe).toLocaleString("fr-BE")}
                  </time>
                </div>
                <p className="mb-4 whitespace-pre-wrap text-gray-700">
                  {message.message}
                </p>
                <form action={repondreMessageAction} className="grid gap-3">
                  <input type="hidden" name="id" value={message.id} />
                  <input
                    name="subject"
                    placeholder="Sujet de la reponse"
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                    required
                  />
                  <textarea
                    name="message"
                    placeholder="Ta reponse"
                    className="min-h-28 rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                    required
                  />
                  <button className="rounded-lg bg-gray-900 px-5 py-2 font-medium text-white hover:bg-gray-700 md:justify-self-start">
                    Repondre par email
                  </button>
                </form>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Projets en base
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {projets.map((projet) => (
              <li
                key={projet.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between gap-4">
                  <h3 className="font-bold text-gray-900">{projet.titre}</h3>
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {projet.estPublie ? "publie" : "brouillon"}
                  </span>
                </div>
                <p className="mb-3 text-sm text-gray-500">{projet.slug}</p>
                <p className="mb-4 text-gray-700">{projet.description}</p>
                <div className="flex flex-wrap gap-2">
                  {projet.technologies.map(({ technologie }) => (
                    <span
                      key={technologie.nom}
                      className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                    >
                      {technologie.nom}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
