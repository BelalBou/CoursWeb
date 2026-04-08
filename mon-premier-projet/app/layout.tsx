import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        {/*  ← affiché sur TOUTES les pages */}
        {children}
        {/*  ← contenu spécifique à chaque page */}
      </body>
    </html>
  );
}
