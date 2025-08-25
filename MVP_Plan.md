# Plan du Produit Minimum Viable (MVP) - SunuShop

## 1. Introduction au Concept de MVP

Un Produit Minimum Viable (MVP) est la version d'un nouveau produit qui permet à une équipe de recueillir le maximum d'apprentissage validé sur les clients avec le minimum d'effort. Pour SunuShop, le MVP vise à lancer une plateforme multi-vendeurs fonctionnelle avec les fonctionnalités essentielles pour valider le concept et commencer à générer de la valeur, tout en laissant de la place pour des améliorations et des ajouts futurs.

Ce document détaille les fonctionnalités clés à implémenter pour le backend et le frontend afin d'atteindre cet objectif de MVP.

## 2. Feuille de Route MVP Backend

### ✅ Feuille de Route MVP Backend - SunuShop

Votre backend est déjà très bien structuré et de nombreuses fonctionnalités clés sont en place. Cette feuille de route détaille les améliorées, les changements et les nouvelles fonctionnalités à implémenter pour finaliser le MVP.

**Catégorie : Sécurité & Autorisation**

1.  **Implémenter les Politiques d'Autorisation (Laravel Policies)**
    *   **Explication :** Assurer que les utilisateurs n'accèdent et ne modifient que les ressources auxquelles ils sont autorisés. C'est crucial pour empêcher les utilisateurs non autorisés d'accéder à des parties sensibles de l'application (ex: tableaux de bord admin/vendeur).
    *   **Tâches Spécifiques :**
        *   **`BoutiqueController` (`update`, `destroy`) :** Seul le propriétaire de la boutique ou un administrateur peut modifier/supprimer.
        *   **`ProduitController` (`update`, `destroy`) :** Seul le vendeur propriétaire du produit peut le modifier/supprimer.
        *   **`CategorieController` (`store`, `show`, `update`, `destroy`) :** Restreindre ces actions aux administrateurs uniquement.

2.  **Validation des Données Manquante ou Insuffisante**
    *   **Explication :** La validation est cruciale pour l'intégrité des données et la sécurité. Des données non validées peuvent entraîner des erreurs, des vulnérabilités (ex: injections SQL) ou des comportements inattendus.
    *   **Tâches Spécifiques :**
        *   **`CategorieController` (`store`, `update`) :** Ajouter des règles de validation pour le champ `libelle` (ex: `required|string|max:255|unique:categories,libelle`).

**Catégorie : Robustesse & Logique Métier**

3.  **Affiner le Flux d'Approbation des Vendeurs et Boutiques**
    *   **Explication :** Le système d'activation de profil via e-mail est excellent, mais il ne gère pas encore complètement le statut de l'utilisateur et de la boutique.
    *   **Tâches Spécifiques :**
        *   **`AuthController` (`register`) :** Pour les nouveaux utilisateurs avec le profil 'Vendeur', définir leur `status` initial sur 'inactif' ou 'en attente'.
        *   **`BoutiqueController` (`store`) :** Définir le `status` initial d'une nouvelle boutique sur 'en attente' ou 'inactif'.
        *   **`ProfilValidationController` (`valider`) :** Après avoir mis à jour le `profil_id` de l'utilisateur vers 'Vendeur', cette méthode devrait également :
            *   Mettre à jour le `status` de l'utilisateur à 'actif'.
            *   Mettre à jour le `status` de la boutique associée à 'ouvret'.

4.  **Nettoyage et Optimisation du Code**
    *   **Explication :** Un code propre et optimisé est plus facile à maintenir et à faire évoluer.
    *   **Tâches Spécifiques :**
        *   **`ProduitController` (`index`) :** Supprimer le code en double et intégrer correctement pagination, recherche et eager loading.
        *   **`CommandeController` :** Supprimer les méthodes `ventesVendeurParPeriode` et `meilleursClientsVendeur` (doublons de `StatistiqueController`).
        *   **`BoutiqueController` :** Supprimer la méthode `allboutique()` (redondante) et les blocs de code commentés.
        *   **`User` Model :** Ajouter le champ `photo` à la migration `users_table` si ce n'est pas déjà fait, pour correspondre au `$fillable` du modèle.
        *   **`ProduitBoutique` Model :** Activer la relation `boutique()` si elle est toujours commentée.

