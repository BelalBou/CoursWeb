# Cours 06 — Les processus

## Ce qu'on va voir

- C'est quoi un processus
- Voir ce qui tourne : `ps`, `top`, `htop`
- Tuer un processus : `kill`, `kill -9`
- Lancer en arrière-plan : `&`, `jobs`, `fg`, `bg`
- `Ctrl+C`, `Ctrl+Z`
- Sessions persistantes : `screen` et `tmux`
- Petit mot sur PM2 (qu'on retrouvera au déploiement)

## C'est quoi un processus ?

Un **processus**, c'est un **programme en train de tourner**.

Analogie : si une recette de cuisine c'est le programme (le code), alors un processus c'est le moment où tu cuisines vraiment, avec les casseroles et le four allumés.

Sur ton PC, en ce moment, des centaines de processus tournent. Chrome, Spotify, ton terminal, ton serveur Next.js, etc. Chacun a un **PID** (Process IDentifier), un numéro unique attribué par Linux.

## Voir les processus qui tournent

### `ps` — un instantané

```bash
ps              # processus de TON terminal seulement
ps aux          # TOUS les processus du système
ps aux | grep node    # filtrer pour ne garder que ceux qui parlent de "node"
```

Exemple de ligne de `ps aux` :

```
belal    12345  0.5  1.2  234567  98765 ?  Sl  10:30  0:05 node /home/belal/projet/server.js
```

Décortiquons un peu :

- **belal** : utilisateur qui a lancé le processus
- **12345** : PID
- **0.5** : % de CPU utilisé
- **1.2** : % de RAM utilisée
- **node /home/...** : la commande qui tourne

### `top` — vue dynamique

```bash
top
```

Affiche les processus, **mis à jour en direct**, triés par usage CPU.

Touches utiles dans `top` :

- `q` : quitter
- `M` : trier par mémoire
- `P` : trier par CPU
- `k` : tuer un processus (te demande le PID)

### `htop` — comme `top`, mais en mieux

```bash
htop
```

Plus joli, plus lisible, navigation au clavier, on voit les barres de CPU par coeur.

`htop` n'est pas installé par défaut partout :

```bash
sudo apt install htop
```

> Sur un serveur, `htop` est ton meilleur ami pour comprendre ce qui consomme.

## Tuer un processus

Parfois, un programme bloque, plante, ou ne veut pas s'arrêter. Il faut le **tuer** (kill).

### `kill <PID>` — demander gentiment

```bash
kill 12345
```

Envoie le **signal TERM** au processus. Ça lui dit "termine-toi proprement".
La plupart des programmes obéissent, ferment leurs fichiers, etc.

### `kill -9 <PID>` — couper l'électricité

```bash
kill -9 12345
```

Envoie le **signal KILL**. Le processus est **immédiatement** arrêté, sans qu'il puisse rien sauvegarder. À utiliser **seulement** si `kill` simple ne marche pas.

### `pkill` — tuer par nom

```bash
pkill node              # tue tous les processus dont le nom contient "node"
pkill -9 node           # version forte
```

Pratique mais **dangereux** : tu peux tuer plus que ce que tu voulais.

### `killall` — comme `pkill`

```bash
killall node
```

## Lancer en arrière-plan

Quand tu lances une commande, ton terminal est "occupé" jusqu'à la fin. Avec `&`, tu peux la lancer **en arrière-plan** et continuer à taper d'autres commandes.

```bash
npm run dev &
```

Le terminal te dit :

```
[1] 23456
```

`[1]` = numéro du job, `23456` = PID.

### `jobs` — voir les jobs en arrière-plan

```bash
jobs
# [1]+ Running    npm run dev &
```

### `fg` — ramener un job au premier plan

```bash
fg %1
```

Le job revient devant toi, tu peux interagir avec.

### `bg` — relancer un job en arrière-plan

Si tu as mis en pause un programme avec `Ctrl+Z`, tu peux le relancer en fond avec `bg`.

## Les raccourcis utiles

### `Ctrl + C` — interrompre

Tu lances une commande qui tourne, tu fais `Ctrl+C` : elle s'arrête (signal INT).
Marche pour quasi toutes les commandes : `tail -f`, un script qui tourne, un serveur de dev, etc.

### `Ctrl + Z` — mettre en pause

Le programme est suspendu (gelé). Tu reviens au prompt.

```bash
npm run dev          # tourne
# Ctrl + Z
# [1]+ Stopped    npm run dev

bg %1                # je le relance en fond
fg %1                # je le ramène au premier plan
```

### `Ctrl + D` — fin de saisie / déconnexion

- Dans une commande qui lit ton clavier : signale "fin".
- Dans un terminal vide : équivalent à `exit`.

## Sessions persistantes : `screen` et `tmux`

Problème classique : tu te connectes à un serveur en SSH, tu lances ton serveur Node.js... tu fermes ton ordi, le serveur s'arrête. Pourquoi ?

Parce que le processus est **lié à ta session SSH**. Quand tu te déconnectes, il meurt.

Solution : `screen` ou `tmux`. Ce sont des **multiplexeurs de terminal** : tu crées une session qui continue à vivre même si tu te déconnectes.

### `tmux` (recommandé)

```bash
sudo apt install tmux

tmux                    # crée une nouvelle session
# tu fais ce que tu veux dedans : lancer un serveur, etc.
# tu te déconnectes du serveur, la session continue à tourner.

# Plus tard, quand tu reviens :
tmux attach             # tu reprends où tu étais
```

Raccourcis basiques (préfixe : `Ctrl+B` puis...) :

- `Ctrl+B` puis `d` : "détacher" (sortir mais laisser tourner)
- `Ctrl+B` puis `c` : créer une nouvelle fenêtre
- `Ctrl+B` puis `n` : fenêtre suivante

> En vrai, sur un serveur de prod, on n'utilise plus trop tmux pour faire tourner les services : on utilise **systemd** ou **PM2** (voir plus bas et cours 10). Mais tmux reste super utile pour des opérations longues (gros build, migration, etc.).

## Mention de PM2

`PM2` est un **gestionnaire de processus pour Node.js**. Il garde tes apps en vie même si elles plantent, les redémarre, gère les logs.

Aperçu (on détaillera au cours 10) :

```bash
npm install -g pm2

pm2 start npm --name "frontend" -- run start
pm2 start dist/main.js --name "backend"

pm2 list                  # voir les apps qui tournent
pm2 logs                  # voir les logs
pm2 restart frontend      # redémarrer
pm2 startup               # configurer pour démarrer au boot
pm2 save                  # sauvegarder l'état
```

C'est ce qu'on utilisera pour faire tourner Next.js et NestJS sur ton serveur.

## Mini-cas pratiques

### 1. Trouver et tuer un serveur Node oublié

```bash
ps aux | grep node
# belal  12345 ... node /home/.../server.js
kill 12345
```

### 2. Voir qui consomme la RAM

```bash
htop          # tu tries par mémoire (touche M)
```

### 3. Lancer un script long et garder la main

```bash
./mon-long-script.sh > sortie.log 2>&1 &
```

(le `2>&1` veut dire "envoie aussi les erreurs dans le même fichier", on le verra)

## Résumé

- Un processus = un programme qui tourne, identifié par un **PID**.
- `ps aux`, `top`, `htop` : voir les processus.
- `kill <PID>` (poli), `kill -9 <PID>` (brutal).
- `&` : lancer en arrière-plan. `jobs`, `fg`, `bg` pour gérer.
- `Ctrl+C` interrompt, `Ctrl+Z` met en pause.
- `tmux` pour des sessions qui survivent à la déconnexion SSH.
- `PM2` (à venir au cours 10) pour faire tourner ton app Node en prod.

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 05](./05_permissions.md)
- → Suivant : [Cours 07](./07_variables-d-environnement.md)
- Sommaire : [README](../README.md)
