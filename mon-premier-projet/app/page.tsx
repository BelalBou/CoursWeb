import Bouton from "@/components/Bouton";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Bonjour, je suis Belal
        </h1>
        <p className="text-xl text-gray-500 mb-8">
          Développeur web en formation. Je construis des projets avec Next.js, NestJS et bien plus.
        </p>
        <Bouton texte="Me contacter" />
      </div>
    </main>
  );
}
