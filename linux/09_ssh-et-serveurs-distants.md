# Cours 09 — SSH et serveurs distants

## Ce qu'on va voir

- C'est quoi un VPS
- C'est quoi SSH
- Se connecter : `ssh user@ip`
- Les **clés SSH** : pourquoi c'est mieux qu'un mot de passe
- Générer et installer ta clé
- Copier des fichiers : `scp`, `rsync`
- Sécuriser un serveur fraîchement loué (firewall, désactiver mot de passe SSH)

## C'est quoi un VPS ?

VPS = **Virtual Private Server**.

Imagine un gros ordinateur très puissant dans un datacenter (un grand entrepôt rempli de serveurs).
On le découpe en **plusieurs petits serveurs virtuels** : chacun a son propre OS, ses propres ressources (CPU, RAM, disque). Chacun se croit seul.

Tu **loues** un de ces petits serveurs au mois. Pour environ 4-10 €/mois, tu as une vraie machine Linux qui tourne **24h/24** dans le datacenter.

Hébergeurs populaires :

- **Hetzner** : très bon rapport qualité-prix (Allemagne).
- **DigitalOcean** : interface très simple.
- **OVH / Scaleway** : français.
- **Vultr, Linode, Contabo** : autres options.

Quand tu commandes un VPS, on te donne :

- Une **adresse IP publique** (ex: `192.0.2.42`)
- Un **utilisateur** (souvent `root`)
- Un **mot de passe** ou tu fournis ta **clé SSH**

## C'est quoi SSH ?

SSH = **Secure SHell**.

C'est un protocole qui te permet de **te connecter à un serveur distant** comme si tu étais devant lui, en ouvrant un terminal **chiffré**.

Analogie : c'est comme téléphoner à ton serveur, mais avec une ligne sécurisée et un super traducteur qui fait passer tes commandes et te ramène les réponses.

## Se connecter en SSH

```bash
ssh belal@192.0.2.42
```

- `belal` : nom d'utilisateur sur le serveur
- `192.0.2.42` : adresse IP du serveur

Première fois, tu auras un message du genre :

```
The authenticity of host '192.0.2.42' can't be established.
ED25519 key fingerprint is SHA256:...
Are you sure you want to continue connecting (yes/no)?
```

Tu tapes `yes`. Ton ordi enregistre l'empreinte du serveur dans `~/.ssh/known_hosts` pour la prochaine fois.

Ensuite il te demande le mot de passe (si pas encore de clé SSH installée).

Une fois connecté, **tu es dans le shell du serveur**. Toutes tes commandes s'exécutent **là-bas**, pas chez toi.

Pour quitter : `exit` (ou `Ctrl+D`).

### Sur un port différent

Par défaut, SSH écoute sur le port 22. Parfois, l'admin a changé :

```bash
ssh -p 2222 belal@192.0.2.42
```

## Les clés SSH (le bon réflexe)

Le mot de passe SSH, c'est OK pour débuter. Mais sur un vrai serveur, on utilise des **clés SSH**. Pourquoi ?

- **Plus sûr** : une clé fait des centaines de caractères aléatoires. Impossible à deviner.
- **Pas de saisie de mot de passe** à chaque connexion.
- **Tu peux désactiver les mots de passe** côté serveur : les robots qui essayent des millions de combinaisons sont bloqués.

### Comment ça marche ?

Une clé SSH, c'est **2 fichiers** qui vont ensemble :

- **Clé privée** (`id_ed25519`) : reste **CHEZ TOI**. Personne ne doit la voir.
- **Clé publique** (`id_ed25519.pub`) : on peut la mettre **partout**. Tu la donnes au serveur.

Quand tu te connectes, le serveur te lance un défi avec la clé publique, et seule ta clé privée peut répondre. C'est comme une serrure (publique) et sa clé (privée).

### Générer une clé SSH

```bash
ssh-keygen -t ed25519 -C "ton.email@example.com"
```

Décortiquage :

