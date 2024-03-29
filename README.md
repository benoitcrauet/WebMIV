# WebMIV

Félicitations pour l'acquisition de votre superbe copie de __WebMIV__ ! 🎉

Ce projet est directement inspiré de l'application pour Android [My-MIV](https://github.com/Florian1548/My-MIV) _(allez donc y faire un tour !)_ développée par [Florian1548](https://github.com/Florian1548).

__WebMIV__ avait été créé à l'origine pour répondre à un besoin personnel consistant à avoir cette même interface, mais en version web, afin de pouvoir l'intégrer à Home Assistant.
Merci à Florian d'autoriser la publication de ce projet fortement inspiré du sien !

![Capture d'écran de l'interface WebMIV](https://github.com/benoitcrauet/WebMIV/assets/9050929/ddfede9b-91e0-4951-9579-9b7dce8f8eea)
![Capture d'écran de l'interface WebMIV](https://github.com/benoitcrauet/WebMIV/assets/9050929/5db0667c-3ac0-4df1-865b-fb99c6e7cdce)


## Introduction

__WebMIV__ est un logiciel libre sous licence AGPL-3.0 développé par [_Benoît Crauet_](https://github.com/benoitcrauet) et distribué gratuitement. Il permet l'affichage des 🚆 trains, 🚇 métros, 🚃 trams et 🚎 bus de vos lignes IDFM favorites (ou détestées, ça, c'est vous qui voyez).

__WebMIV__ a été spécifiquement conçu pour être facilement intégrable puisqu'il repose intégralement sur la technologie Web.
Vous pouvez par exemple l'afficher sur :
- Une télévision
- Une tablette (iOS ou Android)
- Un ordinateur (Linux, macOS, Windows)
- Un Raspberry Pi (ou équivalents)
- Un système de digital signage
- ...et plus globalement tout ce qui permet d'afficher une page web !

💡 __WebMIV__ s'intègre également parfaitement en tant que web card dans un dashboard ___Home Assistant___. C'est même l'impulsion d'origine du projet : pouvoir intégrer proprement sur une tablette fixée au mur, au beau milieu d'un dashboard _Home Assistant_, les prochains trains et bus d'un ou plusieurs arrêts.

Le projet fonctionne avec un principe de client-serveur. Vous pouvez l'installer sur n'importe quel système prenant en charge Node et Git (Windows, Linux, Mac, Raspberry, machine virtuelle...).
Les clients, eux, n'ont besoin que d'un simple navigateur web.

## Installation
Assurez-vous d'avoir installé sur votre système **NodeJS**. Par exemple, sur système Linux :
```bash
sudo apt update
sudo apt install nodejs
node -v # Affiche le numéro de version
```
Rendez-vous sur [le site internet de NodeJS](https://nodejs.org/en/download) pour avoir plus d'informations sur la procédure d'installation sur votre OS.
> _WebMIV a été testé sans encombre sur NodeJS v20._
---
Positionnez-vous dans le répertoire dans lequel vous souhaitez installer WebMIV :
```bash
cd /home/Me/apps/ # Par exemple
```
Faites un `git clone` du projet :
```bash
git clone git@github.com:benoitcrauet/WebMIV.git
```

Git va automatiquement créer le sous-dossier `WebMIV`.
Positionnez-vous dans le répertoire créé :
```bash
cd WebMIV/
```

Initialisez le projet en installant les dépendances :
```bash
npm install
```

Dupliquez le fichier de configuration `settings.sample.ini` en `settings.ini` :
```bash
cp settings.sample.ini settings.ini
```

Ouvrez ensuite le fichier `settings.ini` et modifiez la configuration selon vos besoins (vous trouverez à la suite de ce README des détails sur la configuration) :
```bash
nano settings.ini
```

Une fois configuré, lancez le serveur WebMIV avec la commande suivante:
```bash
node .
```
> 👍🏻 _WebMIV fonctionne aussi parfaitement en tant que service, dans systemctl par exemple._

Comme pour tous les autres programmes dans le terminal, vous pouvez stopper WebMIV avec un `Ctrl+C`, ou `^C`.

## Mise à jour de WebMIV
Si cette application évolue, la propagation des nouvelles versions n'est pas automatique.
Vous devez alors faire une mise à jour manuelle du paquet WebMIV.

💡 Pensez d'abord à stopper WebMIV, soit avec `Ctrl+C`, soit en stoppant le service (si vous l'avez configuré comme tel).

Positionnez-vous dans le répertoire d'éxécution de WebMIV :
```bash
cd /home/Me/apps/WebMIV # Par exemple. Adaptez à votre configuration
```

La mise à jour se fait en une seule commande :
```bash
git pull
```
Le fichier `settings.sample.ini` réapparaîtra : c'est normal. Supprimez-le.

Enfin, relancez WebMIV sous sa nouvelle version :
```bash
node .
```

⚠️ __ATTENTION__ : Il est possible qu'une réadaptation du fichier `settings.ini` soit nécessaire, par exemple en cas d'ajout ou de modification de fonctionnalités.
Auquel cas, assurez-vous que votre fichier `settings.ini` réponde bien aux directives de ce README avant de lancer WebMIV.

## Les pré-requis
Vous aurez besoin d'un accès personnel à l'API Prim mise à disposition par **Île-de-France Mobilités**.
C'est une plateforme permettant aux logiciels tiers comme WebMIV de récupérer les données des transports franciliens.

WebMIV discute avec l'API Prim, mais il lui faut 🔑 **un jeton unique d'accès**.
Nous allons donc la créer :
- Pour commencer, créez un compte sur le site IDFM Prim : https://prim.iledefrance-mobilites.fr/fr
- Ensuite, cliquez sur votre nom d'utilisateur en haut à droite et allez dans "Mes jetons d'authentification".
- Cliquez enfin sur "Générer mon nouveau jeton"

![Capture d'écran du bouton "Générer mon nouveau jeton"](https://github.com/benoitcrauet/WebMIV/assets/9050929/41994708-7d36-4317-9817-9ffa5e1a38c1)


🔑 Notez bien ce jeton et conservez-le précieusement ! <ins>__Il ne vous sera plus redonné par le site.__</ins>

<ins>Vous ne pouvez avoir qu'un seul jeton par compte.</ins> Autrement dit, si vous avez besoin d'interconnecter d'autres applications, vous devrez utiliser le même jeton pour les apps utilisant votre compte.
Si vous regénérez un nouveau jeton, vous devrez le mettre à jour sur chaque application utilisant votre jeton. D'où l'intérêt de bien le noter quelque part, de manière sécurisée (dans votre gestionnaire de mots de passe, par exemple).

## Fonctionnement de WebMIV
WebMIV va s'appuyer sur un système de vues préconfigurées contenant chacunes leurs propres paramètres.
Vous pouvez ensuite afficher ces vues en utilisant l'argument `display=` dans l'URL.

## Configuration de WebMIV
L'intégralité de la configuration se situe dans le fichier `settings.ini`.

Voici la liste des paramètres de la section `[general]` :
| Paramètre | Type | Description |
|--|--|--|
| `httpport` | integer | Port d'écoute du serveur web sur lequel WebMIV fonctionnera (port 80 par défaut). |
| `apikey` | string | Le 🔑 jeton de tout à l'heure, vous vous souvenez ? Et bien, inscrivez-le ici ! |

Nous passons ensuite à la configuration des vues.
Chaque vues est en réalité une section du fichier `settings.ini`.

Voici ce que chaque vue doit contenir comme paramètres :
| Paramètre | Type | Decription | Valeur(s) |
|--|--|--|--|
| `linetype` | string | Défini le type de ligne. Permet d'adapter l'esthétique. | `rer`/`bus`/`tram`/`metro` |
| `linenumber` | string | Numéro/lettre de la ligne. Permet d'adapter l'esthétique. | `A` pour le RER A, par exemple. |
| `linecolor` | string | Couleur de la ligne en héxadécimal, sans le dièse. Permet d'adapter l'esthétique. | `FF4343` pour le RER A. |
| `minimumwait` | integer | Nombre de secondes minimum d'attente requis pour afficher un trajet. | `180` pour exclure tous les trains arrivant dans moins de 3 minutes. |
| `limit` | integer | Nombre maximal de trajets à afficher. 0 pour aucune limite. | `3` pour afficher maximum 3 trains. |
| `displayname` | string | Nom complet de la vue, affiché dans le bandeau blanc en haut de l'interface. | `Val d'Europe - Direction Chessy` |
| `displayclock` | boolean | Défini si l'horloge doit être visible sur l'affichage. | `true` pour afficher l'horloge, `false` pour la cacher |
| `stationid` | integer | ID de l'Arrêt __OU__ de la Zone d'Arrêt. Un arrêt défini un quai, ou un abri de bus précis, tandis qu'une Zone d'Arrêt défini un arrêt, avec l'ensemble de ses quais ou abris. Pour récupérer les ID des Arrêts ou des Zones d'Arrêts, allez sur [la page dédiée sur IDFM Prim](https://data.iledefrance-mobilites.fr/explore/dataset/arrets-transporteur/custom/?disjunctive.fournisseurname). | `474003` pour le quai RER A de Val d'Europe, direction Chessy. |

### Gestion des filtres de vue

Chaque vue dispose également de variables de filtres.
Ces filtres permettent d'affiner l'affichage des trajets en cas, par exemple, de l'affichage d'un point d'arrêt majeur comportant plusieurs lignes et destinations.

Pour connaître les valeurs à entrer dans ces filtres, rendez-vous dans la page web de votre vue, et ouvrez la console JavaScript avec la touche `F12` ou `Cmd+Alt+I` sur macOS, et entrez une des commandes suivantes :
- `displayLines()` pour afficher toutes les lignes connues par l'afficheur
- `displayDirections()` pour afficher toutes les directions connues par l'afficheur
- `displayDestinations()` pour afficher toutes les destinations connues par l'afficheur

⚠️ __Attention__ : il est possible qu'en fonction de l'heure, toutes les directions, destinations ou lignes ne s'affichent pas. La console n'affiche que les données rencontrées depuis le rechargement de la page.
=> ___Je vous conseille de soit laisser la page tourner un petit moment avant de lancer la commande, soit faire cette opération en heure de pointe afin d'être certain que le système puisse avoir l'occasion de capturer toutes les datas possibles.___

Une fois que vous avez vos données de lignes, directions et/ou destinations, il vous suffit de copier/coller la ou les valeur(s) depuis la console directement dans votre fichier `settings.ini` dans les variables suivantes :

| Paramètre | Type | Decription |
|--|--|--|
| `filterDestination[]` | string | Permet de filtrer une __destination__. La destination correspond au terminus du trajet. |
| `filterDirection[]` | string | Permet de filtrer une __direction__. Différent de la destination, la direction va plutôt donner un sens global. |
| `filterLine[]` | string | Inscrire le string __COMPLET__ de la référence de ligne. Les identifiants de référence de ligne IDFM peuvent être étranges, mais une valeur `STIF:Line::C00632:` est tout à fait valable. |

Même si vous ne définissez pas de filtre, vous devez quand même laisser les variables `filterDestination[]`, `filterDirection[]` et `filterLine[]`, sans valeur.
À partir moment où un filtre est défini, l'afficheur n'affichera __QUE__ les lignes, directions ou destinations désignées.
__Les filtres agissent comme une whitelist.__
En l'absence de filtres définis, l'afficheur affichera tous les trajets, sans condition.

‼️ __Important : lorsque vous changez la configuration, vous devez relancer WebMIV.__

# Utilisation de WebMIV
Maintenant que vous avez configuré et lancé WebMIV, il ne vous reste qu'à l'afficher !
Voici l'URL de WebMIV :
```
http://[IP-DU-WEBMIV]:[PORT]/
```

Une liste des vues configurées dans `settings.ini` s'affichera alors.
![Capture d'écran de la liste des vues configurées](https://github.com/benoitcrauet/WebMIV/assets/9050929/94253cd7-a4f4-4553-888e-1c5a7af70581)


## Afficher une vue pré-configurée

💡 Vous pouvez également utiliser des 🔗 permaliens vers un affichage précis.
Il vous suffit alors de rajouter l'argument suivant dans l'URL et de l'enregistrer dans votre navigateur, votre dashboard ou votre afficheur web :
```
http://[IP-DU-WEBMIV]:[PORT]/?display=[NOM-DE-LA-VUE]
```

___Admettons par exemple que le serveur WebMIV ai pour IP `192.168.1.200` et le `httpport` du fichier `settings.ini` ai pour valeur `8080`.___

Pour afficher la vue préconfigurée `chateaudevincennes-ladefence`, vous devrez saisir l'URL suivant :
```
http://192.168.1.200:8080/?display=chateaudevincennes-ladefense
```
![Capture d'écran de l'interface](https://github.com/benoitcrauet/WebMIV/assets/9050929/721bf2ed-4153-4a74-b0f4-64dba9cad546)

Les prochains trajets s'afficheront alors, en tenant compte des paramètres propres à la vue sélectionnée.

## Surcharger la configuration d'affichage
Vous pouvez rajouter dans l'URL appelé un ou plusieurs paramètres d'affichage permettant de surcharger certains paramètres configurés dans `settings.ini` :
| Argument | Type | Decription | Exemple |
|--|--|--|--|
| `limit` | integer | Personnalise ponctuellement le nombre maximal de trajets à afficher, sans tenir compte de la configuration dans `settings.ini`. | `3` pour n'afficher que 3 trajets. |
| `displayclock` | integer | Permet d'afficher ou de cacher l'horloge, sans tenir compte de la configuration dans `settings.ini`. | `1` pour forcer l'affichage, `0` pour cacher.  |

Voici un exemple avec la vue `versailleschantiers-montparnasse` en forçant l'affichage de seulement 3 trajets (utile si la vue est affichée sur un petit écran), et en cachant l'horloge :
```
http://192.168.1.200:8080/?display=versailleschantiers-montparnasse&limit=3&displayclock=0
```
_**Avec** les arguments de surcharge de configuration :_
![Capture d'écran](https://github.com/benoitcrauet/WebMIV/assets/9050929/e55c9d1d-1e48-4459-bcfd-fbc9deee3f33)

_**Sans** les arguments de surcharge de configuration_
![Capture d'écran](https://github.com/benoitcrauet/WebMIV/assets/9050929/53712565-400f-4d86-94aa-e1dbb5660591)

## Suivre un véhicule

Vous avez repéré un train qui serait idéal pour votre sortie, mais vous devez vous préparer rapidement juste avant... Avec les temps d'attente qui évoluent, vous risqueriez de le confondre avec un autre, 15 minutes après, et de risquer de le rater. Ce serait fort fâcheux.

💡 **Vous pouvez donc cliquer sur le train qui vous intéresse** : ceci mettra votre train en surbrillance afin que vous puissiez le surveiller en un coup d'oeil, et ce même s'il change de position sur l'écran !

Pour désactiver le suivi d'un véhicule, re-cliquez tout simplement dessus.

![Capture d'écran de l'interface avec un train mis en surbrillance](https://github.com/benoitcrauet/WebMIV/assets/9050929/647632bf-114e-4887-9799-37ed47bc4393)

> Voilà ! Vous n'avez maintenant plus d'excuse pour rater votre train. 🤓🚈

# Annexe : intégration de la fonte "Parisine"
Si vous souhaitez que WebMIV s'affiche avec la fonte ___Parisine___ (la fonte officielle RATP), c'est possible !
Mais sachez cependant que la fonte Parisine est payante et sous licence et vous devrez vous la procurer légalement pour pouvoir l'intégrer à votre copie de __WebMIV__.

Vous retrouverez dans le répertoire `htdocs/font/` les instructions pour intégrer la fonte Parisine dans le projet.
