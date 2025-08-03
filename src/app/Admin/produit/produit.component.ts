import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NgxPaginationModule } from 'ngx-pagination';

import { ServiceService, Produit } from '../../services/service.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http'; // à ajouter


@Component({
  selector: 'app-produit',
  standalone: true,
  imports: [CommonModule,HttpClientModule, FormsModule, NgxPaginationModule],
  templateUrl: './produit.component.html',
  styleUrls: ['./produit.component.css']
})
export class ProduitComponent implements OnInit {
  allProduits: Produit[] = []; // Tous les produits chargés
  displayedProduits: Produit[] = []; // Produits affichés (page courante)
  searchQuery: string = '';
  isLoading = false;
  currentPage = 1;
  //itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  sortField = 'libelle';
  sortDirection = 'asc';
  private searchSubject = new Subject<string>();

  constructor(private produitService: ServiceService) {}

  ngOnInit(): void {
    this.setupSearchObservable();
    this.loadAllProduits();
  }

  private setupSearchObservable(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.applyFilter();
    });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  loadAllProduits(): void {
    this.isLoading = true;
    this.produitService.getAllProduits().subscribe({
      next: (response: any) => {
        const produits = response.data ? response.data : response;
        this.allProduits = Array.isArray(produits) ? produits : [];
        this.totalItems = this.allProduits.length;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.isLoading = false;
      }
    });
  }

  private normalizeString(str: string): string {
    return str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || '';
  }

  applyFilter(): void {
    // Étape 1: Filtrer
    let filtered = this.allProduits.filter(produit => {
      if (!this.searchQuery.trim()) return true;
      
      const query = this.normalizeString(this.searchQuery);
      return (
        this.normalizeString(produit.libelle).includes(query) ||
        this.normalizeString(produit.description).includes(query) ||
        produit.prix.toString().includes(query) ||
        produit.quantite.toString().includes(query)
      );
    });

    // Étape 2: Trier
    filtered = this.sortProduits(filtered);

    // Étape 3: Paginer
    this.updatePagination(filtered);
  }

  private sortProduits(produits: Produit[]): Produit[] {
    return [...produits].sort((a, b) => {
      const field = this.sortField as keyof Produit;
      const valueA = a[field];
      const valueB = b[field];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      const numA = Number(valueA);
      const numB = Number(valueB);
      return this.sortDirection === 'asc' ? numA - numB : numB - numA;
    });
  }

  private updatePagination(filtered: Produit[]): void {
    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    // Corriger la page courante si elle est invalide
    this.currentPage = Math.max(1, Math.min(this.currentPage, this.totalPages || 1));
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedProduits = filtered.slice(startIndex, endIndex);
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilter();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.sortField = 'libelle';
    this.sortDirection = 'asc';
    this.currentPage = 1;
    this.applyFilter();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilter();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilter();
    }
  }

  changeItemsPerPage(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  getDisplayedRange(): string {
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${startItem}-${endItem} sur ${this.totalItems} produits`;
  }

  get isFiltered(): boolean {
    return !!this.searchQuery.trim() || this.sortField !== 'libelle' || this.sortDirection !== 'asc';
  }

  resetSort(): void {
  this.sortField = 'libelle';
  this.sortDirection = 'asc';
  this.applyFilter();
}

getPagesArray(): number[] {
  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
}

goToPage(page: number): void {
  if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
    this.currentPage = page;
    this.applyFilter();
  }
}
}