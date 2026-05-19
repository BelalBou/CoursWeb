"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type LienNav = {
  href: string;
  libelle: string;
};

const LIENS: LienNav[] = [
  { href: "/", libelle: "Accueil" },
  { href: "/projets", libelle: "Projets" },
  { href: "/contact", libelle: "Contact" },
];

export default function Navbar() {
  const cheminActuel = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
      <span className="text-xl font-bold text-gray-900">Mon Portfolio</span>
      <div className="flex gap-6">
        {LIENS.map((lien) => {
          const estActif = cheminActuel === lien.href;

          return (
            <Link
              key={lien.href}
              href={lien.href}
              className={
                estActif
                  ? "text-gray-900 font-bold"
                  : "text-gray-600 hover:text-gray-900 font-medium"
              }
            >
              {lien.libelle}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
