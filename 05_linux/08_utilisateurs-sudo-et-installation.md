# Cours 08 — Utilisateurs, sudo et installation

## Ce qu'on va voir

- L'utilisateur `root` et pourquoi on s'en méfie
- `sudo` : faire ponctuellement les choses en mode admin
- Créer un utilisateur (`adduser`)
- Le gestionnaire de paquets `apt` (Ubuntu/Debian)
- Les paquets utiles : `curl`, `git`, `vim`/`nano`, `htop`, `unzip`
- Installer Node.js proprement avec `nvm`
- Mention de Docker et PostgreSQL

## Le user `root`

Dans Linux, il y a un utilisateur **tout-puissant** qui s'appelle **root**. Il peut :

- Lire et modifier **tous les fichiers**
- Tuer **n'importe quel processus**
- Installer/supprimer des programmes
- Modifier la configuration du système

C'est le **super-administrateur**. Sur Mac/Windows, on dirait "Administrateur" mais en plus puissant.

> Le PID 1 sur ton système (le tout premier processus, `init` ou `systemd`) tourne en root.

### Pourquoi on évite de se connecter directement en root ?

Trois grosses raisons :

1. **Erreur humaine** : un `rm -rf` mal placé en root, et ton serveur est ruiné.
2. **Sécurité** : si tu es piraté pendant que tu es en root, l'attaquant a tous les pouvoirs.
3. **Traçabilité** : tu ne sais plus qui a fait quoi.

**Bonne pratique** : on se connecte avec un user normal, et on demande des droits root **seulement quand nécessaire**, via `sudo`.

## `sudo` — "fais ça en root juste pour cette commande"

`sudo` veut dire "**S**uper **U**ser **DO**".

```bash
sudo apt update              # exécute "apt update" en tant que root
```

Il te demandera **ton** mot de passe (pas celui de root). Si tu es dans le groupe `sudo` (ou `wheel` selon les distros), ça marche.

### Vérifier si tu peux utiliser sudo

```bash
sudo -v
```

S'il te demande ton mot de passe et te le rend (sans erreur), tu es bon.

### Devenir root pour plusieurs commandes

```bash
sudo -i           # tu deviens root jusqu'à ce que tu fasses "exit"
sudo su -         # variante équivalente
```

À utiliser **avec parcimonie**, et `exit` dès que tu as fini.

### Le piège

Quand tu vois sur Internet un tutoriel qui dit `sudo rm -rf /une/commande/longue`, **lis-la deux fois** avant d'appuyer sur Entrée. Avec sudo, tu peux casser ton système.

## Créer un utilisateur

Sur ton serveur tout neuf, tu commenceras par créer un user normal :

```bash
sudo adduser belal
```

Ça te pose quelques questions (mot de passe, nom complet, etc.).

Pour lui donner les droits sudo :

```bash
sudo usermod -aG sudo belal
```

`usermod -aG sudo belal` veut dire : "ajoute (`-a`) belal au **groupe** (`-G`) `sudo`".

Pour vérifier :

```bash
groups belal
```

> Sur certains systèmes (Fedora, RHEL...), le groupe sudoers s'appelle `wheel`. Sur Ubuntu/Debian, c'est `sudo`.

### Supprimer un utilisateur

```bash
sudo deluser belal               # supprime le compte
sudo deluser --remove-home belal # ET son dossier home
```

## Le gestionnaire de paquets : `apt`

Sur Ubuntu/Debian, on installe des programmes avec **APT** (Advanced Package Tool). C'est comme l'App Store, mais en ligne de commande.

### Mettre à jour la liste des paquets

```bash
sudo apt update
```

Ça **télécharge la liste** des paquets disponibles et leurs versions. Ça **n'installe rien**.

### Mettre à jour les paquets installés

```bash
sudo apt upgrade
```

