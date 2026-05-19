import type { NextRequest } from "next/server";
import { trouverProjet } from "@/lib/projets";

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/projets/[slug]">
) {
  const { slug } = await context.params;
  const projet = trouverProjet(slug);

  if (!projet) {
    return Response.json(
      { ok: false, message: "Projet introuvable" },
      { status: 404 }
    );
  }

  return Response.json({ projet });
}