5.  **Gestion du Paiement à la Livraison**
    *   **Explication :** Mettre en place la logique pour enregistrer les commandes comme étant payables à la livraison, sans intégration de passerelle externe. C'est une solution simple et efficace pour le MVP.
    *   **Tâches Spécifiques :**
        *   **`TypePaiement` :** S'assurer qu'un type de paiement "Paiement à la livraison" existe dans la base de données (via un seeder ou une migration si nécessaire).
        *   **`CommandeController::store` :** Lors de la création d'une commande, créer automatiquement une entrée dans la table `paiments` avec le `type_paiement_id` correspondant à "Paiement à la livraison" et un `status` initial (ex: 'en attente' ou 'à la livraison').
        *   **API pour Admin/Vendeur :** Ajouter des endpoints pour permettre à l'administrateur ou au vendeur de mettre à jour le `status` du paiement (ex: 'reussi' une fois la livraison effectuée et le paiement reçu).

**Catégorie : Nouvelles Fonctionnalités pour le MVP**

6.  **Système d'Abonnement Vendeur**
    *   **Objectif :** Mettre en place la monétisation de la plateforme via des plans d'abonnement pour les vendeurs.
    *   **Détails :**
        *   **Migrations :**
            *   Table `plans` : `id`, `name`, `price`, `currency`, `duration_in_days`, `features` (JSON).
            *   Table `subscriptions` : `id`, `user_id`, `plan_id`, `start_date`, `end_date`, `status`, `payment_status`.
        *   **Modèles :** `Plan`, `Subscription`.
        *   **API Admin (`PlanController`) :** CRUD pour les plans d'abonnement.
        *   **API Admin (`SubscriptionController`) :** Gestion des abonnements (lister, voir, attribuer manuellement, changer statut).
        *   **API Vendeur (`SubscriptionController`) :** Voir abonnement actuel, lister plans disponibles, initier/annuler abonnement.
        *   **Logique d'Intégration :**
            *   **Inscription Vendeur :** Attribution automatique au plan "Découverte" (gratuit).
            *   **Contrôle des Fonctionnalités :** Vérifier le plan du vendeur pour limiter les fonctionnalités (ex: `max_products` dans `ProduitController::store`).
            *   **Tâche Planifiée :** Vérifier et mettre à jour les statuts des abonnements expirés.

7.  **Système d'Évaluation et de Commentaires (Reviews & Ratings)**
    *   **Objectif :** Instaurer la confiance et aider les clients dans leurs décisions d'achat en permettant les avis sur les produits.
    *   **Détails :**
        *   **Migration :** Table `evaluations` : `produit_id`, `user_id`, `note`, `commentaire`, `statut` (pour modération).
        *   **Modèle :** `Evaluation`.
        *   **API Clients (`EvaluationController`) :** Soumettre une évaluation (uniquement si produit acheté).
        *   **API Public/Clients :** Récupérer évaluations d'un produit, calculer note moyenne.
        *   **API Admin :** Modération des évaluations.

8.  **Messagerie Basique Client-Vendeur**
    *   **Objectif :** Faciliter la communication directe entre clients et vendeurs concernant les produits ou les commandes.
    *   **Détails :**
        *   **Migration :** Table `messages` : `expediteur_id`, `destinataire_id`, `sujet`, `contenu`, `lu_at`.
        *   **Modèle :** `Message`.
        *   **API Clients (`MessagerieController`) :** Envoyer un message à un vendeur.
        *   **API Vendeurs :** Lister messages reçus, répondre, marquer comme lu.

## 3. Feuille de Route MVP Frontend

### ✅ Feuille de Route MVP Frontend - SunuShop

Ce document détaille les améliorations, les changements et les nouvelles fonctionnalités à implémenter sur le frontend pour atteindre un Produit Minimum Viable (MVP) opérationnel, en s'alignant sur la feuille de route backend.

**Catégorie : Sécurité & Autorisation**

