import { Component, OnInit } from '@angular/core';
import { StatistiqueService } from '../../services/statistique.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cards-statistic',
  imports: [CommonModule],
  templateUrl: './cards-statistic.component.html',
  styleUrl: './cards-statistic.component.css'
})
export class CardsStatisticComponent implements OnInit {
  summaryData: any = null;
  isLoading = true;
  error: string | null = null;

  constructor(private statService: StatistiqueService) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.isLoading = true;
    this.error = null; // Reset error state
    
    this.statService.getSummary().subscribe({
      next: (response) => {
        if (response.success) {
          this.summaryData = response.data;
        } else {
          this.error = 'Erreur lors de la récupération des données';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du résumé', err);
        this.error = "Impossible de charger les statistiques. Vérifiez la console pour plus de détails.";
        this.isLoading = false;
      }
    });
  }

  /**
   * Calcule le pourcentage de commandes passées par des visiteurs
   */
  getTauxCommandes(): string {
    if (!this.summaryData || this.summaryData.total_orders === 0) {
      return '0';
    }
    const taux = (this.summaryData.commandes_visiteurs / this.summaryData.total_orders) * 100;
    return taux.toFixed(1);
  }

  /**
   * Calcule le ratio boutiques par vendeur
   */
  getRatioVendeursBoutiques(): string {
    if (!this.summaryData || this.summaryData.total_vendors === 0) {
      return '0';
    }
    const ratio = this.summaryData.active_shops / this.summaryData.total_vendors;
    return ratio.toFixed(1);
  }

  /**
   * Calcule le pourcentage de commandes en attente
   */
  getTauxAttente(): string {
    if (!this.summaryData || this.summaryData.total_orders === 0) {
      return '0';
    }
    const taux = (this.summaryData.pending_orders / this.summaryData.total_orders) * 100;
    return taux.toFixed(1);
  }

  /**
   * Calcule le total des utilisateurs (clients + vendeurs)
   */
  getTotalUtilisateurs(): number {
    if (!this.summaryData) {
      return 0;
    }
    return (this.summaryData.total_clients_enregistres || 0) + (this.summaryData.total_vendors || 0);
  }

  /**
   * Retourne l'heure actuelle formatée
   */
  getCurrentTime(): string {
    return new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}