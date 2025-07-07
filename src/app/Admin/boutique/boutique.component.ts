import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { BoutiqueService } from '../../services/boutique.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-boutique',
  standalone: true,
  imports: [CommonModule,HttpClientModule, FormsModule],
  templateUrl: './boutique.component.html',
  styleUrls: ['./boutique.component.css']
})
export class BoutiqueComponent implements OnInit{

  sidebarWidth: number = 250;
  tabBoutique:any = [];
  selectedBoutiqueId?: number;
  filteredBoutiques: any[] = [];    // Pour afficher uniquement celles filtrées
  searchQuery: string = '';
  
  
  constructor(private httpClient : HttpClient, private boutiqueService: BoutiqueService
  
   ){}

  
 


  ngOnInit(): void {
    this.allboutique();
   
    
  }

  allboutique(searchQuery?: string) {
    let url = `http://127.0.0.1:8000/api/boutiques`;  // pour récupérer toutes les boutiques

    if (searchQuery && searchQuery.trim() !== '') {
     // Ajout du paramètre de recherche à l'URL
     url += `?search=${encodeURIComponent(searchQuery)}`;
    }

    this.httpClient.get<any[]>(url).subscribe(
     (data) => {
       this.tabBoutique = data;
       this.filteredBoutiques = data; // Si tu travailles avec une liste filtrée
       console.log('infos:', data);
       
      },
      (error) => {
       console.error(error);
      }
    );
  }

  



  selectBoutique(boutique: any): void {
    this.selectedBoutiqueId = boutique.id;
  }

  deleteSelected(): void {
  if (!this.selectedBoutiqueId) {
    Swal.fire({
      icon: 'warning',
      title: 'Aucune sélection',
      text: 'Veuillez sélectionner une boutique à supprimer',
      confirmButtonText: 'OK',
      confirmButtonColor: '#1e293b',
    });
    return;
  }
  
   Swal.fire({
    title: 'Êtes‑vous sûr ?',
    text: 'Cette action est irréversible !',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Oui, supprimer',
    cancelButtonText: 'Annuler',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280'
  }).then((result) => {
    if (result.isConfirmed) {
      this.boutiqueService.deleteBoutique(this.selectedBoutiqueId!).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Supprimée !',
            text: 'La boutique a été supprimée avec succès',
            confirmButtonText: 'OK',
            confirmButtonColor: '#1e293b'
          });
          
          this.allboutique();
          this.selectedBoutiqueId = undefined;
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur est survenue lors de la suppression',
            confirmButtonText: 'OK',
            confirmButtonColor: '#1e293b'
          });
        }
      });
    }
  });
  }

  
 
  

  

   

}