-   **1. Implémenter et Appliquer les Gardes de Route (Route Guards)**
    -   **Explication :** Sécuriser l'accès aux différentes sections de l'application en fonction de l'état d'authentification et du rôle de l'utilisateur.
    -   **Détails :**
        -   **`auth.guard.ts` :**
            -   Renommer `authGuard` en `adminOrVendorGuard` (ou créer des gardes séparées comme `adminGuard` et `vendorGuard`).
            -   Ajuster la logique pour que `adminOrVendorGuard` n'autorise que les rôles 'Administrateur' et 'Vendeur' à passer.
        -   **Nouveaux Gardes :**
            -   Créer un `isAuthenticatedGuard` générique qui vérifie uniquement si l'utilisateur est connecté.
            -   (Optionnel) Créer un `clientGuard` si certaines routes sont exclusivement pour les clients.
        -   **`app.routes.ts` :** Appliquer les gardes appropriés aux routes :
            -   `admin` : `canActivate: [adminGuard]`
            -   `vendeur` : `canActivate: [vendorGuard]`
            -   Routes nécessitant juste une connexion : `canActivate: [isAuthenticatedGuard]`

**Catégorie : Cohérence & Expérience Utilisateur**

-   **2. Centraliser la Configuration de l'URL de l'API**
    -   **Explication :** Faciliter la gestion des environnements (développement, production) et éviter le codage en dur des URLs.
    -   **Détails :**
        -   **`src/environments/environment.ts` et `src/environments/environment.prod.ts` :** S'assurer que `apiUrl` est correctement défini.
        -   **Tous les Services (ex: `AuthService`, `BoutiqueService`, `ServiceService`, `CommandeService`) :** Remplacer les URLs codées en dur par `environment.apiUrl`.

-   **3. Standardiser les Messages d'Erreur et de Confirmation**
    -   **Explication :** Offrir une expérience utilisateur cohérente et professionnelle.
    -   **Détails :**
        -   **`LoginComponent` :** Afficher les messages d'erreur de l'API de manière visible dans le template (utiliser la propriété `errorMessage`).
        -   **`CommandesComponent` :** Afficher les erreurs de validation en ligne à côté des champs du formulaire. Utiliser SweetAlert2 ou des notifications toast pour les erreurs générales de l'API.
        -   **`PanierComponent` :** Remplacer les `confirm()` et `alert()` natifs par des modales SweetAlert2 pour toutes les confirmations (retrait, vider panier).
        -   **`Vendeur/product/product.component.ts` :** Utiliser SweetAlert2 de manière cohérente pour toutes les confirmations de suppression (y compris `deleteSelected`).

-   **4. Affiner le Flux d'Inscription des Vendeurs (UI/UX)**
    -   **Explication :** Guider clairement les utilisateurs qui souhaitent devenir vendeurs et gérer leur attente d'approbation.
    -   **Détails :**
        -   **`RegisterComponent` :**
            -   S'assurer que le champ `profil` (Client/Vendeur) est clairement exposé et sélectionnable dans le HTML.
            -   Après l'inscription d'un vendeur, afficher un message clair indiquant que leur compte est en attente d'approbation et qu'un email de validation a été envoyé.

-   **5. Supprimer le `setTimeout` dans `LoginComponent`**
    -   **Explication :** Améliorer la réactivité de l'application après une connexion réussie.
    -   **Détails :** Déplacer la redirection (`this.router.navigate`) directement dans le bloc `next` de la souscription `authService.login`.

**Catégorie : Scalabilité & Performance**

-   **6. Implémenter la Pagination, le Filtrage et le Tri Côté Serveur**
    -   **Explication :** Améliorer les performances et la réactivité de l'application pour les listes de données volumineuses.
    -   **Détails :**
        -   **`Admin/boutique/boutique.component.ts` :** Modifier pour envoyer les paramètres de pagination, recherche et tri à l'API backend et gérer la réponse paginée.
        -   **`Admin/produit/produit.component.ts` :** Modifier pour envoyer les paramètres de pagination, recherche et tri à l'API backend et gérer la réponse paginée.
        -   **`Vendeur/product/product.component.ts` :** Modifier pour envoyer les paramètres de pagination, recherche et tri à l'API backend et gérer la réponse paginée.

**Catégorie : Logique Métier & Nettoyage**

