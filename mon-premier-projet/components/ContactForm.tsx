"use client";

import { useActionState } from "react";
import { envoyerMessage } from "@/app/contact/actions";
import { ETAT_INITIAL } from "@/app/contact/state";

export default function ContactForm() {
  const [etat, action, enCours] = useActionState(envoyerMessage, ETAT_INITIAL);

  return (
    <form className="flex flex-col gap-4" action={action}>
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
        {etat.erreurs?.nom && (
          <p className="text-sm text-red-600">{etat.erreurs.nom[0]}</p>
        )}
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
        {etat.erreurs?.email && (
          <p className="text-sm text-red-600">{etat.erreurs.email[0]}</p>
        )}
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
        {etat.erreurs?.message && (
          <p className="text-sm text-red-600">{etat.erreurs.message[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={enCours}
        className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50"
      >
        {enCours ? "Envoi en cours..." : "Envoyer le message"}
      </button>

      {etat.message && (
        <p
          className={
            etat.ok ? "text-sm text-green-600" : "text-sm text-red-600"
          }
        >
          {etat.message}
        </p>
      )}
    </form>
  );
}
