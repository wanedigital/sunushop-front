import { Component, OnInit } from '@angular/core';
import { StatistiqueService } from '../../services/statistique.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-statistique-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './statistique-admin.component.html',
  styleUrl: './statistique-admin.component.css'
})
export class StatistiqueAdminComponent implements OnInit {
  // Données des statistiques
  userGrowthData: any[] = [];
  topShopsData: any[] = [];
  topProductsData: any[] = [];

  // États de chargement
  isLoadingGrowth = false;
  isLoadingShops = false;
  isLoadingProducts = false;

  // Gestion des erreurs
  growthError: string | null = null;
  shopsError: string | null = null;
  productsError: string | null = null;

  // Paramètres configurables
  selectedPeriode = 'mois';
  shopsLimit = 10;
  productsLimit = 10;

  // Options disponibles
  periodesOptions = [
    { value: 'jour', label: 'Par jour' },
    { value: 'semaine', label: 'Par semaine' },
    { value: 'mois', label: 'Par mois' },
    { value: 'annee', label: 'Par année' }
  ];

  constructor(private statService: StatistiqueService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  /**
   * Charge toutes les données statistiques
   */
  loadAllData(): void {
    this.loadUserGrowth();
    this.loadTopShops();
    this.loadTopProducts();
  }

  /**
   * Charge les données de croissance des utilisateurs
   */
  loadUserGrowth(): void {
    this.isLoadingGrowth = true;
    this.growthError = null;
    
    this.statService.getUserGrowth(this.selectedPeriode).subscribe({
      next: (response) => {
        if (response.success) {
          this.userGrowthData = response.data;
        } else {
          this.growthError = 'Erreur lors du chargement des données de croissance';
        }
        this.isLoadingGrowth = false;
      },
      error: (err) => {
        console.error('Erreur croissance utilisateurs:', err);
        this.growthError = 'Impossible de charger les données de croissance';
        this.isLoadingGrowth = false;
      }
    });
  }

  /**
   * Charge le classement des boutiques
   */
  loadTopShops(): void {
    this.isLoadingShops = true;
    this.shopsError = null;

    this.statService.getTopShops(this.shopsLimit).subscribe({
      next: (response) => {
        if (response.success) {
          this.topShopsData = response.data;
        } else {
          this.shopsError = 'Erreur lors du chargement du classement des boutiques';
        }
        this.isLoadingShops = false;
      },
      error: (err) => {
        console.error('Erreur classement boutiques:', err);
        this.shopsError = 'Impossible de charger le classement des boutiques';
        this.isLoadingShops = false;
      }
    });
  }

  /**
   * Charge le classement des produits
   */
  loadTopProducts(): void {
    this.isLoadingProducts = true;
    this.productsError = null;

    this.statService.getTopProducts(this.productsLimit).subscribe({
      next: (response) => {
        if (response.success) {
          this.topProductsData = response.data;
        } else {
          this.productsError = 'Erreur lors du chargement du classement des produits';
        }
        this.isLoadingProducts = false;
      },
      error: (err) => {
        console.error('Erreur classement produits:', err);
        this.productsError = 'Impossible de charger le classement des produits';
        this.isLoadingProducts = false;
      }
    });
  }

  /**
   * Actualise les données de croissance quand la période change
   */
  onPeriodeChange(): void {
    this.loadUserGrowth();
  }

  /**
   * Actualise le classement des boutiques quand la limite change
   */
  onShopsLimitChange(): void {
    if (this.shopsLimit > 0 && this.shopsLimit <= 50) {
      this.loadTopShops();
    }
  }

  /**
   * Actualise le classement des produits quand la limite change
   */
  onProductsLimitChange(): void {
    if (this.productsLimit > 0 && this.productsLimit <= 50) {
      this.loadTopProducts();
    }
  }

  /**
   * Formate la date selon la période sélectionnée
   */
  formatDate(date: string): string {
    switch (this.selectedPeriode) {
      case 'jour':
        return new Date(date).toLocaleDateString('fr-FR');
      case 'semaine':
        return `Semaine ${date}`;
      case 'mois':
        const [year, month] = date.split('-');
        return `${this.getMonthName(parseInt(month))} ${year}`;
      case 'annee':
        return date;
      default:
        return date;
    }
  }

  /**
   * Retourne le nom du mois en français
   */
  private getMonthName(month: number): string {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month - 1] || month.toString();
  }

  /**
   * Calcule le total des nouveaux utilisateurs
   */
  getTotalNewUsers(): number {
    return this.userGrowthData.reduce((total, item) => 
      total + (item.nouveaux_clients || 0) + (item.nouveaux_vendeurs || 0), 0
    );
  }

  /**
   * Rafraîchit toutes les données
   */
  refreshAllData(): void {
    this.loadAllData();
  }
}