-   **7. Gérer le Comportement du Panier Multi-Vendeurs**
    -   **Explication :** Définir et implémenter une stratégie claire pour la gestion des produits de différentes boutiques dans le panier.
    *   **Détails :**
        -   **`PanierService` (`ajouterAuPanier`) :** Si la stratégie est "un seul vendeur par panier", vérifier si le produit ajouté provient d'une boutique différente de celle déjà dans le panier. Si oui, demander à l'utilisateur s'il souhaite vider le panier actuel ou annuler l'ajout.

-   **8. Nettoyage du Code Frontend**
    -   **Explication :** Améliorer la lisibilité et la maintenabilité du code.
    *   **Détails :**
        -   **`app.routes.ts` :** Supprimer tout le code commenté.
        -   **`Vendeur/boutique/boutique.component.ts` :** Supprimer le champ `status` du formulaire ou le rendre non modifiable par le vendeur si le backend gère son statut initial.
        -   **`Vendeur/product/product.component.ts` :** Supprimer la logique de création de catégories (modale, méthodes) car cela devrait être une fonction d'administration.
        -   **`Admin/boutique/boutique.component.ts` :** Utiliser `BoutiqueService` pour toutes les requêtes API (ne pas utiliser `HttpClient` directement).
        -   **`Vendeur/home` route :** Revoir la route `/vendeur/home` qui pointe vers `NavbarComponent` ; elle devrait pointer vers un composant de tableau de bord ou d'aperçu.
        -   **`CategorieComponent` :** Clarifier son utilisation. Si `/categories` est une route publique, s'assurer que le composant est adapté à la consultation publique et que la gestion (CRUD) est réservée à l'admin.

**Catégorie : Nouvelles Fonctionnalités pour le MVP**

-   **9. Système d'Abonnement Vendeur**
    -   **Objectif :** Mettre en place la monétisation de la plateforme via des plans d'abonnement pour les vendeurs.
    *   **Détails :**
        -   **Nouveau Composant :** `Vendeur/abonnement/abonnement.component.ts`
        -   **Fonctionnalités :**
            -   Afficher le plan d'abonnement actuel du vendeur (nom, prix, date de début/fin, statut).
            -   Lister les plans d'abonnement disponibles (Découverte, Essentiel, Premium) avec leurs fonctionnalités.
            -   Boutons pour "Mettre à niveau" ou "Rétrograder" l'abonnement.
            -   Afficher les limites du plan actuel (ex: "X produits sur Y autorisés").
        -   **Intégration :** Ajouter une route `/vendeur/abonnement` dans `app.routes.ts`.

-   **10. Système d'Évaluation et de Commentaires (Reviews & Ratings)**
    -   **Objectif :** Instaurer la confiance et aider les clients dans leurs décisions d'achat en permettant les avis sur les produits.
    *   **Détails :**
        -   **Nouveau Composant :** `client/produits/evaluation/evaluation.component.ts` (ou intégré à `BoutiqueProduitsComponent`).
        -   **Fonctionnalités :**
            -   Afficher les avis et la note moyenne pour chaque produit.
            -   Formulaire pour soumettre un avis (note + commentaire) pour les clients ayant acheté le produit.
        -   **Intégration :** Afficher les avis sur la page de détail du produit.

-   **11. Messagerie Basique Client-Vendeur**
    -   **Objectif :** Faciliter la communication directe entre clients et vendeurs concernant les produits ou les commandes.
    *   **Détails :**
        -   **Nouveau Composant :** `client/messagerie/messagerie.component.ts` et `Vendeur/messagerie/messagerie.component.ts`.
        -   **Fonctionnalités (Client) :**
            -   Bouton "Contacter le vendeur" sur la page produit ou commande.
            -   Interface pour envoyer un message au vendeur.
            -   (Optionnel pour MVP) Liste des conversations initiées.
        -   **Fonctionnalités (Vendeur) :**
            -   Interface pour voir les messages reçus.
            -   Possibilité de répondre aux messages.
            -   Indicateur de messages non lus.
        -   **Intégration :** Ajouter des routes `/client/messagerie` et `/vendeur/messagerie` dans `app.routes.ts`.