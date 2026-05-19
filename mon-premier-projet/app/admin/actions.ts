"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

function adminHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-admin-token": process.env.ADMIN_TOKEN ?? "",
  };
}

function redirectAdmin(status: string): never {
  redirect(`/admin?status=${encodeURIComponent(status)}`);
}

function redirectAdminError(error: string): never {
  redirect(`/admin?error=${encodeURIComponent(error)}`);
}

export async function creerProjetAction(formData: FormData): Promise<void> {
  const technologies = String(formData.get("technologies") ?? "")
    .split(",")
    .map((tech) => tech.trim())
    .filter(Boolean);

  const response = await fetch(`${API_URL}/admin/projets`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({
      slug: formData.get("slug"),
      titre: formData.get("titre"),
      description: formData.get("description"),
      lien: formData.get("lien"),
      technologies,
      estPublie: formData.get("estPublie") === "on",
    }),
  });

  if (!response.ok) {
    redirectAdminError("Impossible de creer le projet.");
  }

  revalidatePath("/admin");
  revalidatePath("/projets");
  redirectAdmin("Projet ajoute.");
}

export async function repondreMessageAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const response = await fetch(`${API_URL}/admin/messages/${id}/reply`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({
      subject: formData.get("subject"),
      message: formData.get("message"),
    }),
  });

  if (!response.ok) {
    redirectAdminError("Impossible d'envoyer la reponse SMTP.");
  }

  revalidatePath("/admin");
  redirectAdmin("Reponse envoyee.");
}
