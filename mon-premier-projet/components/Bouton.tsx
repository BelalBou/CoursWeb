type BoutonProps = {
  texte: string;
};

export default function Bouton({ texte }: BoutonProps) {
  return <button>{texte}</button>;
}
