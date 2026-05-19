"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-red-600 mb-2">Erreur</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          On n&apos;a pas pu charger les projets
        </h1>
        <p className="text-gray-500 mb-2">
          Quelque chose a plante. Reessaie dans un instant.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-6">
            Reference : {error.digest}
          </p>
        )}
        <button
          onClick={() => reset()}
          className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700"
        >
          Reessayer
        </button>
      </div>
    </main>
  );
}
