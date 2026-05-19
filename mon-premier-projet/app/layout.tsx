import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Portfolio de Belal",
    template: "%s - Portfolio de Belal",
  },
  description:
    "Developpeur web en formation. Je construis des projets avec Next.js, NestJS et bien plus.",
  openGraph: {
    title: "Portfolio de Belal",
    description:
      "Developpeur web en formation. Je construis des projets avec Next.js, NestJS et bien plus.",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
