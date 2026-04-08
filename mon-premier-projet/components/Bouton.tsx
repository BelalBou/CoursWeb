type BoutonProps = {
  texte: string;
};

export default function Bouton({ texte }: BoutonProps) {
  return (
    <button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700">
      {texte}
    </button>
  );
}
