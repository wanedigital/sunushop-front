import { Component, OnInit } from '@angular/core';
import { StatistiqueService, SummaryData, ApiResponse } from '../../services/statistique.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cards-statistic',
  imports: [CommonModule],
  templateUrl: './cards-statistic.component.html',
  styleUrl: './cards-statistic.component.css'
})
export class CardsStatisticComponent implements OnInit {
  summaryData: SummaryData | null = null;
  isLoading = true;
  error: string | null = null;
  lastUpdated: Date | null = null;

  constructor(private statService: StatistiqueService) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.isLoading = true;
    this.error = null; // Reset error state
    
    this.statService.getSummary().subscribe({
      next: (response: ApiResponse<SummaryData>) => {
        if (response.success) {
          this.summaryData = response.data;
          this.lastUpdated = new Date(); // Enregistre le moment de la dernière mise à jour
        } else {
          this.error = response.message || 'Erreur lors de la récupération des données';
        }
        this.isLoading = false;
      },
      error: (err) => {
        // L'erreur est déjà loggée par le service, ici on gère l'affichage pour l'utilisateur
        this.error = err.message || "Impossible de charger les statistiques. Veuillez réessayer.";
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
   * Retourne l'heure de la dernière mise à jour formatée
   */
  getFormattedLastUpdate(): string {
    if (!this.lastUpdated) {
      return 'N/A';
    }
    return this.lastUpdated.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}
