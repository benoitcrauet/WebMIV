# WebMIV
Félicitations pour l'acquisition de votre superbe copie de __WebMIV__ ! 🎉

__WebMIV__ est un logiciel libre développé par _Benoît Crauet_ et distribué gratuitement. Il permet l'affichage des 🚆 trains, 🚇 métros, 🚃 trams et 🚎 bus de vos lignes IDFM favorites (ou détestées, ça, c'est vous qui voyez).

__WebMIV__ a été spécifiquement conçu pour être facilement intégrable puisqu'il repose intégralement sur la technologie Web.
Vous pouvez par exemple l'afficher sur :
- Une télévision
- Une tablette (iOS ou Android)
- Un ordinateur (Linux, macOS, Windows)
- Un Raspberry Pi (ou équivalents)
- Un système de digital signage

💡 __WebMIV__ étant une page web, il s'intègre également parfaitement en tant que web card dans un dashboard ___Home Assistant___. C'est même l'impulsion d'origine du projet : pouvoir intégrer proprement sur une tablette fixée au mur, au beau milieu d'un dashboard _Home Assistant_, les prochains trains et bus d'un ou plusieurs arrêts.

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

Renommez le fichier de configuration `settings.sample.ini` en `settings.ini` :
```bash
mv settings.sample.ini settings.ini
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

## Utilisation de WebMIV
Maintenant que vous avez configuré et lancé WebMIV, il ne vous reste qu'à l'afficher !
Voici l'URL de WebMIV :
```
http://[IP-DU-WEBMIV]:[PORT]/
```

La liste des affichages configurés s'affichera.

💡 Vous pouvez également utiliser des 🔗 permaliens vers un affichage précis.
Il vous suffit alors de rajouter l'argument suivant dans l'URL et de l'enregistrer dans votre navigateur, votre dashboard ou votre afficheur web :
```
http://[IP-DU-WEBMIV]:[PORT]/?display=[NOM-DE-LA-VUE]
```

---
___Admettons par exemple que le serveur WebMIV ai pour IP `192.168.1.200` et le `httpport` du fichier `settings.ini` ai pour valeur `8080`.___

Pour afficher la vue préconfigurée `valdeurope-mlv`, vous devrez saisir l'URL suivant :
```
http://192.168.1.200:8080/?display=valdeurope-mlv
```

Les prochains trajets s'afficheront alors, en tenant compte des paramètres propres à la vue sélectionnée.

#### Adapter l'affichage
Vous pouvez rajouter dans l'URL appelé un ou plusieurs paramètres d'affichage permettant de surcharger certains paramètres configurés dans l'application Node.

Ces arguments permettent d'outrepasser leurs équivalents dans `settings.ini` :
| Argument | Type | Decription | Exemple |
|--|--|--|--|
| `limit` | integer | Personnalise ponctuellement le nombre maximal de trajets à afficher, sans tenir compte de la configuration dans `settings.ini`. | `3` pour n'afficher que 3 trajets. |
| `displayclock` | integer | Permet d'afficher ou de cacher l'horloge, sans tenir compte de la configuration dans `settings.ini`. | `1` pour forcer l'affichage, `0` pour cacher.  |

Voici un exemple avec la vue `valdeurope-mlv` en forçant l'affichage de seulement 3 trajets (utile si la vue est affichée sur un petit écran), et en cachant l'horloge :
```
http://192.168.1.200:8080/?display=valdeurope-mlv&limit=3&displayclock=0
```

#### Suivre un véhicule

Admettons, vous avez repéré un train qui serait idéal pour votre sortie, mais vous devez vous préparer rapidement juste avant... Avec les temps d'attente qui évoluent, vous risqueriez de le confondre avec un autre, 15 minutes après, et de risquer de le rater. Ce serait fort fâcheux.

💡 **Vous pouvez donc cliquer sur le train qui vous intéresse** : ceci mettra votre train en surbrillance afin que vous puissiez le surveiller en un coup d'oeil, et ce même s'il change de position sur l'écran !

Pour désactiver le suivi d'un véhicule, re-cliquez tout simplement dessus.

> Voilà ! Vous n'avez maintenant plus d'excuse pour rater votre train. 🤓🚈

# Annexe 1 : intégration de la fonte "Parisine"
Si vous souhaitez que WebMIV s'affiche avec la fonte ___Parisine___ (la fonte officielle RATP), c'est possible !
Mais sachez cependant que la fonte Parisine est payante et sous licence.

Si vous avez acheté la fonte Parisine, vous pouvez placer vous-même les fichiers dans le répertoire suivant :
```
htdocs/font/
```
WebMIV est configuré pour afficher cette typographie si ses fichiers se trouvent dans ce répertoire.

Vous devrez placer 4 variantes :
- Parisine Regular
- Parisine Bold
- Parisine Italic
- Parisine Bold Italic

Vous devrez également la convertir en 4 formats différents :
- eot
- ttf
- woff
- woff2

Voici la liste des fichiers requis :
- `htdocs/font/Parisine-Bold.eot`
- `htdocs/font/Parisine-Bold.ttf`
- `htdocs/font/Parisine-Bold.woff`
- `htdocs/font/Parisine-Bold.woff2`
- `htdocs/font/Parisine-BoldItalic.eot`
- `htdocs/font/Parisine-BoldItalic.ttf`
- `htdocs/font/Parisine-BoldItalic.woff`
- `htdocs/font/Parisine-BoldItalic.woff2`
- `htdocs/font/Parisine-Italic.eot`
- `htdocs/font/Parisine-Italic.ttf`
- `htdocs/font/Parisine-Italic.woff`
- `htdocs/font/Parisine-Italic.woff2`
- `htdocs/font/Parisine-Regular.eot`
- `htdocs/font/Parisine-Regular.ttf`
- `htdocs/font/Parisine-Regular.woff`
- `htdocs/font/Parisine-Regular.woff2`

En l'absence de cette fonte, pas de panique, des polices de substitution similaires seront appelées (si elles sont installées sur votre système) :
- Trebuchet MS
- Helvetica
- Une autre fonte installée sans empattement