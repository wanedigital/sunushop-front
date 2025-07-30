import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // si tu utilises ngModel ou forms
import { HttpClientModule } from '@angular/common/http';

import { ClientRoutingModule } from './client-routing.module';

import { ClientLayoutComponent } from './client-layout/client-layout.component';
import { BoutiqueProduitsComponent } from './produits/boutique-produits/boutique-produits.component';
import { PanierComponent } from './panier/panier.component';
import { CommandesComponent } from './commandes/commandes.component';
import { HistoriqueComponent } from './historique/historique.component';
import { ProfilComponent } from './profil/profil.component';

import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';


@NgModule({
  declarations: [
    
  ],
  imports: [
    ClientLayoutComponent,
    BoutiqueProduitsComponent,
    PanierComponent,
    HistoriqueComponent,
    ProfilComponent,
    NavbarComponent,
    SidebarComponent,

    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    ClientRoutingModule
  ]
})
export class ClientModule {}
