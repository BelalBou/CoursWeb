import type { NextRequest } from "next/server";
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

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const resultat = SchemaContact.safeParse(body);

  if (!resultat.success) {
    return Response.json(
      {
        ok: false,
        erreurs: resultat.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const message = ajouterMessage(resultat.data);

  return Response.json(
    {
      ok: true,
      id: message.id,
    },
    { status: 201 }
  );
}
