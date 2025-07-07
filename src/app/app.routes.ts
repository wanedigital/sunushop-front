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

export const routes: Routes = [
      { path: '', redirectTo: 'accueil', pathMatch: 'full' },
      { path: 'accueil', component:AcceuilComponent },
      { path: 'signup', component: SignUpComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'login', component: LoginComponent },
      { path: 'boutique', component: BoutiqueComponent },
      { path: 'vendeur', component: VendeurLayoutComponent,
      children: [
      { path: 'home', component: NavbarComponent },
      { path: 'produit', component: ProductComponent },
      { path: 'dashboard', component: DashboardComponent },

]
      } 
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
