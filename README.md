# saiyan-transformation

Un thème pour l'app Claude (desktop et mobile) : couleurs bleu nuit et or, et un fond animé où une mascotte en pixels se transforme sous un ciel d'orage, entourée d'une aura dorée en pointes, d'éclairs et d'arcs électriques.

## Installation

Dans un terminal Claude Code, au prompt :

```
/plugin install saiyan-transformation --marketplace COMPTE/claude-saiyan-theme
```

Ou depuis un shell :

```
claude plugin install saiyan-transformation --marketplace COMPTE/claude-saiyan-theme
```

Répondre `y` pour ajouter la marketplace, puis choisir la portée (utilisateur par défaut).

Dans l'app desktop : cliquer sur + à côté de la zone de saisie, puis Plugins, « Add marketplace » avec `COMPTE/claude-saiyan-theme`, puis « Add plugin ».

## Ce que fait le mod

- Applique un thème sombre (fonds bleu nuit, texte crème, accent or).
- Dessine un fond animé : transformation toutes les 10 secondes, traversée de l'écran toutes les 20 secondes.
- Le fond n'apparaît que dans l'app desktop et l'app mobile, pas dans le terminal.

L'app ne redessine le fond que deux fois par seconde : l'animation est donc volontairement en poses tenues, façon image par image.

## Ce que le mod ne fait pas

Le module n'appelle que le thème, une minuterie et le redessin du fond. Il ne lit ni n'écrit aucun fichier, ne lance aucun programme, ne fait aucune requête réseau et ne touche ni aux prompts ni aux outils.

## Crédits

Dessin original. Projet de fan non officiel, sans lien avec Anthropic ni avec les ayants droit d'une quelconque licence d'animation. Licence MIT.
