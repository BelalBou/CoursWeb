"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ajouterMessage } from "@/lib/messages";

const SchemaContact = z.object({
  nom: z.string().trim().min(2, "Le nom doit avoir au moins 2 caracteres"),
  email: z.string().trim().email("Email invalide"),
  message: z
    .string()
    .trim()
    .min(10, "Le message doit avoir au moins 10 caracteres"),
});

export type EtatFormulaire = {
  ok: boolean;
  message: string;
  erreurs?: {
    nom?: string[];
    email?: string[];
    message?: string[];
  };
};

export const ETAT_INITIAL: EtatFormulaire = {
  ok: false,
  message: "",
};

export async function envoyerMessage(
  _etatPrecedent: EtatFormulaire,
  formData: FormData
): Promise<EtatFormulaire> {
  const donneesBrutes = {
    nom: formData.get("nom"),
    email: formData.get("email"),
    message: formData.get("message"),
  };

  const resultat = SchemaContact.safeParse(donneesBrutes);

  if (!resultat.success) {
    return {
      ok: false,
      message: "Le formulaire contient des erreurs.",
      erreurs: resultat.error.flatten().fieldErrors,
    };
  }

  ajouterMessage(resultat.data);
  revalidatePath("/contact");

  return {
    ok: true,
    message: "Merci ! Ton message a bien ete envoye.",
  };
}
