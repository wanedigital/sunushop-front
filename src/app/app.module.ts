import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';

import { NgxPaginationModule } from 'ngx-pagination';
import { BoutiqueComponent } from './Admin/boutique/boutique.component';
import { CategorieComponent } from './Admin/categorie/categorie.component';
import { ProduitComponent } from './Admin/produit/produit.component';
import { ClientComponent } from './Admin/client/client.component';
import { SellerComponent } from './Admin/seller/seller.component';



@NgModule({
  declarations: [
    AppComponent,
    BoutiqueComponent,
    CategorieComponent,
    ProduitComponent,
    ClientComponent,
    SellerComponent,

    // autres composants ici...
  ],
  imports: [
    BrowserModule,
    RouterModule,

    NgxPaginationModule,

    RouterModule.forRoot([
     
     
     
      // autres routes ici...
    ])
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }
