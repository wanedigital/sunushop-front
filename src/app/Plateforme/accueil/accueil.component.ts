import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardsBoutiquesComponent } from "../cards-boutiques/cards-boutiques.component";

@Component({
  selector: 'app-acceuil',
  standalone: true,
  imports: [CommonModule, RouterModule, CardsBoutiquesComponent],
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AcceuilComponent {


  role: any;

  ngOnInit(): void {
     
  }
 isVendeur(): boolean { 
  return this.role === 'Vendeur';
}
}