import { Routes } from '@angular/router';
import { SignUpComponent } from './Plateforme/sign-up/sign-up.component';
import { DashboardComponent } from './Vendeur/dashboard/dashboard.component';
import { NavbarComponent } from './Vendeur/navbar/navbar.component';
import { EmployeeManagementComponent } from './components/employee-management/employee-management.component';
import { RegisterComponent } from './Plateforme/register/register.component';
import { LoginComponent } from './Plateforme/login/login.component';
import { BoutiqueComponent } from './Vendeur/boutique/boutique.component';
import { AcceuilComponent } from './Plateforme/accueil/accueil.component';
import { VendeurLayoutComponent } from './Vendeur/vendeur-layout/vendeur-layout.component';
import { ProductComponent } from './Vendeur/product/product.component';
import { ProduitComponent } from './Admin/produit/produit.component';

import { ClientComponent } from './Admin/client/client.component';
import { SellerComponent } from './Admin/seller/seller.component';



import { CategorieComponent } from './Admin/categorie/categorie.component';
import { SidebarComponent } from './Vendeur/sidebar/sidebar.component';
import { SidebardAdminComponent } from './Admin/sidebard-admin/sidebard-admin.component';
import { HeaderAdminComponent } from './Admin/header-admin/header-admin.component';
import { AdminLayoutComponent } from './Admin/admin-layout/admin-layout.component';
import { StatistiqueAdminComponent } from './Admin/statistique-admin/statistique-admin.component';
import { ClientLayoutComponent } from './client/client-layout/client-layout.component';
import { BoutiqueProduitsComponent } from './client/produits/boutique-produits/boutique-produits.component';
import { PanierComponent } from './client/panier/panier.component';
import { CommandesComponent } from './client/commandes/commandes.component';
import { HistoriqueComponent } from './client/historique/historique.component';
import { ProfilComponent } from './client/profil/profil.component';
import { ConfirmationCommandeComponent } from './client/confirmation-commande/confirmation-commande.component';
import { RechercheCommandeComponent } from './client/recherche-commande/recherche-commande.component';



export const routes: Routes = [
      { path: '', redirectTo: 'accueil', pathMatch: 'full' },
      { path: 'accueil', component:AcceuilComponent },
      { path: 'signup', component: SignUpComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'login', component: LoginComponent },
      { path: 'boutique', component: BoutiqueComponent },
      { path: 'produit', component: ProduitComponent },
      { path: 'categories', component: CategorieComponent },
      { path: 'admin', component: AdminLayoutComponent,
      children: [
      { path: 'sidebar', component: SidebardAdminComponent },
      { path: 'header', component: HeaderAdminComponent },
      { path: 'statistique', component: StatistiqueAdminComponent },

]
},
      { path: 'vendeur', component: VendeurLayoutComponent,
      children: [
      { path: 'home', component: NavbarComponent },
      { path: 'produit', component: ProductComponent },
      { path: 'dashboard', component: DashboardComponent },

]
      } ,
      {
      path: 'client',
            component: ClientLayoutComponent,
            children: [
                  // OPTION 1: Route recommandée - plus claire sémantiquement
                  { path: 'boutiques/:id/produits', component: BoutiqueProduitsComponent },
                  
                  // OPTION 2: Si vous préférez garder une structure similaire
                  // { path: 'boutiques/:id', component: BoutiqueProduitsComponent },
                  
                  { path: 'panier', component: PanierComponent },
                  { path: 'commandes', component: CommandesComponent },
                  { path: 'historique', component: HistoriqueComponent },
                  { path: 'profil', component: ProfilComponent },
                  { path: 'commande/confirmation', component: ConfirmationCommandeComponent },
                  { path: 'commande/recherche', component: RechercheCommandeComponent},
                  
                  
                  // Route par défaut - à adapter selon votre choix
                  { path: '', redirectTo: 'boutiques/1/produits', pathMatch: 'full' },
            ],
      }
];


      /*{ path: 'boutique', component: BoutiqueComponent },
      { path: 'categorie', component: CategorieComponent },
      { path: 'produit', component: ProduitComponent },
      { path: 'client', component: ClientComponent },
      { path: 'vendeur', component: SellerComponent },*/
      


    /* { path: 'dashboard', component: DashboardComponent,
    children: [
      { path: 'home', component: DashboardHomeComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'sales', component: SalesComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
      },*/


      


      
     
     

