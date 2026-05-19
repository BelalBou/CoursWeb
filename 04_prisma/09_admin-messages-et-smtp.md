# Cours 09 — Admin, messages et SMTP

## Ce qu'on va voir

On ajoute une première zone admin au portfolio :

- Voir les messages reçus.
- Répondre par email avec SMTP.
- Ajouter un projet dans PostgreSQL.
- Protéger les routes admin avec un token simple.

Ce n'est pas encore une authentification complète avec login, session et rôles. C'est une marche intermédiaire volontaire : assez sécurisé pour le développement local, assez simple pour comprendre le flux complet.

---

## Le principe

Le frontend public continue d'utiliser :

- `GET /projets`
- `GET /projets/:slug`
- `POST /messages`

L'admin utilise des routes séparées :

- `GET /admin/messages`
- `POST /admin/messages/:id/reply`
- `GET /admin/projets`
- `POST /admin/projets`

Toutes ces routes admin demandent un header :

```http
x-admin-token: dev-admin-token
```

Le backend compare ce header avec `ADMIN_TOKEN` dans `.env`.

---

## Variables d'environnement

Dans `mon-backend/.env` :

```env
ADMIN_TOKEN=dev-admin-token
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=contact@example.com
SMTP_PASS=mot-de-passe-smtp
SMTP_FROM=Portfolio <contact@example.com>
```

Dans `mon-premier-projet/.env.local` :

```env
ADMIN_TOKEN=dev-admin-token
```

Important : `ADMIN_TOKEN` côté Next.js n'a pas le préfixe `NEXT_PUBLIC_`. Il reste donc côté serveur, dans les Server Actions.

---

## Backend : protéger l'admin

On crée un guard NestJS qui vérifie le token :

```ts
const token = request.header("x-admin-token");
const expectedToken = this.config.get<string>("ADMIN_TOKEN");

if (!expectedToken || token !== expectedToken) {
  throw new UnauthorizedException("Acces admin refuse");
}
```

Ce guard est appliqué au contrôleur admin avec :

```ts
@UseGuards(AdminTokenGuard)
@Controller("admin")
export class AdminController {}
```

---

## SMTP

Pour envoyer un email, on utilise `nodemailer`.

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

Le `MailService` lit la config SMTP, crée un transporteur, puis envoie :

```ts
await transporter.sendMail({
  from,
  to,
  subject,
  text,
});
```

Si SMTP n'est pas configuré, le backend renvoie une erreur claire. C'est mieux qu'un faux succès.

---

## Frontend : page `/admin`

La page admin est une Server Component Next.js. Elle lit les messages et projets côté serveur avec :

```ts
fetch(`${API_URL}/admin/messages`, {
  headers: {
    "x-admin-token": process.env.ADMIN_TOKEN ?? "",
  },
});
```

Pour créer un projet ou répondre à un message, on utilise des Server Actions. Avantage : le token admin ne part jamais dans le JavaScript du navigateur.

---

## Application sur le projet

À ce stade, le projet a :

1. Une page `mon-premier-projet/app/admin/page.tsx`.
2. Des actions serveur dans `mon-premier-projet/app/admin/actions.ts`.
3. Un module `AdminModule` dans NestJS.
4. Un `MailService` SMTP.
5. Un formulaire public de contact qui affiche une confirmation visible après l'envoi.
6. Un bouton "Me contacter" qui pointe vers `/contact`.

Pour tester :

```bash
cd mon-backend
npm run start:dev
```

Puis :

```bash
cd mon-premier-projet
npm run dev
```

Ouvre :

```txt
http://localhost:3000/admin
```

---

## Résumé

- Les messages sont stockés en base via Prisma.
- L'admin lit les messages depuis PostgreSQL.
- Les réponses passent par SMTP.
- Les projets peuvent être ajoutés depuis l'admin.
- Le token admin est une étape temporaire avant une vraie authentification.

---

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 08 — Bonnes pratiques](./08_bonnes-pratiques.md)
- → Suivant : [Cours 01 Linux — C'est quoi Linux](../05_linux/01_cest-quoi-linux.md)
- Sommaire : [README](../README.md)
