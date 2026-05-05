# Cours 03 — Le système de fichiers

## Ce qu'on va voir

- Comment Linux organise ses fichiers (l'arborescence)
- Les dossiers importants : `/`, `/home`, `/etc`, `/var`, `/usr`, `/tmp`, `/opt`
- Chemins **absolus** vs chemins **relatifs**
- Les raccourcis : `~`, `.`, `..`
- Les différences avec Windows (pas de `C:\`)

## L'arborescence : une grande maison

Imagine que ton PC est une **grande maison**.
Cette maison a une porte d'entrée : c'est la **racine**, écrite `/`.

Tout part de là. Tous les dossiers et fichiers sont quelque part **dans** cette maison.

```
/                         ← la racine (la porte d'entrée)
├── bin/                  ← outils de base (cuisine de service)
├── etc/                  ← fichiers de configuration (les plans, les règlements)
├── home/                 ← chambres des utilisateurs
│   └── belal/            ← TA chambre
│       ├── Documents/
│       └── Projets/
├── opt/                  ← logiciels installés "à la main"
├── root/                 ← chambre du super-admin
├── tmp/                  ← le bureau brouillon (effacé souvent)
├── usr/                  ← logiciels et bibliothèques (la bibliothèque)
│   ├── bin/
│   └── local/
└── var/                  ← fichiers qui changent (logs, bdd, caches)
    └── log/
```

Cette structure s'appelle le **FHS** (Filesystem Hierarchy Standard). Tous les Linux suivent à peu près le même plan, c'est super pratique.

## Les dossiers à connaître

### `/` — la racine

C'est le tout début. Toutes les routes partent d'ici.
**Tu n'écris jamais de fichiers à la racine directement.**

### `/home` — les chambres des humains

Chaque utilisateur du PC a son dossier ici. Le tien, c'est `/home/belal` (si ton login est "belal").

C'est là que tu mets **tes** fichiers, **tes** projets, **tes** photos. Tu fais ce que tu veux dans ce dossier sans casser le système.

Sur macOS, c'est différent : c'est `/Users/belal`. Mais le principe est le même.

### `/etc` — les fichiers de configuration

Toutes les **réglages** du système sont là. Si tu veux dire à nginx comment marcher, tu modifies un fichier dans `/etc/nginx/`. Si tu veux configurer SSH, c'est dans `/etc/ssh/`.

> "etc" veut dire "et caetera" en latin. C'est un peu fourre-tout par tradition.

### `/var` — les fichiers qui varient

`var` = "variable", c'est-à-dire qui change tout le temps.

- `/var/log/` : les **logs** (les journaux de bord) de tous les programmes.
- `/var/lib/` : les données des programmes (par exemple, les bases de données PostgreSQL).
- `/var/cache/` : les caches.

Sur un serveur, tu vas souvent aller voir `/var/log/` pour comprendre pourquoi un truc ne marche pas.

### `/usr` — les programmes pour les utilisateurs

`usr` = "user system resources", la grosse bibliothèque du système.

- `/usr/bin/` : la plupart des commandes que tu utilises (`ls`, `git`, `python`, etc.)
- `/usr/local/` : les programmes que TU as installés à la main (pas par le gestionnaire de paquets).

### `/tmp` — le bureau brouillon

Endroit pour stocker des fichiers temporaires. **Vidé régulièrement** (souvent au redémarrage). Ne mets jamais rien d'important ici.

### `/opt` — les gros logiciels installés à part

Les logiciels qui ne suivent pas la convention "/usr" sont souvent ici. Par exemple, certains éditeurs, certains outils d'entreprise.

### Les autres (à connaître de loin)

- `/bin`, `/sbin` : commandes système de base (`/sbin` = pour l'admin).
- `/lib` : bibliothèques (les "boîtes à outils" partagées).
- `/dev` : les périphériques (disques, clavier, etc.) vus comme des "fichiers".
- `/proc` et `/sys` : infos sur le noyau et le matériel, en direct.
- `/root` : le home de l'utilisateur root.

## Chemins absolus vs relatifs

### Chemin absolu

Il commence par `/`. Il décrit le chemin **depuis la racine**.

```bash
/home/belal/Documents/Projets/portfolio/index.html
```

Ce chemin marche **toujours**, peu importe où tu es. C'est comme une adresse postale complète.

### Chemin relatif

Il **ne** commence **pas** par `/`. Il dépend de ton dossier courant.

Si tu es dans `/home/belal/Documents/`, alors :

```bash
Projets/portfolio/index.html
```

veut dire `/home/belal/Documents/Projets/portfolio/index.html`.

C'est comme dire "tourne à droite, puis à gauche" : ça dépend d'où tu pars.

## Les trois raccourcis magiques

### `~` — ton dossier personnel

`~` (le tilde) est un raccourci pour "mon home".

Pour toi : `~` = `/home/belal`.

```bash
cd ~                        # va dans ton home
cd ~/Documents              # va dans /home/belal/Documents
ls ~                        # liste les fichiers de ton home
```

### `.` — ici (le dossier courant)

`.` veut dire "le dossier où je suis maintenant".

```bash
ls .                        # liste les fichiers ici (équivalent à : ls)
./mon-script.sh             # exécute le script qui est ici
```

> Beaucoup de commandes utilisent `.` comme valeur par défaut, donc tu n'as souvent pas besoin de le taper.

### `..` — le dossier parent

`..` veut dire "le dossier juste au-dessus".

Si tu es dans `/home/belal/Documents/Projets/`, alors `..` = `/home/belal/Documents/`.

```bash
cd ..                       # remonte d'un cran
cd ../..                    # remonte de deux crans
ls ..                       # liste les fichiers du dossier parent
```

## Comparaison avec Windows

Sur Windows, tu as l'habitude de :

```
C:\Users\Belal\Documents\
D:\Photos\
```

Il y a des **lettres de lecteur** (`C:`, `D:`, `E:`).

**Sur Linux, il n'y a PAS de lettres de lecteur.**

Si tu branches une clé USB, elle apparaît à un endroit du système, comme par exemple :

```
/media/belal/MaCleUSB/
```

Si tu as un deuxième disque, il sera **monté** quelque part (par exemple `/mnt/disque2`). Tout reste sous la même racine `/`.

C'est plus simple en fait : un seul arbre, tout est dedans.

## Petite pratique mentale

Réponds dans ta tête (ou tape les commandes pour vérifier au cours suivant) :

1. Tu es dans `/home/belal/Documents/`. Que veut dire `..` ?
2. Tu es dans `/home/belal/`. Que veut dire `~/Projets` ?
3. Le chemin `/etc/nginx/nginx.conf` est-il absolu ou relatif ?
4. Et le chemin `nginx/nginx.conf` ?

(Réponses : 1. `/home/belal/`. 2. `/home/belal/Projets`. 3. Absolu. 4. Relatif.)

## Résumé

- Le système Linux est un grand arbre qui part de la racine `/`.
- Les dossiers importants : `/home` (toi), `/etc` (config), `/var` (logs et data), `/usr` (programmes), `/tmp` (jetable).
- Chemin absolu = depuis `/`. Chemin relatif = depuis là où tu es.
- `~` = ton home. `.` = ici. `..` = parent.
- Pas de lettres de lecteur comme sous Windows : tout est sous `/`.

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 02](./02_le-terminal.md)
- → Suivant : [Cours 04](./04_naviguer-et-manipuler-fichiers.md)
- Sommaire : [README](../README.md)
