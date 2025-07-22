import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';


import { BoutiqueComponent } from './Admin/boutique/boutique.component';
import { CategorieComponent } from './Admin/categorie/categorie.component';
import { ProduitComponent } from './Admin/produit/produit.component';



@NgModule({
  declarations: [
    
    // autres composants ici...
  ],
  imports: [
    BrowserModule,
    RouterModule,
    
    RouterModule.forRoot([
     
     
      // autres routes ici...
    ])
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }
