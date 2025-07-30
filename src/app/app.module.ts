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

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { ClientModule } from './client/client.module';
import { routes } from './app.routes';
//import { ClientModule } from './client/client.module';

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
    ClientModule,
    AppRoutingModule, // ici
    RouterModule,

    HttpClientModule,
    FormsModule,


    NgxPaginationModule,

    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }
