import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-gray-500 mb-2">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Page introuvable
        </h1>
        <p className="text-gray-500 mb-6">
          Cette page n&apos;existe pas. Voici de quoi rebondir.
        </p>
        <Link
          href="/"
          className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700"
        >
          Retour a l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
