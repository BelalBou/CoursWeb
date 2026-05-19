import Link from "next/link";

type BoutonProps = {
  texte: string;
  href: string;
};

export default function Bouton({ texte, href }: BoutonProps) {
  return (
    <Link
      href={href}
      className="inline-flex bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700"
    >
      {texte}
    </Link>
  );
}
