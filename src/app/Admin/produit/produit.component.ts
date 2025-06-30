import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-produit',
  standalone: true,
  imports: [CommonModule,HttpClientModule, FormsModule],
  templateUrl: './produit.component.html',
  styleUrls: ['./produit.component.css']
})
export class ProduitComponent implements OnInit{

  sidebarWidth: number = 250;
  tabProduit:any = [];
  filteredProduits: any[] = [];    // Pour afficher uniquement celles filtrées
  searchQuery: string = '';
  
  
  constructor(private httpClient : HttpClient ){}

  
  ngOnInit(): void {
    this.allproduit();
    
  }


 
  allproduit(searchQuery?: string) {
    let url = `http://127.0.0.1:8000/api/produits`;  // pour récupérer toutes les produits

    if (searchQuery && searchQuery.trim() !== '') {
     // Ajout du paramètre de recherche à l'URL
     url += `?search=${encodeURIComponent(searchQuery)}`;
    }

    this.httpClient.get<any[]>(url).subscribe(
     (data) => {
       this.tabProduit = data;
       this.filteredProduits = data; // Si tu travailles avec une liste filtrée
       console.log('infos:', data);
       
      },
      (error) => {
       console.error(error);
      }
    );
  }

  



 






 

}
