# Cours 01 — C'est quoi Linux

## Ce qu'on va voir

- C'est quoi un système d'exploitation (OS)
- D'où vient Linux et comment il est fait
- Les "distributions" (Ubuntu, Debian, etc.)
- Pourquoi presque tous les serveurs du monde tournent sous Linux
- Et toi sur ton Mac ou ton Windows, tu fais comment ?

## C'est quoi un système d'exploitation (OS) ?

Un ordinateur, c'est plein de pièces :

- Un processeur (CPU) qui calcule
- De la mémoire (RAM) qui retient les choses en cours
- Un disque dur qui stocke
- Un écran, un clavier, une souris, le wifi, etc.

Tout seuls, ces composants ne savent rien faire.
Il faut un **chef d'orchestre** pour que tout fonctionne ensemble.

Ce chef d'orchestre, c'est le **système d'exploitation**, ou OS (Operating System).

Quand tu allumes ton PC, c'est l'OS qui démarre en premier. Ensuite il te montre un écran, charge le clavier, lance Chrome quand tu cliques dessus, etc.

Les OS célèbres :

- **Windows** (Microsoft)
- **macOS** (Apple)
- **Linux** (libre et gratuit)
- **Android** et **iOS** sur les téléphones (Android est basé sur Linux d'ailleurs)

## D'où vient Linux ?

Petite histoire :

1. Dans les années 70, des chercheurs créent **UNIX**, un OS pour les ordinateurs des universités et des entreprises.
2. UNIX devient payant et fermé. Des gens veulent une version libre.
3. **Richard Stallman** lance le projet **GNU** dans les années 80 pour refaire un UNIX libre, mais il manque la pièce centrale : le "noyau".
4. En 1991, un étudiant finlandais, **Linus Torvalds**, écrit ce noyau et l'appelle **Linux**.
5. On combine GNU + Linux, et boum : un OS libre, gratuit, qui marche sur tous les PC du monde.

> Le mot exact, c'est **GNU/Linux**, mais tout le monde dit juste "Linux".

## Linux = noyau + outils

- **Le noyau (kernel)** : le coeur. Il parle directement au matériel (processeur, disque, etc.). Sans lui, rien ne marche.
- **Les outils GNU** : les commandes que tu vas taper dans le terminal (`ls`, `cp`, `mv`, etc.) et tous les programmes de base.
- **Une interface** : graphique (avec des fenêtres, comme GNOME ou KDE) ou juste en texte (le terminal).

## Les distributions ("distros")

Personne n'utilise "Linux brut". On utilise une **distribution** : c'est Linux + des choix faits pour toi (quels programmes installés par défaut, quelle interface, comment installer des nouveaux logiciels).

Les plus connues :

| Distribution | Pour qui ? |
|---|---|
| **Ubuntu** | Débutants, très populaire. Basée sur Debian. |
| **Debian** | Stable, beaucoup utilisée sur les serveurs. |
| **Fedora** | Récente, soutenue par Red Hat. |
| **Arch Linux** | Pour ceux qui veulent tout configurer eux-mêmes. |
| **Alpine** | Toute petite, beaucoup utilisée dans Docker. |

Dans ce cours, **on utilisera Ubuntu/Debian** comme référence, parce que c'est ce que tu trouveras sur 90% des serveurs (VPS) que tu vas louer plus tard.

## Pourquoi les serveurs tournent sous Linux ?

Quand tu loues un serveur pour mettre ton site en ligne, c'est presque toujours du Linux. Pourquoi ?

1. **Gratuit** : pas de licence à payer. Tu loues 100 serveurs ? 0 euro de licence.
2. **Stable** : un serveur Linux peut tourner des années sans redémarrer.
3. **Léger** : pas besoin d'interface graphique, pas besoin d'écran. Le serveur fait juste son travail.
4. **Scriptable** : tout se fait en commandes. Donc tout est automatisable, reproductible.
5. **Sécurité** : les permissions sont propres et sérieuses (on verra ça au cours 05).
6. **Open source** : tu peux voir comment ça marche, le modifier, et plein de gens dans le monde le surveillent.

## Et macOS dans tout ça ?

**Bonne nouvelle** : macOS est un cousin proche de Linux.

- macOS est basé sur **UNIX** (la même grande famille).
- Le terminal sur Mac comprend presque toutes les commandes Linux : `ls`, `cd`, `mkdir`, etc.
- Donc si tu es sur Mac, ce cours marchera quasiment à 100%.

Petites différences à savoir :

- Sur Mac, le gestionnaire de paquets s'appelle **Homebrew** (`brew install ...`), pas `apt`.
- Quelques options de commandes sont un peu différentes (mais l'essentiel est pareil).

## Et Windows ?

Windows tout seul, ce n'est pas Linux. Mais Microsoft a créé un truc génial : **WSL** (Windows Subsystem for Linux).

C'est un vrai Linux qui tourne **dans** ton Windows. Tu ouvres un terminal et tu es dans Ubuntu (par exemple), comme si tu étais sur un vrai PC Linux.

Pour l'installer (en raccourci) :

```bash
# Dans PowerShell, en mode administrateur
wsl --install
```

Après redémarrage, tu auras un Ubuntu utilisable.

> Si tu es sur Windows, **utilise WSL** pour suivre ce cours. C'est plus pédagogique que de tout traduire en commandes Windows.

## Schéma général

```
+-------------------------------------------+
|        Tes programmes (Chrome, VS Code,   |
|             ton site Next.js, etc.)       |
+-------------------------------------------+
|       Outils GNU (ls, cp, bash, ...)       |
+-------------------------------------------+
|              Noyau Linux (kernel)          |
+-------------------------------------------+
|   Matériel (CPU, RAM, disque, écran, ...)  |
+-------------------------------------------+
```

Quand tu tapes `ls`, ta commande passe par le shell, qui demande au kernel, qui parle au disque dur, qui renvoie les noms de fichiers. Tout ça en une fraction de seconde.

## Résumé

- Un OS, c'est le chef d'orchestre du PC.
- Linux = noyau (kernel Linux) + outils (GNU). On dit "Linux" tout court.
- On choisit une **distribution** : Ubuntu/Debian pour ce cours.
- Les serveurs tournent sous Linux : gratuit, stable, léger, scriptable.
- macOS est cousin de Linux (UNIX). Windows offre WSL pour avoir un vrai Linux dedans.

## Questions
*(à remplir au fur et à mesure)*

---

## Navigation

- ← Précédent : [Cours 08 PostgreSQL](../03_postgresql/08_administration-et-postgres-en-prod.md)
- → Suivant : [Cours 02](./02_le-terminal.md)
- Sommaire : [README](../README.md)
