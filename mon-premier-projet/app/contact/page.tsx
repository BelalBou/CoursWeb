import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Envoie-moi un message. Je te reponds des que possible.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact</h1>
        <p className="text-gray-500 mb-6">
          Remplis le formulaire et je te reponds des que possible.
        </p>
        <ContactForm />
      </div>
    </main>
  );
}
