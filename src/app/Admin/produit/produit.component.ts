import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceService, Produit } from '../../services/service.service';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-produit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produit.component.html',
  styleUrls: ['./produit.component.css']
})
export class ProduitComponent implements OnInit {
  produits: Produit[] = [];
  filteredProduits: Produit[] = [];
  searchQuery: string = '';
  isLoading = false;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  private searchSubject = new Subject<string>();

  constructor(
    private produitService: ServiceService,
    private httpClient: HttpClient
  ) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadProduits();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchQuery => {
      this.currentPage = 1;
      this.loadProduits(searchQuery);
    });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  loadProduits(searchQuery?: string): void {
    this.isLoading = true;
    
    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('perPage', this.itemsPerPage.toString());

    if (searchQuery && searchQuery.trim() !== '') {
      params = params.set('search', searchQuery);
    }

    this.httpClient.get<{data: Produit[], total: number}>(`${this.produitService.apiUrl}/produits`, { params })
      .subscribe({
        next: (response) => {
          this.produits = response.data;
          this.filteredProduits = response.data;
          this.totalItems = response.total;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.isLoading = false;
          Swal.fire('Erreur', 'Impossible de charger les produits', 'error');
        }
      });
  }

  getPages(): number[] {
    const pagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + pagesToShow - 1);

    if (endPage - startPage + 1 < pagesToShow) {
      startPage = Math.max(1, endPage - pagesToShow + 1);
    }

    return Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProduits(this.searchQuery);
    }
  }

  changeItemsPerPage(): void {
    this.currentPage = 1;
    this.loadProduits(this.searchQuery);
  }
}