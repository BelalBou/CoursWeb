# Cours 04 — Naviguer et manipuler les fichiers

## Ce qu'on va voir

- Se balader : `ls`, `cd`, `pwd`
- Créer : `mkdir`, `touch`
- Copier, déplacer, supprimer : `cp`, `mv`, `rm` (et le piège `rm -rf /`)
- Lire : `cat`, `less`, `head`, `tail` (avec `-f` pour les logs en direct)
- Les **wildcards** : `*`, `?`
- Rediriger et enchaîner : `>`, `>>`, `|`
- Compter, chercher (`wc`, `grep`)

## Se balader

### `pwd` — où je suis ?

Déjà vu au cours 02. Affiche le dossier courant.

```bash
pwd
# /home/belal
```

### `ls` — lister ce qu'il y a ici

```bash
ls
```

Affiche les fichiers et dossiers visibles dans le dossier courant.

Avec **options** :

```bash
ls -l       # liste détaillée (taille, date, permissions)
ls -a       # affiche AUSSI les fichiers cachés (qui commencent par .)
ls -la      # combinaison des deux. Très utilisé.
ls -lh      # tailles "human readable" (Ko, Mo au lieu d'octets bruts)
ls -lt      # trié par date de modification
```

Tu peux donner un dossier en argument :

```bash
ls -la /etc
ls ~/Projets
```

### `cd` — change directory

```bash
cd /home/belal/Documents     # chemin absolu
cd Documents                 # chemin relatif (depuis ici)
cd ..                        # remonter d'un cran
cd ~                         # aller dans ton home
cd                           # tout court : aussi le home
cd -                         # retourner au dossier précédent (utile !)
```

> Astuce : tape `cd D` puis Tab. Ça complétera vers `Documents/` ou te montrera les choix.

## Créer

### `mkdir` — créer un dossier

```bash
mkdir mon-dossier
mkdir Projets/site-web         # crée site-web DANS Projets
mkdir -p a/b/c/d               # -p = crée toute la chaîne, même si a, b, c n'existent pas
```

L'option `-p` est très utile : sans elle, `mkdir a/b/c` plante si `a/b` n'existe pas.

### `touch` — créer un fichier vide (ou mettre à jour sa date)

```bash
touch index.html
touch styles.css scripts.js     # plusieurs d'un coup
```

Si le fichier existe déjà, `touch` ne le change pas, il met juste à jour sa date de modification.

## Copier, déplacer, supprimer

### `cp` — copier

```bash
cp source destination

cp index.html backup.html              # copie un fichier
cp -r mon-dossier copie-dossier        # -r pour copier un DOSSIER (récursif)
cp index.html ~/Documents/             # copie ailleurs
cp *.txt sauvegardes/                  # copie tous les .txt
```

> `-r` ou `-R` = "recursive" = "applique à tout le contenu du dossier".

### `mv` — déplacer (ou renommer)

```bash
mv ancien-nom.txt nouveau-nom.txt      # renommer
mv fichier.txt ~/Documents/            # déplacer
mv mon-dossier ~/Backup/               # déplacer un dossier
```

`mv` n'a pas besoin de `-r` : ça marche pareil pour fichiers et dossiers.

### `rm` — supprimer

**Attention** : sur Linux, **il n'y a pas de corbeille**. Quand tu supprimes, c'est **vraiment** parti.

```bash
rm fichier.txt
rm -r mon-dossier              # -r pour supprimer un dossier et son contenu
rm -f fichier.txt              # -f = force, sans demander confirmation
rm -rf mon-dossier             # combinaison : à utiliser avec PRUDENCE
```

### Le piège ultime : `rm -rf /`

```bash
rm -rf /          # NE FAIS JAMAIS CA
```

Cette commande supprime **tout**, depuis la racine. Sur les systèmes modernes, il y a une protection (`--no-preserve-root`), mais ne tente pas le diable.

Règle de survie : **avant chaque `rm -rf`, lis deux fois ce que tu as tapé.**

Astuce de débutant : commence par taper `ls` au lieu de `rm` pour vérifier ce que tu vas supprimer :

```bash
ls vieux-projet/         # je vois ce qu'il y a dedans
rm -r vieux-projet/      # OK, je supprime
```

## Lire un fichier

### `cat` — afficher tout d'un coup

```bash
cat index.html
```

Bien pour les **petits fichiers**. Pour un gros fichier, ça scrolle à toute vitesse.

### `less` — afficher page par page

```bash
less /var/log/syslog
```

