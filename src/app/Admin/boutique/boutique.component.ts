import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { BoutiqueService } from '../../services/boutique.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-boutiques',
  imports: [CommonModule, HttpClientModule, FormsModule, RouterModule],
  templateUrl: './boutique.component.html',
  styleUrls: ['./boutique.component.css']
})
export class BoutiquesComponent implements OnInit {
  tabBoutique: any = [];
  filteredBoutiques: any = [];
  paginatedBoutiques: any = [];
  selectedBoutiqueId?: number;
  searchQuery: string = '';
  filterBy: string = 'all';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5; // Valeur réduite pour le test
  totalPages: number = 1;

  constructor(private httpClient: HttpClient, private boutiqueService: BoutiqueService) {}

  ngOnInit(): void {
    this.allboutique();
  }

  allboutique() {
    this.httpClient.get<any[]>('http://127.0.0.1:8000/api/boutiques').subscribe(
      (data) => {
        this.tabBoutique = data;
        this.filteredBoutiques = [...data];
        this.updatePagination();
      },
      (error) => {
        console.error(error);
      }
    );
  }

  // Méthode de filtrage
  applyFilter() {
    if (!this.searchQuery) {
      this.filteredBoutiques = [...this.tabBoutique];
    } else {
      const searchTerm = this.searchQuery.toLowerCase();
      this.filteredBoutiques = this.tabBoutique.filter((boutique: any) => {
        switch (this.filterBy) {
          case 'nom':
            return boutique.nom.toLowerCase().includes(searchTerm);
          case 'adresse':
            return boutique.adresse.toLowerCase().includes(searchTerm);
          case 'vendeur':
            const vendeurName = `${boutique.user?.prenom} ${boutique.user?.nom}`.toLowerCase();
            return vendeurName.includes(searchTerm);
          default:
            return (
              boutique.nom.toLowerCase().includes(searchTerm) ||
              boutique.adresse.toLowerCase().includes(searchTerm) ||
              `${boutique.user?.prenom} ${boutique.user?.nom}`.toLowerCase().includes(searchTerm)
            );
        }
      });
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  // Méthode pour réinitialiser le filtre
  clearFilter() {
    this.searchQuery = '';
    this.filteredBoutiques = [...this.tabBoutique];
    this.currentPage = 1;
    this.updatePagination();
  }

  // Méthodes de pagination
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredBoutiques.length / this.itemsPerPage) || 1;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedBoutiques = this.filteredBoutiques.slice(startIndex, endIndex);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  getPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Méthode pour afficher la plage d'éléments visibles
  getDisplayedRange(): string {
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.filteredBoutiques.length);
    return `${startItem}-${endItem} sur ${this.filteredBoutiques.length}`;
  }

  // Méthode pour sélectionner une boutique
  selectBoutique(boutique: any): void {
    this.selectedBoutiqueId = boutique.id;
  }

  // Méthode pour supprimer une boutique sélectionnée
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
      title: 'Êtes-vous sûr ?',
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