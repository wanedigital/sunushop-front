import { Routes } from '@angular/router';
import { AccueilComponent } from './Plateforme/accueil/accueil.component';
import { SignUpComponent } from './Plateforme/sign-up/sign-up.component';
import { DashboardComponent } from './Vendeur/dashboard/dashboard.component';
import { NavbarComponent } from './Vendeur/navbar/navbar.component';
import { EmployeeManagementComponent } from './components/employee-management/employee-management.component';
import { RegisterComponent } from './Plateforme/register/register.component';
import { LoginComponent } from './Plateforme/login/login.component';

export const routes: Routes = [
      { path: '', redirectTo: 'accueil', pathMatch: 'full' }, 
      { path: 'accueil', component: AccueilComponent },
      { path: 'signup', component: SignUpComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'login', component: LoginComponent },
      { path: 'dashboard', component: DashboardComponent,
      children: [
      { path: 'home', component: NavbarComponent },
      { path: 'emp', component: EmployeeManagementComponent },
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
