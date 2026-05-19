# Cours 10 — Déployer le projet en production

## Ce qu'on va voir

C'est le grand cours final. On rassemble tout ce que tu as appris pour mettre **ton portfolio en ligne** sur un vrai serveur, accessible depuis Internet.

Plan :

1. Le schéma général (qui parle à qui ?)
2. Préparer le serveur
3. Cloner ton code
4. Builder Next.js et NestJS
5. Faire tourner les apps avec PM2 (ou systemd)
6. Configurer Nginx en **reverse proxy**
7. HTTPS avec Let's Encrypt
8. L'option simple : Vercel + Railway/Render
9. Bonnes pratiques

## Le schéma général

```
                                Internet
                                   |
                              +----+----+
                              |   DNS   |     monsite.fr  → 192.0.2.42
                              +----+----+
                                   |
                                   v
                       +--------------------+
                       |       VPS          |
                       |  (192.0.2.42)      |
                       |                    |
                       |  +--------------+  |
                       |  |    Nginx     |  | (ports 80, 443)
                       |  | reverse proxy|  |
                       |  +-----+--+-----+  |
                       |        |  |        |
                       |        v  v        |
                       |  +--------+ +-------+ |
                       |  | Next.js| | NestJS|
                       |  | :3000  | | :3001 |
                       |  +--------+ +---+---+
                       |                  |   |
                       |                  v   |
                       |             +---------+
                       |             |Postgres |
                       |             |  :5432  |
                       |             +---------+
                       +----------------------+
```

- **Le navigateur de ton visiteur** demande `https://monsite.fr`.
- Le **DNS** transforme le nom en IP de ton VPS.
- **Nginx** (port 443 HTTPS, port 80 HTTP) reçoit la demande.
- Selon le chemin (`/` ou `/api/`), Nginx la passe à **Next.js** (port 3000) ou **NestJS** (port 3001).
- Le NestJS parle à **PostgreSQL** (port 5432, en local sur le serveur).

## Étape 1 — Préparer le serveur

Tu as suivi le cours 09 : tu as un VPS Ubuntu, ton user `belal`, ta clé SSH, le firewall.

Connecte-toi :

```bash
ssh belal@<IP>
```

Vérifie que tout est en place :

```bash
node --version       # via nvm
psql --version       # PostgreSQL
nginx -v             # Nginx
git --version
```

Si l'un manque, fais le cours 08 pour l'installer.

## Étape 2 — Préparer la base de données

Crée l'utilisateur et la base pour ton portfolio :

```bash
sudo -u postgres psql
```

Dans psql :

```sql
CREATE USER app_user WITH PASSWORD 'mot-de-passe-solide';
CREATE DATABASE portfolio OWNER app_user;
\q
```

Note la chaîne de connexion :

```
postgresql://app_user:mot-de-passe-solide@localhost:5432/portfolio
```

## Étape 3 — Cloner le code

Crée un dossier pour les apps :

```bash
sudo mkdir -p /var/www
sudo chown belal:belal /var/www
cd /var/www

git clone https://github.com/belal/portfolio.git
git clone https://github.com/belal/backend.git
```

(Adapte les URLs aux tiens.)

## Étape 4 — Configurer les variables d'environnement

### Backend (`/var/www/backend/.env`)

```bash
cd /var/www/backend
nano .env
```

```
DATABASE_URL="postgresql://app_user:mot-de-passe-solide@localhost:5432/portfolio"
JWT_SECRET="UN-VRAI-SECRET-LONG-ET-ALEATOIRE"
PORT=3001
NODE_ENV=production
```

Permissions :

```bash
chmod 600 .env
```

### Frontend (`/var/www/portfolio/.env.production`)

```bash
cd /var/www/portfolio
nano .env.production
```

```
NEXT_PUBLIC_API_URL="https://api.monsite.fr"
```

## Étape 5 — Installer dépendances et builder

### Backend (NestJS + Prisma)

```bash
cd /var/www/backend
npm ci                          # installation propre des dépendances
npx prisma migrate deploy       # applique les migrations en prod
npm run build                   # compile TypeScript dans dist/
```

### Frontend (Next.js)

```bash
cd /var/www/portfolio
npm ci
npm run build                   # crée le dossier .next/
```

> Important : **ne fais jamais `npm install`** en prod, mais **`npm ci`** : ça installe **exactement** ce qu'il y a dans le `package-lock.json`, plus reproductible.