Met à jour vers les dernières versions disponibles (selon ce qu'a téléchargé `apt update`).

> Réflexe **propre** : faire `sudo apt update && sudo apt upgrade` sur un serveur fraîchement loué.

### Installer un paquet

```bash
sudo apt install nom-du-paquet
sudo apt install -y nom-du-paquet     # -y = répond "oui" automatiquement
```

### Supprimer un paquet

```bash
sudo apt remove nom-du-paquet         # supprime le programme
sudo apt purge nom-du-paquet          # supprime aussi sa configuration
sudo apt autoremove                   # nettoie les dépendances inutilisées
```

### Chercher un paquet

```bash
apt search nginx
apt show nginx                  # voir les détails d'un paquet
```

### Sur Mac : Homebrew

L'équivalent sur macOS, c'est **Homebrew** :

```bash
brew install git
brew install node
brew update && brew upgrade
```

## Paquets utiles à installer en premier sur un serveur

```bash
sudo apt update
sudo apt install -y \
  curl \
  wget \
  git \
  vim \
  nano \
  htop \
  unzip \
  build-essential \
  ca-certificates
```

À quoi ça sert :

- **curl, wget** : télécharger des fichiers depuis le web (`curl https://...`).
- **git** : cloner des dépôts (ton portfolio !).
- **vim, nano** : éditeurs de texte. `nano` est plus simple pour débuter, `vim` plus puissant.
- **htop** : moniteur de processus joli (cours 06).
- **unzip** : décompresser des `.zip`.
- **build-essential** : compilateurs (utile pour certaines installations Node natives).
- **ca-certificates** : certificats SSL pour que `curl`, `npm` etc. parlent en HTTPS proprement.

## Installer Node.js (avec `nvm`)

Pour Belal, tu vas installer Node.js sur le serveur. **Évite** `apt install nodejs` direct : la version est souvent vieille.

La méthode propre, c'est **nvm** (Node Version Manager). Il te permet d'avoir plusieurs versions de Node, et de basculer facilement.

### Installer nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

(Vérifie la dernière version sur https://github.com/nvm-sh/nvm avant de copier-coller.)

Ferme et rouvre ton terminal, ou fais :

```bash
source ~/.bashrc
```

Vérifie :

```bash
nvm --version
```

### Installer Node.js LTS

```bash
nvm install --lts            # installe la dernière version LTS (Long Term Support)
nvm use --lts                # l'utilise
nvm alias default lts/*      # la met par défaut

node --version
npm --version
```

### Plusieurs versions

```bash
nvm install 18
nvm install 20
nvm use 20                   # bascule
```

Très pratique quand tu as un vieux projet en Node 18 et un nouveau en Node 20.

## Docker (mention)

**Docker** permet de "mettre dans une boîte" une application avec tout ce qu'il lui faut pour tourner. Tu déposes la boîte sur le serveur, tu la lances, ça marche.

Pour l'installer (Ubuntu) :

```bash
# Installation officielle (résumée)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker belal     # pour ne plus avoir besoin de sudo
```

On ne l'utilisera pas dans ce cours pour rester simple. Mais sache que pour un déploiement plus pro, **Docker + docker-compose** est la voie royale.

## PostgreSQL (rappel et mise à jour)

Tu as appris PostgreSQL au cours précédent. Sur Ubuntu :

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql        # démarre au boot

# Créer un user et une base
sudo -u postgres psql
# dans psql :
# CREATE USER app_user WITH PASSWORD 'mot_de_passe_solide';
# CREATE DATABASE portfolio OWNER app_user;
# \q
```

> `systemctl` sert à démarrer/arrêter les services. On en reparle au cours 10 avec systemd.

## Mini-récap commandes installation

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Outils de base
sudo apt install -y curl git vim htop unzip build-essential

# Node via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql

# Nginx (pour le cours 10)
sudo apt install -y nginx
sudo systemctl enable --now nginx
```

## Résumé

- `root` est tout-puissant. On évite de s'y connecter directement.
- `sudo` = exécuter UNE commande en root. Demande ton mot de passe.
- `adduser` crée un user. `usermod -aG sudo` lui donne les droits admin.
- `apt` est le gestionnaire de paquets sur Ubuntu/Debian.
- Réflexes : `sudo apt update && sudo apt upgrade -y`.
- Node.js : on l'installe via **nvm**, pas via apt.
- Brew sur Mac. apt sur Ubuntu/Debian. Le principe est le même.

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 07](./07_variables-d-environnement.md)
- → Suivant : [Cours 09](./09_ssh-et-serveurs-distants.md)
- Sommaire : [README](../README.md)
