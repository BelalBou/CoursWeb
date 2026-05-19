"use client";

import { useState } from "react";

type Statut = "idle" | "envoi" | "ok" | "erreur";

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

function messageErreurDepuisApi(body: ApiErrorBody): string {
  if (Array.isArray(body.message)) {
    return body.message[0] ?? "Le formulaire contient une erreur.";
  }

  if (body.message) {
    return body.message;
  }

  return "Impossible d'envoyer le message pour le moment.";
}

export default function ContactForm() {
  const [statut, setStatut] = useState<Statut>("idle");
  const [messageRetour, setMessageRetour] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setStatut("envoi");
    setMessageRetour("");

    const data = new FormData(event.currentTarget);
    const payload = {
      nom: data.get("nom"),
      email: data.get("email"),
      message: data.get("message"),
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      const response = await fetch(`${apiUrl}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
        setStatut("erreur");
        setMessageRetour(messageErreurDepuisApi(body));
        return;
      }

      event.currentTarget.reset();
      setStatut("ok");
      setMessageRetour("Merci ! Ton message a bien ete envoye.");
    } catch {
      setStatut("erreur");
      setMessageRetour("Impossible d'envoyer le message pour le moment.");
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="flex flex-col gap-1">
        <label htmlFor="nom" className="text-sm font-medium text-gray-700">
          Nom
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          placeholder="Ton nom"
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none focus:border-gray-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="ton@email.com"
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none focus:border-gray-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="message" className="text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Ton message..."
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 outline-none focus:border-gray-900 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={statut === "envoi"}
        className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50"
      >
        {statut === "envoi" ? "Envoi en cours..." : "Envoyer le message"}
      </button>

      {messageRetour && (
        <p
          className={
            statut === "ok" ? "text-sm text-green-600" : "text-sm text-red-600"
          }
        >
          {messageRetour}
        </p>
      )}
    </form>
  );
}
