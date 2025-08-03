import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClientLayoutComponent } from './client-layout/client-layout.component';
import { BoutiqueProduitsComponent } from './produits/boutique-produits/boutique-produits.component';
import { PanierComponent } from './panier/panier.component';
import { CommandesComponent } from './commandes/commandes.component';
import { HistoriqueComponent } from './historique/historique.component';
import { ProfilComponent } from './profil/profil.component';
import { ConfirmationCommandeComponent } from './confirmation-commande/confirmation-commande.component';
import { RechercheCommandeComponent } from './recherche-commande/recherche-commande.component';

const routes: Routes = [
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
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule {}