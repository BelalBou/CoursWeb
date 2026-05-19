# Cours 07 — Les variables d'environnement

## Ce qu'on va voir

- C'est quoi une variable d'environnement
- Lire une variable : `echo $VAR`
- Définir une variable : `export`
- Les fichiers `.bashrc` / `.zshrc` / `.profile` / `/etc/environment`
- Le `.env` de ton projet Node (et pourquoi Next.js et NestJS adorent ça)
- Pourquoi on configure son projet par variables d'env, et pas en dur

## C'est quoi une variable d'environnement ?

Imagine que sur ton bureau il y ait des **post-its** avec des informations utiles :

- "Ton login : belal"
- "Là où sont tes Documents : /home/belal/Documents"
- "Mot de passe DB : super-secret"

Tous les programmes qui tournent peuvent **lire ces post-its**. C'est exactement ça, une variable d'environnement.

Plus formellement : une variable d'environnement, c'est un **couple `NOM=valeur`** disponible pour tous les programmes lancés depuis ton shell.

## Voir les variables existantes

### Voir une variable précise

```bash
echo $HOME
# /home/belal

echo $USER
# belal

echo $PATH
# /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

echo $SHELL
# /bin/bash
```

Le **`$`** devant le nom dit au shell : "remplace par la valeur de la variable".

### Voir TOUTES les variables

```bash
env             # toutes les variables d'environnement
printenv        # pareil, autre commande
```

## Quelques variables importantes

| Variable | Sens |
|---|---|
| `HOME` | ton dossier home (`/home/belal`) |
| `USER` | ton login |
| `SHELL` | le shell par défaut |
| `PATH` | la liste des dossiers où sont les programmes |
| `LANG` | ta langue (ex: `fr_FR.UTF-8`) |
| `EDITOR` | l'éditeur préféré (`vim`, `nano`, `code`) |
| `PWD` | le dossier courant |

### Focus sur `PATH`

`PATH` est la **liste des endroits où le shell cherche les commandes**, séparés par `:`.

```bash
echo $PATH
# /usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
```

Quand tu tapes `ls`, le shell cherche dans chaque dossier du PATH, dans l'ordre, jusqu'à trouver le programme `ls`.

```bash
which ls           # te dit où il a trouvé ls
# /usr/bin/ls
```

> Si une commande ne marche pas alors qu'elle devrait, c'est souvent que son dossier n'est pas dans le PATH.

## Définir une variable

### Pour ce shell uniquement (temporaire)

```bash
MA_VAR="bonjour"
echo $MA_VAR
# bonjour
```

Mais **les programmes lancés depuis ce shell ne la voient pas** ! Il faut l'**exporter** :

```bash
export MA_VAR="bonjour"
```

Maintenant, ta variable est dans l'environnement, et tous les programmes lancés depuis ce shell peuvent la lire.

### Vérifier

```bash
echo $MA_VAR
# bonjour
```

### Désactiver

```bash
unset MA_VAR
```

> **Important** : ces variables disparaissent quand tu fermes le terminal. Si tu veux qu'elles soient là à chaque ouverture, il faut les écrire dans un fichier de config.

## Les fichiers de config du shell

Quand tu ouvres un terminal, le shell **lit certains fichiers** pour savoir comment se configurer. Tu peux y mettre tes variables, alias, etc.

### Pour bash

- **`~/.bashrc`** : lu à chaque ouverture d'un shell **interactif**.
- **`~/.profile`** ou **`~/.bash_profile`** : lu à la **connexion** (login).

### Pour zsh

- **`~/.zshrc`** : équivalent de `.bashrc`.
- **`~/.zprofile`** : équivalent de `.profile`.

### Mettre une variable à demeure

Ouvre `~/.bashrc` (ou `~/.zshrc`) :

```bash
nano ~/.bashrc
```

Ajoute à la fin :

```bash
export EDITOR="code"
export MON_DOSSIER_PROJETS="$HOME/Projets"
```

Sauvegarde (`Ctrl+O`, Entrée, `Ctrl+X` dans nano).

Pour appliquer **sans rouvrir le terminal** :

```bash
source ~/.bashrc
```

`source` veut dire "exécute ce fichier dans le shell actuel".

### `/etc/environment` — variables globales pour tous les utilisateurs

Sur un serveur, parfois on met des variables qui doivent exister pour **tout le monde**, dans `/etc/environment` :

```bash
sudo nano /etc/environment
```

Format ici (différent : pas de `export`) :

```
NODE_ENV=production
TZ=Europe/Paris
```

Mais en pratique, on évite de mettre les **secrets** ici (mot de passe DB, etc.). Pourquoi ? Parce que tous les utilisateurs du serveur le voient. On les met plutôt dans le `.env` du projet, qu'on protège avec les bonnes permissions.

## Le `.env` de ton projet Node

Tu en as déjà vu en faisant Next.js et NestJS. Rappel rapide.

Un fichier `.env` à la racine de ton projet :

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/portfolio"
JWT_SECRET="un-long-secret-aleatoire"
NEXT_PUBLIC_API_URL="https://api.monsite.fr"
PORT=3001
```

### Comment c'est chargé ?

- **Next.js** charge automatiquement `.env`, `.env.local`, `.env.production` (selon l'environnement).
- **NestJS** utilise `@nestjs/config`, qui lit le `.env` au démarrage.
- Avec **dotenv**, on fait :

```ts
import 'dotenv/config'

const dbUrl = process.env.DATABASE_URL
```

Note : depuis Node 20+, tu peux aussi faire :

```bash
node --env-file=.env server.js
```

Sans aucune dépendance.

### Pourquoi `.env` et pas en dur ?

1. **Sécurité** : tes secrets ne se retrouvent pas dans Git. Tu mets `.env` dans `.gitignore`.
2. **Flexibilité** : la même app marche en local et en prod, juste en changeant les variables.
3. **Bonne pratique** : c'est le principe **12-Factor App** (la "config" est séparée du "code").
4. **Sur le serveur**, tu peux passer les variables via `/etc/environment`, via le service systemd, ou via un fichier `.env` du projet.

### Variables publiques vs privées

Avec Next.js notamment :

- `DATABASE_URL` : **privée**, jamais envoyée au navigateur.
- `NEXT_PUBLIC_API_URL` : **publique**, envoyée au navigateur (préfixe `NEXT_PUBLIC_`).

Ne mets **jamais** un secret dans une variable `NEXT_PUBLIC_*` !

## Cas concret pour ton portfolio

### En local

Tu as un `.env.local` dans `mon-premier-projet/` :

```bash
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

Et un `.env` dans `mon-backend/` :

```bash
DATABASE_URL="postgresql://belal:dev@localhost:5432/portfolio_dev"
JWT_SECRET="dev-secret-pas-grave-en-local"
PORT=3001
```

### Sur le serveur (prod)

Sur ton VPS, tu auras un `.env` sur place avec les vraies valeurs :

```bash
DATABASE_URL="postgresql://app_user:VRAI-mot-de-passe@localhost:5432/portfolio"
JWT_SECRET="UN-VRAI-SECRET-LONG-ET-ALEATOIRE"
NEXT_PUBLIC_API_URL="https://api.monsite.fr"
NODE_ENV="production"
PORT=3001
```

Permissions strictes :

```bash
chmod 600 .env             # seul le proprio peut lire
```

## Mini-pratique

```bash
# 1. Définir une variable et la lire
export MA_VILLE="Paris"
echo "Je vis à $MA_VILLE"

# 2. La passer à un programme
node -e "console.log('Ville:', process.env.MA_VILLE)"

# 3. La rendre persistante
echo 'export MA_VILLE="Paris"' >> ~/.bashrc
source ~/.bashrc
```

## Résumé

- Une variable d'environnement = un post-it `NOM=valeur` que tous les programmes peuvent lire.
- `echo $VAR` pour lire, `export VAR=valeur` pour définir.
- `~/.bashrc` (ou `~/.zshrc`) : config persistante de ton shell.
- `/etc/environment` : variables pour tout le système (sans secrets).
- `.env` à la racine de ton projet Node : secrets et config, jamais committé sur Git.
- Bonne pratique : tout ce qui change entre local et prod passe par variables d'env.

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 06](./06_processus.md)
- → Suivant : [Cours 08](./08_utilisateurs-sudo-et-installation.md)
- Sommaire : [README](../README.md)
