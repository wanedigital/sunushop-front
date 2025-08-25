import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardsBoutiquesComponent } from "../cards-boutiques/cards-boutiques.component";
import { AuthService } from '../../services/authservice.service';

@Component({
  selector: 'app-acceuil',
  standalone: true,
  imports: [CommonModule, RouterModule, CardsBoutiquesComponent],
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AcceuilComponent implements OnInit{


  role: any;
  isVendeur = false;
  isClient = false;

  constructor(private auth:AuthService){

  }
  ngOnInit(): void {
     this.isVendeur = this.auth.isVendeur();
    this.isClient = this.auth.isClient();


  }


}