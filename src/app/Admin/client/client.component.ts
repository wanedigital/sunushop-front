import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserServiceService } from '../../services/user-service.service';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination'; // Ajoutez cette ligne

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, NgxPaginationModule], 
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {
  page: number = 1;
  itemsPerPage: number = 5;
  sidebarWidth: number = 250;
  tabClient: any = [];
  filteredClients: any[] = [];
  searchQuery: string = '';
  clients: any[] = [];
  selectedUserId?: number;
  
  constructor(private httpClient: HttpClient, private userService: UserServiceService) {}

  ngOnInit(): void {
    this.allclient();
  }

  allclient(searchQuery?: string) {
    this.userService.getUsers(searchQuery).subscribe({
      next: (data: any) => {
        this.tabClient = data.users;
        this.filteredClients = data.users;
        this.clients = this.tabClient.filter((u: any) => u.profil?.libelle === 'Client');
        this.page = 1; // Réinitialiser à la première page après un filtre
      },
      error: (err: any) => {
        console.error('Erreur lors de la récupération des utilisateurs', err);
      }
    });
  }

  selectUser(client: any): void {
    this.selectedUserId = client.id;
  }
  
  deleteSelected(): void {
    if (!this.selectedUserId) {
      Swal.fire({
        icon: 'warning',
        title: 'Aucune sélection',
        text: 'Veuillez sélectionner un client à supprimer',
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
              text: 'Le client a été supprimé avec succès',
              confirmButtonText: 'OK',
              confirmButtonColor: '#1e293b'
            });
            
            this.allclient();
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