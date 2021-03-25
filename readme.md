# Le Bon Sandwich

_Projet fil rouge du cours de Développement de Services Back End avec Node.js_

## Description générale

LeBonSandwich est un vendeur de sandwich à la carte bien connu sur la place locale, caractérisé par le type et la qualité des produits proposés, issus de producteur locaux et en majorité avec le label "Bio". Pour garantir la qualité et la fraicheur de ses produits, tous les sandwichs sont réalisés au moment de la commande, ce qui peut conduire à des temps d'attente parfois un peu long. Pour améliorer cela, la boutique souhaite se doter d'un service de commande en ligne de sandwichs.

Le principe est de commander son (ses) sandwichs à l'aide d'une application web/mobile. Cette webapp client fonctionne sur tous types de terminaux. Cette application permet de consulter le catalogue, créer, payer et suivre une commande (payée, en cours de préparation, prête ...) et d'accéder à un service de fidélisation en ligne.

En complément, une application de backoffice permet la gestion et le suivi de la fabrication des commandes est utilisée par le point de vente. Cette webapp point de vente permet de visualiser les commandes et les paiements, d'enregistrer la prise en charge d'une commande et sa fabrication puis sa livraison.

Une 3ème application web permet au point de vente de gérer le catalogue de produits et les tarifs des sandwichs
proposés à la vente.

## Architecture des applications

L'objectif du projet est de développer la partie backend de ces applications, sous la forme d'un ensemble de services web exposant des API et retournant des données en json. Ces différents services sont réalisés sous la forme d'applications indépendantes, utilisant chacune sa propre base de code. L'application est structurée en 4 services indépendants :

- 1. un service catalogue, permettant de parcourir le catalogue des sandwichs proposés par LeBonSandwich :

catégories, description, ingrédients, tarifs des sandwichs. Ce service utilise sa propre base de données pour stocker les produits du catalogue (catégories, sandwichs, tarifs).

- 2. un service de prise de commande, permettant de créer une commande, la payer et suivre son avancement. Ce service utilise une base de données stockant les commandes et leur état.

- 3. un service fidélisation permettant aux clients de cumuler les montants de leur commandes successives pour obtenir une réduction.

- 4. un service suivi de fabrication pour la gestion de la fabrication des commandes par le point de vente. Ce service expose une API RestFul privée qui permet de lister les commandes à fabriquer, de prendre en charge une commande et de modifier son état lorsqu'elle est prête ou livrée. Ce service exploite la même base de données que le service de prise de commandes.
L'application de gestion catalogue est une application web traditionnelle qui accède et manipule les données du catalogue au travers de l'API et produit des vues pour l'interface utilisateur HTML.

## Services

### Commande API

#### Adminer Commande

##### 1ère connexion

Se connecter avec les identifiants root sans renseigner de base de données : 
- serveur : mysql.commande
- utilisateur : root
- mot de passe : cf. MYSQL_ROOT_PASSWORD dans ./mysql/.env.dev

#### Création de la base de données + import SQL

- Créer une base de données "commande"
- Importer le schéma SQL
- Importer les données SQL

---

LP Ciasie
IUT Nancy-Charlemagne
2020

---

**Alexandre Leroux**

alex@sherpa.one

_Enseignant vacataire à l'Université de Lorraine_

- IUT Nancy-Charlemagne (LP Ciasie)

- Institut des Sciences du Digital (Masters Sciences Cognitives)