# Cours 05 — Les permissions

## Ce qu'on va voir

- Pourquoi les permissions existent
- Le modèle **utilisateur / groupe / autres**
- Lire `ls -l` : `-rw-r--r--`
- Modifier les permissions : `chmod`
- Changer le propriétaire : `chown`, `chgrp`
- Le piège `chmod 777`

## Pourquoi des permissions ?

Sur ton PC, c'est ta maison. Tu fais ce que tu veux.

Mais sur un **serveur**, plein de programmes tournent en même temps. Plusieurs utilisateurs peuvent même s'y connecter. Si tout le monde pouvait lire, modifier, supprimer n'importe quoi, ce serait le chaos et un trou de sécurité énorme.

Linux contrôle donc, pour **chaque fichier** :

- **Qui peut le lire** (read)
- **Qui peut le modifier** (write)
- **Qui peut l'exécuter** (execute, c'est-à-dire le lancer comme un programme)

C'est comme une porte de chambre dans un immeuble : la clé n'ouvre pas toutes les portes.

## Trois catégories de personnes

Linux divise le monde en **3 catégories** par fichier :

1. **Le propriétaire** (user, "u") : la personne à qui appartient le fichier.
2. **Le groupe** (group, "g") : un ensemble d'utilisateurs qui ont des droits ensemble.
3. **Les autres** (others, "o") : tous les autres utilisateurs du système.

Pour chaque catégorie, on définit `r`, `w`, `x` (read/write/execute).

3 catégories × 3 droits = **9 informations** par fichier.

## Lire `ls -l`

```bash
ls -l index.html
```

Affiche par exemple :

```
-rw-r--r-- 1 belal belal 1234 May  5 10:20 index.html
```

Décortiquons :

```
-rw-r--r--   1   belal   belal   1234   May  5 10:20   index.html
   |        |     |       |       |          |             |
   |        |     |       |       |          |             nom du fichier
   |        |     |       |       |          date de modif
   |        |     |       |       taille en octets
   |        |     |       groupe propriétaire
   |        |     utilisateur propriétaire
   |        nombre de liens (avancé, à ignorer pour l'instant)
   permissions (10 caractères)
```

### Les 10 caractères des permissions

```
-rw-r--r--
```

- **1er caractère** : le **type**
  - `-` : fichier normal
  - `d` : dossier (directory)
  - `l` : lien symbolique (raccourci)
- **3 suivants** : droits du **propriétaire** (`rw-` = lit + écrit, mais pas exécutable)
- **3 suivants** : droits du **groupe** (`r--` = lecture seule)
- **3 derniers** : droits des **autres** (`r--` = lecture seule)

### Exemples à décoder

```
-rw-r--r--   index.html
```
Fichier. Propriétaire : lit + écrit. Groupe : lit. Autres : lit.

```
drwxr-xr-x   Documents
```
Dossier. Propriétaire : lit + écrit + entre dedans. Groupe et autres : lit + entre.

> Pour un **dossier**, `x` veut dire "tu peux entrer dedans" (avec `cd`), pas "tu peux l'exécuter".

```
-rwxr-xr-x   mon-script.sh
```
Fichier exécutable. Tout le monde peut le lancer. Seul le proprio peut le modifier.

## Modifier les permissions : `chmod`

`chmod` veut dire "change mode" (changer les droits).

### Syntaxe symbolique (lisible)

```bash
chmod u+x mon-script.sh         # ajoute x au user (proprio)
chmod g-w fichier.txt           # enlève w au groupe
chmod o-r fichier.txt           # enlève r aux autres
chmod a+r fichier.txt           # a = all (tout le monde) : ajoute r à tous
```

Lettres :

- `u` = user (proprio), `g` = group, `o` = others, `a` = all
- `+` = ajoute, `-` = enlève, `=` = met exactement ce qui suit

### Syntaxe numérique (octale)

Plus rapide, beaucoup utilisée. On donne un nombre à 3 chiffres : un par catégorie.

Pour chaque catégorie, on additionne :

- `r` = **4**
- `w` = **2**
- `x` = **1**

Exemples :

| Permissions | Calcul | Nombre |
|---|---|---|
| `rwx` | 4+2+1 | **7** |
| `rw-` | 4+2 | **6** |
| `r-x` | 4+1 | **5** |
| `r--` | 4 | **4** |
| `---` | 0 | **0** |

```bash
chmod 755 mon-script.sh
# user: rwx (7), group: r-x (5), others: r-x (5)

chmod 644 fichier.txt
# user: rw-, group: r--, others: r--

chmod 600 secret.key
# user: rw-, group: ---, others: ---
# (que toi peut lire/écrire, parfait pour un fichier de mot de passe)

chmod 700 ~/.ssh
# user: rwx, group: ---, others: ---
# (tu es le seul à pouvoir entrer dans ton dossier SSH)
```

### Le `chmod +x` super utile

Quand tu fais un script shell :

```bash
echo '#!/bin/bash' > hello.sh
echo 'echo "Salut"' >> hello.sh
chmod +x hello.sh
./hello.sh
# Salut
```

Sans `chmod +x`, le système refuse de lancer ton script.

## Changer le propriétaire : `chown` et `chgrp`

`chown` = change owner, `chgrp` = change group.
Souvent il faut être **root** ou utiliser `sudo` pour ça.

```bash
sudo chown belal fichier.txt              # le proprio devient "belal"
sudo chown belal:devs fichier.txt         # proprio "belal", groupe "devs"
sudo chown -R belal:belal mon-projet/     # appliquer en récursif à tout le dossier
```

Pourquoi tu vas en avoir besoin ?

Quand tu copies un projet sur un serveur, parfois les fichiers appartiennent à `root`. Tu dois les rendre à ton user normal pour pouvoir les modifier.

## Le piège `chmod 777`

`777` = `rwxrwxrwx` = tout le monde peut tout faire.

C'est une **très mauvaise idée** sur un serveur, sauf cas extrême.

Pourquoi les débutants tombent dans le piège : ils ont un problème de permission, ils tapent `chmod -R 777` "pour que ça marche", et ça marche... et leur serveur devient une passoire.

Bonne pratique :

- Fichiers normaux : **644**
- Dossiers : **755**
- Fichiers secrets (clés, mots de passe) : **600** ou **400**
- Scripts à exécuter : **755** ou **700**

Si tu as un doute, **ne mets pas 777**. Cherche pourquoi vraiment ça ne marche pas.

## Cas concrets pour ton serveur

### 1. Protéger ta clé SSH privée

```bash
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
chmod 700 ~/.ssh
```

Si ta clé privée est lisible par d'autres, SSH refuse même de l'utiliser.

### 2. Rendre un script exécutable

```bash
chmod +x deploy.sh
./deploy.sh
```

### 3. Donner un projet à ton user après une copie

```bash
sudo chown -R belal:belal /var/www/portfolio
```

## Résumé

- Linux protège chaque fichier avec : qui peut **lire**, **écrire**, **exécuter**.
- 3 catégories : **user**, **group**, **others**.
- Lire `ls -l` : `drwxr-xr-x` = type + 3×3 droits.
- `chmod` change les droits (en lettres ou en chiffres : 7=rwx, 6=rw-, 5=r-x, 4=r--).
- `chown` change le propriétaire (souvent avec `sudo`).
- **Pas de `chmod 777`** par flemme. Réfléchis avant.

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 04](./04_naviguer-et-manipuler-fichiers.md)
- → Suivant : [Cours 06](./06_processus.md)
- Sommaire : [README](../README.md)