- `ssh-keygen` : la commande
- `-t ed25519` : algorithme moderne et rapide (préfère-le à `rsa`)
- `-C "..."` : un commentaire (souvent ton email, juste pour t'aider à reconnaître)

Il te demande où sauvegarder (laisse l'emplacement par défaut, `~/.ssh/id_ed25519`), et une **passphrase** (mot de passe pour protéger ta clé privée si on te vole ton ordi).

Tu obtiens **deux fichiers** :

```bash
ls -la ~/.ssh/
# id_ed25519        (clé privée, NE PARTAGE JAMAIS)
# id_ed25519.pub    (clé publique, à donner aux serveurs)
```

Sécurise les permissions :

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

### Installer ta clé sur le serveur

Méthode automatique (depuis ton PC) :

```bash
ssh-copy-id belal@192.0.2.42
```

Ça copie ta clé publique dans `~/.ssh/authorized_keys` côté serveur. La prochaine connexion :

```bash
ssh belal@192.0.2.42
# pas de mot de passe demandé !
```

Méthode manuelle :

1. Sur ton PC, affiche ta clé publique :

```bash
cat ~/.ssh/id_ed25519.pub
```

2. Copie le contenu (qui ressemble à `ssh-ed25519 AAAA... ton.email@...`).

3. Sur le serveur :

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Colle ta clé publique sur une nouvelle ligne, sauvegarde
chmod 600 ~/.ssh/authorized_keys
```

### Le fichier `~/.ssh/config` — gagner du temps

Plutôt que retaper `ssh -p 2222 belal@192.0.2.42` à chaque fois, tu mets ça dans `~/.ssh/config` :

```
Host monserveur
    HostName 192.0.2.42
    User belal
    Port 22
    IdentityFile ~/.ssh/id_ed25519
```

Et tu te connectes simplement :

```bash
ssh monserveur
```

## Copier des fichiers : `scp` et `rsync`

### `scp` — secure copy

`scp` (secure copy) copie un fichier entre ton PC et le serveur, en SSH.

```bash
# De chez toi vers le serveur
scp index.html belal@192.0.2.42:/home/belal/

# Du serveur vers chez toi
scp belal@192.0.2.42:/home/belal/log.txt ./

# Un dossier entier (avec -r)
scp -r mon-projet/ belal@192.0.2.42:/home/belal/
```

### `rsync` — mieux pour synchroniser

`rsync` est plus malin : il ne recopie que ce qui a changé. Idéal pour synchroniser un projet.

```bash
rsync -avz mon-projet/ belal@192.0.2.42:/home/belal/mon-projet/
```

Options :

- `-a` : "archive", préserve permissions, dates, etc.
- `-v` : verbose (affiche ce qu'il fait)
- `-z` : compresse pendant le transfert (utile sur connexion lente)

> En vrai, pour déployer, on utilise plutôt **`git pull`** côté serveur (cours 10). Mais `scp`/`rsync` restent très utiles pour des fichiers ponctuels.

## Sécuriser un VPS fraîchement loué

Voici la **checklist de base** dès que tu reçois ton serveur. Tout ça fait gagner énormément en sécurité.

### 1. Se connecter en root et créer un user normal

```bash
# Depuis chez toi
ssh root@192.0.2.42
```

Sur le serveur :

```bash
adduser belal
usermod -aG sudo belal
```

### 2. Copier ta clé SSH pour ce nouvel user

Toujours sur le serveur, en root :

```bash
mkdir -p /home/belal/.ssh
cp ~/.ssh/authorized_keys /home/belal/.ssh/
chown -R belal:belal /home/belal/.ssh
chmod 700 /home/belal/.ssh
chmod 600 /home/belal/.ssh/authorized_keys
```

(Ou alors, depuis ton PC, après avoir créé belal : `ssh-copy-id belal@192.0.2.42`.)

### 3. Tester la connexion avec belal

**Sans fermer la session root**, ouvre un autre terminal chez toi :

```bash
ssh belal@192.0.2.42
sudo -v        # tester sudo
```

Si ça marche, tu peux passer à l'étape suivante.

### 4. Désactiver le login root et l'authentification par mot de passe

Sur le serveur (avec belal et sudo) :

```bash
sudo nano /etc/ssh/sshd_config
```

Cherche et modifie :

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Recharge SSH :

```bash
sudo systemctl restart ssh
```

> **Attention** : avant de fermer, vérifie que tu peux toujours te reconnecter avec ta clé. Sinon, tu seras enfermé dehors.

### 5. Le firewall : `ufw`

`ufw` = **Uncomplicated Firewall**. Il ferme tous les ports sauf ceux que tu autorises.

```bash
sudo apt install -y ufw

sudo ufw default deny incoming      # par défaut, on bloque tout ce qui entre
sudo ufw default allow outgoing     # mais on laisse sortir

sudo ufw allow ssh                  # OBLIGATOIRE sinon tu te coupes
sudo ufw allow 80/tcp               # HTTP
sudo ufw allow 443/tcp              # HTTPS

sudo ufw enable                     # active le firewall
sudo ufw status                     # vérifier
```

> **Important** : `sudo ufw allow ssh` AVANT `sudo ufw enable`. Sinon, tu te coupes l'accès au serveur.

### 6. Installer fail2ban (bonus)

`fail2ban` regarde les tentatives de connexion qui échouent et bannit les IP qui en font trop.

```bash
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban
```

## Cas concret : ton premier déploiement (échauffement)

Tu loues un VPS. Tu reçois IP + mot de passe root. Voilà la routine :

```bash
# 1. Connexion (chez toi)
ssh root@<IP>

# 2. Création user
adduser belal
usermod -aG sudo belal

# 3. Copie de la clé SSH (chez toi, dans un autre terminal)
ssh-copy-id belal@<IP>

# 4. Reconnexion en belal
ssh belal@<IP>

# 5. Mise à jour
sudo apt update && sudo apt upgrade -y

# 6. Outils de base
sudo apt install -y curl git vim htop ufw fail2ban

# 7. Firewall
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 8. Désactiver login root + mots de passe
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no
sudo systemctl restart ssh
```

Ton serveur est maintenant **propre et sécurisé**. On peut commencer à y déployer ton portfolio (cours 10).

## Résumé

- VPS = un petit serveur Linux loué chez un hébergeur.
- SSH = se connecter à distance en mode chiffré : `ssh user@ip`.
- Clés SSH (`ssh-keygen`, `ssh-copy-id`) : plus sûr et plus pratique que les mots de passe.
- `~/.ssh/config` te fait gagner du temps.
- `scp` / `rsync` pour copier des fichiers.
- Sécurise toujours un nouveau VPS : user non-root, clés SSH, désactiver login root et mot de passe, firewall `ufw`.

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 08](./08_utilisateurs-sudo-et-installation.md)
- → Suivant : [Cours 10](./10_deployer-le-projet-en-production.md)
- Sommaire : [README](../README.md)
