# WebMIV
## Mise en route rapide
Félicitations pour l'acquisition de votre superbe copie de WebMIV !
Une version web et intégrable de vos horaires de bus/trains/trams/rer d'Île-de-France Mobilités.

Je ne sais pas comment vous avez fait pour récupérer cette copie, vu que __le repository est totalement private 🤓__. (en vrai, merci d'éviter de le partager, cette version n'est pas distribuable, entre autre pour des raisons de droits)


- Pour commencer, créez un compte sur le site IDFM Prim : https://prim.iledefrance-mobilites.fr/fr
- Ensuite, cliquez sur votre nom d'utilisateur en haut à droite et allez dans "Mes jetons d'authentification".
- Cliquez enfin sur "Générer mon nouveau jeton"

Notez bien ce jeton et conservez-le précieusement ! Il ne vous sera plus redonné.
Vous ne pouvez avoir qu'un seul jeton par compte. Autrement dit, si vous avez besoin d'interconnecter d'autres applications, vous devrez utiliser le même jeton pour les apps utilisant votre compte.
Si vous regénérez un nouveau jeton, vous devrez le mettre à jour sur chaque application utilisant votre jeton.

## Fonctionnement de WebMIV
WebMIV va s'appuyer sur un système de vues préconfigurées contenant chacunes leurs propres paramètres.
Vous pouvez ensuite afficher ces vues en utilisant l'argument `display=` dans l'URL.

## Configuration de WebMIV
Tout d'abord, commencez par renommer le fichier `settings.sample.ini` en `settings.ini`.
Ce fichier contient l'intégralité des paramètres de l'app.

Voici la liste des paramètres de la section `[general]` :
| Paramètre | Type | Description |
|--|--|--|
| `httpport` | integer | Port d'écoute du serveur web sur lequel WebMIV fonctionnera (port 80 par défaut). |
| `apikey` | string | Le jeton de tout à l'heure, vous vous souvenez ? Et bien, inscrivez-le ici ! |

Nous passons ensuite à la configuration des vues.
Chaque vues est en réalité une section du fichier `settings.ini`.

Voici ce que chaque vue doit contenir comme paramètres :
| Paramètre | Type | Decription | Valeur(s) |
|--|--|--|--|
| `linetype` | string | Défini le type de ligne. Pour l'affichage. | `rer`/`bus`/`tram`/`metro` |
| `linenumber` | string | Numéro/lettre de la ligne. Pour l'affichage. | `A` pour le RER A, par exemple. |
| `linecolor` | string | Couleur de la ligne en héxadécimal, sans le dièse. Pour l'affichage. | `FF4343` pour le RER A. |
| `minimumwait` | integer | Nombre de secondes minimum d'attente requis pour afficher un trajet. | `180` pour exclure tous les trains arrivant dans moins de 3 minutes. |
| `limit` | integer | Nombre maximal de trajets à afficher. 0 pour aucune limite. | `3` pour afficher maximum 3 trains. |
| `displayname` | string | Nom complet de la vue, affiché dans le bandeau blanc en haut de l'interface. | `Val d'Europe - Direction Chessy` |
| `stationid` | integer | ID de l'Arrêt __OU__ de la Zone d'Arrêt. Un arrêt défini un quai, ou un abri de bus précis, tandis qu'une Zone d'Arrêt défini un arrêt, avec l'ensemble de ses quais ou abris. Pour récupérer les ID des Arrêts ou des Zones d'Arrêts, allez sur [la page dédiée sur IDFM Prim](https://data.iledefrance-mobilites.fr/explore/dataset/arrets-transporteur/custom/?disjunctive.fournisseurname). | `474003` pour le quai RER A de Val d'Europe, direction Chessy. |
| `direction[]` | string | Usage avancé. Permet de filtrer des directions précises. Impossible de développer plus, les directions dans l'API Prim sont très dépendantes des lignes et des exploitants, c'est assez inégal. Si vous savez utiliser l'API Prim, ça peut vous être utile. | Dépendant de la ligne/exploitant |
| `lineid[]` | string | Usage avancé. Permet de filtrer des lignes précises. Utile en cas de sélection d'une Zone d'Arrêt, avec plusieurs quais ou abris bus par exemple. Impossible de développer plus, les numéros de ligne dans l'API Prim sont des chaînes de caractères excessivement complexes. Si vous savez utiliser l'API Prim, ça peut vous être utile. |  |

Même si vous ne définissez pas de filtre, vous devez quand même laisser les variables `direction[]` et `line[]`, sans valeur.
__Important__ : lorsque vous changez la configuration, vous devez relancer l'app nodejs.

## Utilisation de WebMIV
Assurez-vous d'abord d'avoir bien installé Node.js.
Rendez-vous sur https://nodejs.org/ pour plus d'informations.

Si vous venez de cloner WebMIV, vous devez d'abord commencer par faire une installation des dépendances Node.js :
```bash
npm install
```
Cette étape est __primordiale__ pour que le script puisse se lancer.

Pour lancer WebMIV, il vous suffit de lancer la commande suivante :
```bash
node index.js
```
_Astuce : vous pouvez également configurer le script pour qu'il puisse se lancer en tant que service !_

Pour stopper le script, en mode console, faites simplement `Ctrl + C` ou `control + C` sur Mac.

### Afficher WebMIV
Maintenant que vous avez configuré et lancé WebMIV, il ne vous reste qu'à l'afficher !
Voici l'URL type de WebMIV :
`http://[IP-DU-WEBMIV]:[PORT]/?display=[NOM-DE-LA-VUE]`

_Admettons que le serveur WebMIV ai pour IP `192.168.1.200` et le `httpport` du fichier `settings.ini` avec la valeur `8080`._

Pour afficher la vue préconfigurée `valdeurope-mlv`, vous devrez saisir l'URL suivant :
`http://192.168.1.200:8080/?display=valdeurope-mlv`

Les prochains trajets s'afficheront alors, en tenant compte des paramètres propres à la vue sélectionnée.

__Astuce :__ vous pouvez, dans l'URL, forcer une limite d'affichage des trajets avec l'argument `limit`.
Par exemple, pour forcer une limite de 3 trajets affichés (utile si la vue est affichée sur un petit écran) :
`http://192.168.1.200:8080/?display=valdeurope-mlv&limit=3`

---
Et voilà ! Vous ne raterez plus votre train désormais !