Tu navigues avec les flèches, **espace** pour la page suivante, **q** pour quitter, **/motif** pour chercher.

### `head` — début du fichier

```bash
head fichier.txt          # 10 premières lignes par défaut
head -n 20 fichier.txt    # 20 premières lignes
```

### `tail` — fin du fichier

```bash
tail fichier.txt          # 10 dernières lignes
tail -n 50 fichier.txt    # 50 dernières lignes
```

#### `tail -f` — suivre en direct

Quand un programme écrit dans un log et que tu veux voir en temps réel :

```bash
tail -f /var/log/nginx/access.log
```

Ça affiche les nouvelles lignes au fur et à mesure. **Indispensable** quand tu débogues un serveur.
Quitte avec `Ctrl + C`.

## Les wildcards (jokers)

Quand tu veux désigner plusieurs fichiers d'un coup.

### `*` — n'importe quel texte

```bash
ls *.txt              # tous les .txt
ls projet-*           # tout ce qui commence par projet-
rm *.log              # supprime tous les .log
cp *.html backup/     # copie tous les .html
```

### `?` — un seul caractère

```bash
ls fichier?.txt       # fichier1.txt, fichierA.txt, mais PAS fichier12.txt
```

> Ces "jokers" sont gérés par le shell **avant** la commande. Donc même les commandes qui ne savent pas ce qu'est `*` s'en fichent.

## Rediriger et enchaîner

C'est ce qui rend le terminal ultra-puissant.

### `>` — rediriger vers un fichier (écrase)

```bash
echo "Salut" > message.txt
ls -la > liste.txt
```

`>` envoie ce que la commande affiche **dans un fichier au lieu de l'écran**.
Si le fichier existe, **il est écrasé**.

### `>>` — rediriger en ajoutant à la fin

```bash
echo "deuxième ligne" >> message.txt
```

`>>` **ajoute** à la fin sans écraser.

### `|` — pipe (tuyau)

Le pipe envoie la sortie d'une commande **comme entrée** d'une autre.

```bash
ls -la | less                       # liste les fichiers, paginé avec less
cat /var/log/syslog | tail -n 50    # les 50 dernières lignes du syslog
ls *.log | wc -l                    # combien de fichiers .log ?
```

C'est comme brancher des tuyaux : la commande de gauche fabrique des données, le pipe les envoie à droite.

## Quelques commandes utiles à connaître

### `wc` — compter

```bash
wc -l fichier.txt          # nombre de lignes
wc -w fichier.txt          # nombre de mots
wc -c fichier.txt          # nombre d'octets
```

### `grep` — chercher dans du texte

```bash
grep "erreur" log.txt              # affiche les lignes contenant "erreur"
grep -i "erreur" log.txt           # -i = ignore la casse
grep -r "TODO" .                   # cherche dans tous les fichiers du dossier
cat log.txt | grep "404"           # chaîne avec un pipe
```

### `find` — chercher des fichiers

```bash
find . -name "*.js"                 # tous les .js sous le dossier courant
find /var/log -name "*.log" -size +10M    # logs de plus de 10 Mo
```

## Mini-cas pratiques

**1. Voir les 100 dernières lignes d'un log filtrées par "ERROR" :**

```bash
tail -n 1000 /var/log/myapp.log | grep "ERROR" | tail -n 100
```

**2. Compter combien de fichiers `.tsx` dans ton projet :**

```bash
find ~/Projets/portfolio -name "*.tsx" | wc -l
```

**3. Sauvegarder la liste de tes fichiers :**

```bash
ls -la ~ > ~/inventaire.txt
```

**4. Suivre les logs d'une app en direct :**

```bash
tail -f ~/mon-projet/logs/app.log
```

## Résumé

- Naviguer : `pwd`, `ls`, `cd`. `ls -la` pour voir tout, en détaillé.
- Créer : `mkdir -p`, `touch`.
- Copier/déplacer/supprimer : `cp -r`, `mv`, `rm -r`. Pas de corbeille, fais gaffe.
- Lire : `cat`, `less`, `head`, `tail` (et `tail -f` pour les logs).
- Wildcards : `*` (n'importe quoi) et `?` (un caractère).
- Redirections : `>` (écrase), `>>` (ajoute), `|` (pipe).
- Outils stars : `wc`, `grep`, `find`.

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 03](./03_systeme-de-fichiers.md)
- → Suivant : [Cours 05](./05_permissions.md)
- Sommaire : [README](../README.md)
