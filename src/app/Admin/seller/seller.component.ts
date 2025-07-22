import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserServiceService } from '../../services/user-service.service';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-seller',
  standalone: true,
  imports: [CommonModule,HttpClientModule, FormsModule, NgxPaginationModule],
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.css']
})
export class SellerComponent implements OnInit{

  page: number = 1; // Page initiale
  itemsPerPage: number = 5; // Nombre d'éléments par page
  sidebarWidth: number = 250;
  tabVendeur:any = [];
  filteredVendeurs: any[] = [];    // Pour afficher uniquement celles filtrées
  searchQuery: string = '';
  vendeurs: any[] = [];
  selectedUserId?: number;
  
  
  constructor(private httpClient : HttpClient, private userService: UserServiceService ){}


  ngOnInit(): void {
     this.allvendeur();
  }


  allvendeur(searchQuery?: string) {
   this.userService.getUsers(searchQuery).subscribe({
     next: (data: any) => {
       this.tabVendeur = data.users; // car le JSON renvoie { users: [...] }
       this.filteredVendeurs = data.users;
       // filtrer uniquement les vendeurs
       this.vendeurs = this.tabVendeur.filter((u: any) => u.profil?.libelle === 'Vendeur');
       console.log('infos:', data.users);
      },
      error: (err: any) => {
       console.error('Erreur lors de la récupération des utilisateurs', err);
      }
    });
  }


  selectUser(vend: any): void {
    this.selectedUserId = vend.id;
  }

  deleteSelected(): void {
    if (!this.selectedUserId) {
      Swal.fire({
        icon: 'warning',
        title: 'Aucune sélection',
        text: 'Veuillez sélectionner un vendeur à supprimer',
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
          this.userService.deleteUser(this.selectedUserId!).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Supprimée !',
                text: 'Le vendeur a été supprimé avec succès',
                confirmButtonText: 'OK',
                confirmButtonColor: '#1e293b'
              });
              
              this.allvendeur();
              this.selectedUserId = undefined;
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