## Étape 6 — Faire tourner les apps avec PM2

`PM2` garde tes apps en vie : si elles plantent, il les redémarre. Si tu redémarres le serveur, il les relance.

### Installer PM2 globalement

```bash
npm install -g pm2
```

### Lancer le backend

```bash
cd /var/www/backend
pm2 start dist/main.js --name backend
```

### Lancer le frontend

Pour Next.js en prod, on lance avec `npm start` (qui appelle `next start`) :

```bash
cd /var/www/portfolio
pm2 start npm --name frontend -- start
```

### Vérifier

```bash
pm2 list
pm2 logs                # logs en direct
pm2 logs backend        # logs d'une app précise
pm2 monit               # monitoring joli
```

### Faire en sorte que ça redémarre au reboot

```bash
pm2 startup             # te donne une commande à copier-coller (avec sudo)
# Suis l'instruction donnée
pm2 save                # sauvegarde la liste des apps
```

Maintenant, même si le serveur redémarre, tes apps reviennent toutes seules.

### Alternative : systemd

Si tu préfères, `systemd` (le gestionnaire de services de Linux) peut faire pareil.

Crée `/etc/systemd/system/backend.service` :

```ini
[Unit]
Description=Mon backend NestJS
After=network.target postgresql.service

[Service]
Type=simple
User=belal
WorkingDirectory=/var/www/backend
EnvironmentFile=/var/www/backend/.env
ExecStart=/home/belal/.nvm/versions/node/v20.11.0/bin/node dist/main.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Puis :

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now backend
sudo systemctl status backend
```

PM2 ou systemd : **les deux marchent**. PM2 est plus simple pour Node.

## Étape 7 — Configurer Nginx en reverse proxy

Nginx va recevoir le trafic web (ports 80 et 443) et le rediriger vers tes apps.

Crée `/etc/nginx/sites-available/monsite.fr` :

```bash
sudo nano /etc/nginx/sites-available/monsite.fr
```

Contenu minimal (HTTP seulement, on ajoutera HTTPS après) :

```nginx
# Frontend Next.js
server {
    listen 80;
    server_name monsite.fr www.monsite.fr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Backend NestJS (sous-domaine api)
server {
    listen 80;
    server_name api.monsite.fr;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Active le site :

```bash
sudo ln -s /etc/nginx/sites-available/monsite.fr /etc/nginx/sites-enabled/
sudo nginx -t                  # vérifie la config
sudo systemctl reload nginx
```

## Étape 8 — DNS

Va chez ton registrar (le site où tu as acheté `monsite.fr`).
Crée des enregistrements **A** (Address) :

| Type | Nom | Valeur |
|---|---|---|
| A | @ (ou monsite.fr) | 192.0.2.42 |
| A | www | 192.0.2.42 |
| A | api | 192.0.2.42 |

> La propagation DNS peut prendre quelques minutes à quelques heures. Vérifie avec : `dig monsite.fr` ou `nslookup monsite.fr`.

Une fois propagé, `http://monsite.fr` devrait afficher ton portfolio (en HTTP, pas encore HTTPS).

## Étape 9 — HTTPS gratuit avec Let's Encrypt

**HTTPS** = connexion chiffrée. Indispensable. Et gratuit grâce à **Let's Encrypt** + l'outil **Certbot**.

```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d monsite.fr -d www.monsite.fr -d api.monsite.fr
```

Certbot va :

1. Vérifier que tu contrôles bien ces domaines.
2. Obtenir un certificat SSL.
3. **Modifier ta config Nginx** pour activer HTTPS.
4. Configurer le renouvellement automatique (les certifs durent 90 jours).

Après, ta config Nginx ressemblera à :

```nginx
server {
    listen 443 ssl http2;
    server_name monsite.fr www.monsite.fr;

    ssl_certificate /etc/letsencrypt/live/monsite.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/monsite.fr/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        # ... mêmes proxy_set_header qu'avant
    }
}

server {
    listen 80;
    server_name monsite.fr www.monsite.fr;
    return 301 https://$host$request_uri;     # redirige HTTP vers HTTPS
}
```

Vérifier le renouvellement :

```bash
sudo certbot renew --dry-run
```

## L'option simple : Vercel + Railway/Render

Si gérer un VPS te paraît lourd, voilà l'alternative **plus simple** (mais payante au-delà du gratuit) :

