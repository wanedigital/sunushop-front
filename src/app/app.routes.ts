import { Routes } from '@angular/router';
import { DashboardComponent } from './Vendeur/dashboard/dashboard.component';
import { NavbarComponent } from './Vendeur/navbar/navbar.component';
import { RegisterComponent } from './Plateforme/register/register.component';
import { LoginComponent } from './Plateforme/login/login.component';
import { BoutiqueComponent } from './Vendeur/boutique/boutique.component';
import { AcceuilComponent } from './Plateforme/accueil/accueil.component';
import { VendeurLayoutComponent } from './Vendeur/vendeur-layout/vendeur-layout.component';
import { ProductComponent } from './Vendeur/product/product.component';
import { ProduitComponent } from './Admin/produit/produit.component';
import { CategorieComponent } from './Admin/categorie/categorie.component';
import { SidebardAdminComponent } from './Admin/sidebard-admin/sidebard-admin.component';
import { HeaderAdminComponent } from './Admin/header-admin/header-admin.component';
import { AdminLayoutComponent } from './Admin/admin-layout/admin-layout.component';
import { StatistiqueAdminComponent } from './Admin/statistique-admin/statistique-admin.component';
import { BoutiquesComponent } from './Admin/boutique/boutique.component';
import { CardsStatisticComponent } from './Admin/cards-statistic/cards-statistic.component';
import { ClientLayoutComponent } from './client/client-layout/client-layout.component';
import { BoutiqueProduitsComponent } from './client/produits/boutique-produits/boutique-produits.component';
import { PanierComponent } from './client/panier/panier.component';
import { CommandesComponent } from './client/commandes/commandes.component';
import { HistoriqueComponent } from './client/historique/historique.component';
import { ProfilComponent } from './client/profil/profil.component';
import { ConfirmationCommandeComponent } from './client/confirmation-commande/confirmation-commande.component';
import { RechercheCommandeComponent } from './client/recherche-commande/recherche-commande.component';
import { CommandeclientsComponent } from './Vendeur/commandeclients/commandeclients.component';
import { StatistiquesVendeurComponent } from './Vendeur/statistiques-vendeur/statistiques-vendeur.component';
import { ParametreComponent } from './Vendeur/parametre/parametre.component';
import { adminGuard } from './guard/admin.guard';
import { authGuard } from './guard/auth.guard';
import { clientGuard } from './guard/client.guard';
import { vendeurGuard } from './guard/vendeur.guard';
import { visitorGuard } from './guard/visitor.guard';
import { UnauthorizedComponent } from './Plateforme/unauthorized/unauthorized.component';


export const routes: Routes = [
      { 
    path: '', 
    redirectTo: 'accueil', 
    pathMatch: 'full' 
  },
  { 
    path: 'accueil', 
    component: AcceuilComponent,
  },
  { 
    path: 'register', 
    component: RegisterComponent,
  },
  { 
    path: 'login', 
    component: LoginComponent,
  },
 { path: 'unauthorized', component: UnauthorizedComponent }
,
  // Routes Admin
  { 
    path: 'admin', 
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'statistique', component: StatistiqueAdminComponent },
      { path: 'boutiques', component: BoutiquesComponent },
      { path: 'produit', component: ProduitComponent },
      { path: 'categories', component: CategorieComponent },
      { path: '', redirectTo: 'statistique', pathMatch: 'full' }
    ]
  },

  // Routes Vendeur
  { 
    path: 'vendeur', 
    component: VendeurLayoutComponent,
    canActivate: [authGuard, vendeurGuard],
    children: [
      { path: 'produit', component: ProductComponent },
      { path: 'statistique', component: DashboardComponent },
      { path: 'mes-commandes', component: CommandeclientsComponent },
      { path: 'statistiques', component: StatistiquesVendeurComponent },
      { path: 'parametre', component: ParametreComponent },
      { path: '', redirectTo: 'statistique', pathMatch: 'full' }
    ]
  },

  // Routes Client
  { 
    path: 'client', 
    component: ClientLayoutComponent,
    canActivate: [authGuard, clientGuard],
    children: [
      { path: 'boutiques/:id/produits', component: BoutiqueProduitsComponent },
      { path: 'panier', component: PanierComponent },
      { path: 'commandes', component: CommandesComponent },
      { path: 'historique', component: HistoriqueComponent },
      { path: 'profil', component: ProfilComponent },
      { path: 'commande/confirmation', component: ConfirmationCommandeComponent },
      { path: 'commande/recherche', component: RechercheCommandeComponent },
      { path: '', redirectTo: 'boutiques', pathMatch: 'full' }
    ]
  },

  // Routes accessibles à tous les utilisateurs authentifiés
  { 
    path: 'creatboutique', 
    component: BoutiqueComponent,
    canActivate: [authGuard] 
  },

  // Route de fallback
  { path: '**', redirectTo: 'accueil' }
];
      
     
     

