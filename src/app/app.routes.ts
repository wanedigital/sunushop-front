import { Routes } from '@angular/router';
import { AccueilComponent } from './Plateforme/accueil/accueil.component';
import { SignUpComponent } from './Plateforme/sign-up/sign-up.component';
import { DashboardComponent } from './Vendeur/dashboard/dashboard.component';
import { NavbarComponent } from './Vendeur/navbar/navbar.component';
import { BoutiqueComponent } from './Admin/boutique/boutique.component';
import { CategorieComponent } from './Admin/categorie/categorie.component';
import { ProduitComponent } from './Admin/produit/produit.component';




export const routes: Routes = [
      { path: '', redirectTo: 'accueil', pathMatch: 'full' }, 
      { path: 'accueil', component: AccueilComponent },
      { path: 'signup', component: SignUpComponent },
      { path: 'dashboard', component: DashboardComponent,
      children: [
      { path: 'home', component: NavbarComponent },]
      },
      
      
      { path: 'boutique', component: BoutiqueComponent },
      { path: 'categorie', component: CategorieComponent },
      { path: 'produit', component: ProduitComponent }
      
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


      


      
     
     

      
];