- **Front Next.js** sur **Vercel** : tu connectes ton repo Git, ils s'occupent de tout. HTTPS, scaling, déploiement à chaque push. Gratuit pour les petits projets.
- **Back NestJS + PostgreSQL** sur **Railway** ou **Render** : tu connectes ton repo, ils déploient et hébergent. Gratuit limité, payant ensuite.

Avantages : zéro admin système.
Inconvénients : moins de contrôle, dépendance à un fournisseur, coûts qui peuvent monter.

> Maintenant que tu sais faire à la main, tu peux choisir en connaissance de cause.

## Bonnes pratiques

### Variables d'environnement

- Jamais de secret dans Git. `.env` est dans `.gitignore`.
- Sur le serveur : `chmod 600 .env`.
- Différents secrets en dev et en prod.

### Logs

- Centralise les logs : `pm2 logs`, ou `journalctl -u backend` (systemd).
- Surveille les logs Nginx : `/var/log/nginx/access.log` et `/var/log/nginx/error.log`.
- Configure la **rotation des logs** pour qu'ils ne remplissent pas le disque (PM2 le fait automatiquement avec `pm2 install pm2-logrotate`).

### Monitoring basique

- `htop` pour voir CPU/RAM en direct.
- `df -h` pour voir l'espace disque (très important !).
- `pm2 monit` pour surveiller tes apps.
- Pour aller plus loin : Uptime Kuma, Grafana, etc.

### Sauvegardes

- **Backup PostgreSQL** régulier :

```bash
pg_dump -U app_user portfolio > backup-$(date +%Y%m%d).sql
```

À automatiser via `cron` (planificateur de tâches Linux).

### Mises à jour

- `sudo apt update && sudo apt upgrade -y` régulièrement.
- Mets à jour Node (via `nvm install --lts`).
- Surveille les versions de tes dépendances (`npm outdated`, `npm audit`).

### Workflow de redéploiement

Quand tu modifies ton code et veux mettre à jour :

```bash
ssh belal@<IP>
cd /var/www/backend
git pull
npm ci
npx prisma migrate deploy
npm run build
pm2 restart backend

cd /var/www/portfolio
git pull
npm ci
npm run build
pm2 restart frontend
```

Tu peux **scripter** ça dans un fichier `deploy.sh` à la racine du serveur :

```bash
#!/bin/bash
set -e        # arrête au premier souci

cd /var/www/backend
git pull
npm ci
npx prisma migrate deploy
npm run build
pm2 restart backend

cd /var/www/portfolio
git pull
npm ci
npm run build
pm2 restart frontend

echo "Deploy OK"
```

```bash
chmod +x deploy.sh
./deploy.sh
```

## Récap des commandes du déploiement

```bash
# Sur le serveur
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx postgresql postgresql-contrib certbot python3-certbot-nginx ufw

# Node via nvm (cours 08)
# Database setup (cours 08)

# Code
cd /var/www
git clone <front> portfolio && git clone <back> backend
cd backend && npm ci && npx prisma migrate deploy && npm run build
cd ../portfolio && npm ci && npm run build

# Process manager
npm install -g pm2
pm2 start dist/main.js --name backend
pm2 start npm --name frontend -- start
pm2 startup && pm2 save

# Nginx
sudo nano /etc/nginx/sites-available/monsite.fr
sudo ln -s /etc/nginx/sites-available/monsite.fr /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# HTTPS
sudo certbot --nginx -d monsite.fr -d www.monsite.fr -d api.monsite.fr
```

## Résumé

- Un déploiement, c'est : **VPS** + **DNS** + **reverse proxy (Nginx)** + **process manager (PM2)** + **HTTPS (Let's Encrypt)**.
- On clone le code avec git, on installe avec `npm ci`, on build, on lance via PM2.
- Nginx redirige les ports 80/443 vers tes apps locales (3000, 3001).
- Certbot gère HTTPS automatiquement.
- Variables d'env dans `.env` avec `chmod 600`.
- Workflow de mise à jour : git pull, build, restart.
- Alternative simple : Vercel + Railway/Render.

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 09](./09_ssh-et-serveurs-distants.md)
- Bravo, tu as fini le parcours ! Retour au [sommaire](../README.md) pour reprendre n'importe quel cours.
- Sommaire : [README](../README.md)
