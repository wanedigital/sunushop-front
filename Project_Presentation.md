# Présentation du Projet SunuShop

## 1. Nom du Projet
SunuShop

## 2. Objectif Général
SunuShop est une plateforme de commerce électronique multi-vendeurs (marketplace) visant à connecter des vendeurs indépendants avec des acheteurs. Elle permet aux vendeurs de créer leurs propres boutiques en ligne, de lister leurs produits, et aux clients de parcourir, acheter et gérer leurs commandes auprès de multiples vendeurs.

## 3. Architecture Technique
Le projet est basé sur une architecture découplée (API-driven) :
*   **Backend (API) :** Développé avec Laravel (PHP).
*   **Frontend (Application Web) :** Développé avec Angular (TypeScript).

## 4. Principales Fonctionnalités et Modules

### 4.1. Gestion des Utilisateurs
*   **Profils :** Supporte différents types d'utilisateurs (Administrateur, Client, Vendeur).
*   **Authentification :** Inscription, connexion, déconnexion, gestion des mots de passe (oubli, réinitialisation, changement).
*   **Profils Utilisateurs :** Consultation et mise à jour des informations personnelles.
*   **Gestion Admin :** Les administrateurs peuvent gérer les utilisateurs (liste, détail, mise à jour, désactivation, gestion des rôles).

### 4.2. Gestion des Boutiques (Vendeurs)
*   **Création de Boutique :** Les vendeurs peuvent créer et personnaliser leur propre boutique en ligne.
*   **Approbation Vendeur :** Processus d'activation du profil vendeur via email et approbation potentielle par l'administrateur.
*   **Statut de Boutique :** Gestion du statut des boutiques (ouverte, fermée, en attente).

### 4.3. Gestion des Produits
*   **Catégories :** Organisation des produits par catégories.
*   **Listing Produits :** Les vendeurs peuvent ajouter, modifier et supprimer leurs produits, liés à leur boutique.
*   **Images Produits :** Gestion de l'upload et de l'affichage des images de produits.
*   **Stock :** Suivi de la quantité disponible des produits.

### 4.4. Gestion des Commandes
*   **Panier d'Achat :** Les clients peuvent ajouter des produits à leur panier.
*   **Processus de Commande :** Création de commandes pour les utilisateurs connectés et les clients invités.
*   **Suivi de Commande :** Consultation de l'historique des commandes et suivi de leur statut.
*   **Annulation :** Possibilité d'annuler une commande (avec gestion du stock).
*   **Gestion Vendeur :** Les vendeurs peuvent consulter et mettre à jour le statut des commandes qui les concernent.

### 4.5. Paiements
*   **Structure de Base :** Les migrations pour les tables `type_paiements` et `paiments` sont en place, fournissant la structure nécessaire pour la gestion future des paiements. L'implémentation de la logique de traitement des paiements n'est pas encore réalisée.

### 4.6. Statistiques et Rapports
*   **Tableau de Bord Admin :** Vue d'ensemble des statistiques clés de la plateforme (commandes, utilisateurs, boutiques).
*   **Rapports Vendeurs :** Statistiques de vente et informations sur les meilleurs clients pour les vendeurs.

## 5. Technologies Utilisées

*   **Backend :**
    *   **Framework :** Laravel (PHP)
    *   **Base de Données :** (Non spécifié, mais typiquement MySQL/PostgreSQL avec Laravel Eloquent)
*   **Frontend :**
    *   **Framework :** Angular (TypeScript)
    *   **UI/UX :** Bootstrap, Font Awesome, Chart.js
    *   **Outils :** SweetAlert2 (alertes interactives), ngx-pagination (pagination client-side).

---

Pour les détails sur le Produit Minimum Viable (MVP) et la feuille de route de développement, veuillez consulter le document `MVP_Plan.md`.
