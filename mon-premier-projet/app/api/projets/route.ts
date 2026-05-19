import { listerProjets } from "@/lib/projets";

export async function GET() {
  const projets = listerProjets();
  return Response.json({ projets });
}
