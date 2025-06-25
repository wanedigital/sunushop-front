import { Component, OnInit } from '@angular/core';
import { CardComponent } from "../card/card.component";
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/authservice.service';

@Component({
  selector: 'app-accueil',
  imports: [CardComponent,RouterLink],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})
export class AccueilComponent implements OnInit{
  constructor(private auth:AuthService){

  }
  ngOnInit(): void {

  }
  



  
}
