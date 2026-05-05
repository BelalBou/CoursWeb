# Cours 02 — Le terminal

## Ce qu'on va voir

- C'est quoi le terminal et pourquoi on s'en sert
- C'est quoi le "shell" (bash, zsh)
- Lire le **prompt** (la ligne avant ta commande)
- Comment ouvrir un terminal sur Ubuntu, Mac, Windows (WSL)
- Tes premières commandes
- Deux astuces magiques : Tab et flèche du haut

## Terminal vs interface graphique

Quand tu utilises ton ordinateur normalement :

- Tu **cliques** sur des icônes
- Tu glisses des fenêtres
- Tu cherches dans des menus

C'est l'**interface graphique** (GUI = Graphical User Interface). C'est comme commander au restaurant en montrant le plat sur la carte avec ton doigt.

Le **terminal**, c'est l'inverse :

- Tu **tapes** des mots
- Tu lis du texte
- Tu valides avec Entrée

C'est comme commander en disant clairement : "Je voudrais une pizza margherita s'il vous plaît." Une fois que tu connais les mots, c'est **plus rapide**, **plus précis**, et surtout **automatisable**.

> Sur un serveur, il n'y a souvent pas d'écran ni de souris. Pas le choix : c'est terminal ou rien. C'est pour ça qu'on l'apprend.

## Le shell, c'est quoi ?

Quand tu ouvres un terminal, ce que tu vois, c'est juste une fenêtre qui affiche du texte. Mais ce qui **comprend** ce que tu écris, c'est le **shell**.

Le shell, c'est le programme qui :

1. Affiche le prompt
2. Lit ce que tu tapes
3. Comprend la commande
4. La fait exécuter
5. Affiche le résultat
6. Recommence

Plusieurs shells existent :

- **bash** (Bourne Again SHell) : le plus classique, par défaut sur Ubuntu/Debian.
- **zsh** : par défaut sur macOS depuis 2019. Plus moderne.
- **fish** : très user-friendly, mais moins compatible.

Pour savoir lequel tu utilises :

```bash
echo $SHELL
```

Ça affiche par exemple `/bin/bash` ou `/bin/zsh`.

> Pour ce cours, **bash et zsh fonctionnent pareil** pour 99% des commandes. Aucun souci.

## Lire le prompt

Quand tu ouvres un terminal, tu vois une ligne du genre :

```
belal@laptop:~$
```

Décortiquons :

- **`belal`** : ton nom d'utilisateur (qui es-tu sur ce PC ?)
- **`@`** : juste un séparateur, "chez"
- **`laptop`** : le nom de la machine (le "hostname")
- **`:`** : autre séparateur
- **`~`** : où tu te trouves dans le PC. Ici, `~` veut dire "ton dossier personnel" (`/home/belal`)
- **`$`** : le signe qui dit "tape ta commande après moi"

Sur certaines machines, tu verras un `#` au lieu de `$` : ça veut dire que tu es **root** (super-utilisateur). Attention, c'est dangereux (on en reparle au cours 08).

## Ouvrir un terminal

### Sur Ubuntu / Linux

Plusieurs façons :

- Raccourci clavier : **`Ctrl + Alt + T`**
- Ou cherche "Terminal" dans le menu des applications.

### Sur macOS

- Va dans `Applications` > `Utilitaires` > `Terminal`
- Ou plus rapide : `Cmd + Espace`, tape "Terminal", Entrée.

### Sur Windows (avec WSL)

- Installe WSL (voir cours 01)
- Cherche "Ubuntu" dans le menu Démarrer, lance-le.

## Tes premières commandes

Ouvre ton terminal et essaie ces commandes une par une, en validant avec Entrée :

### `pwd` — où suis-je ?

`pwd` veut dire "print working directory" (affiche le dossier courant).

```bash
pwd
```

Affiche par exemple :

```
/home/belal
```

Ça te dit dans quel dossier tu es **en ce moment**. Comme un GPS qui te dit "tu es ici".

### `whoami` — qui suis-je ?

```bash
whoami
```

Affiche ton nom d'utilisateur. Utile pour vérifier sous quel compte tu es connecté, surtout sur un serveur.

### `date` — quelle heure est-il ?

```bash
date
```

Affiche la date et l'heure du système. Pratique pour vérifier que l'horloge du serveur est juste.

### `clear` — nettoyer l'écran

```bash
clear
```

Efface tout ce qui est affiché et te redonne un écran propre. Raccourci équivalent : **`Ctrl + L`**.

### `exit` — fermer le terminal

```bash
exit
```

Ferme la session. Sur un serveur distant (SSH), ça te déconnecte. En local, ça ferme la fenêtre.

## Deux astuces magiques

### 1. La touche Tab : autocomplétion

Tu commences à taper un nom de fichier ou de commande, et tu appuies sur **Tab**. Le shell complète tout seul si c'est unique.

Exemple : tu tapes `cd Doc` puis Tab. Si un seul dossier commence par "Doc", il devient `cd Documents/`.

Si plusieurs choix existent, appuie deux fois sur Tab pour voir la liste.

> Cette touche te fera **gagner des heures** et t'évitera des fautes de frappe. Utilise-la tout le temps.

### 2. La flèche du haut : historique

Appuie sur **↑** (flèche du haut), tu remontes dans tes commandes précédentes. Très pratique pour relancer la dernière commande.

Tu peux aussi taper :

```bash
history
```

Pour voir l'historique complet.

Et `Ctrl + R` ouvre une recherche dans l'historique : tu tapes un mot, ça te retrouve la dernière commande qui le contient.

## Petits réflexes

- Si une commande "bloque" et ne rend pas la main : **`Ctrl + C`** pour interrompre.
- Si le terminal affiche des trucs bizarres après un mauvais affichage : tape `reset` puis Entrée.
- Si tu ne sais plus à quoi sert une commande : `man <commande>` ouvre le manuel. Quitter avec `q`.

Exemple :

```bash
man ls
```

Ouvre le manuel de la commande `ls`. C'est dense, mais complet.

## Résumé

- Le terminal, c'est parler à ton PC en mots au lieu de cliquer.
- Le shell (bash ou zsh) lit tes commandes et les exécute.
- Le prompt te dit qui tu es, où tu es, et attend ta commande.
- Premières commandes : `pwd`, `whoami`, `date`, `clear`, `exit`.
- Tab = autocomplétion, ↑ = historique. Utilise-les tout le temps.
- `Ctrl + C` pour interrompre, `man` pour lire le manuel.

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 01](./01_cest-quoi-linux.md)
- → Suivant : [Cours 03](./03_systeme-de-fichiers.md)
- Sommaire : [README](../README.md)
