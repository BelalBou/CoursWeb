import type { Metadata } from "next";
import Image from "next/image";
import photoBelal from "@/public/photo-belal.jpg";
import Bouton from "@/components/Bouton";

export const metadata: Metadata = {
  description:
    "Bonjour, je suis Belal. Decouvre mes projets et mon parcours de developpeur web.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8">
      <div className="max-w-2xl text-center">
        <Image
          src={photoBelal}
          alt="Photo de Belal"
          width={140}
          height={140}
          priority
          placeholder="blur"
          className="rounded-full mx-auto mb-6 object-cover"
        />
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Bonjour, je suis Belal
        </h1>
        <p className="text-xl text-gray-500 mb-8">
          Developpeur web en formation. Je construis des projets avec Next.js,
          NestJS et bien plus.
        </p>
        <Bouton texte="Me contacter" href="/contact" />
      </div>
    </main>
  );
}
