import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { StatistiqueService } from '../../services/statistique.service';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-statistiques-vendeur',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistiques-vendeur.component.html',
  styleUrls: ['./statistiques-vendeur.component.css']
})
export class StatistiquesVendeurComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('salesChart', { static: false }) salesChartRef!: ElementRef<HTMLCanvasElement>;
  
  ventes: any[] = [];
  clients: any[] = [];
  chart: Chart | null = null;
  isLoading = true;
  activePeriod: 'mois' | 'annee' | 'semaine' | 'semestriel' = 'mois';
  readonly periods: Array<'mois' | 'annee' | 'semaine' | 'semestriel'> = [
    'mois',
    'semaine',
    'semestriel',
    'annee'
  ];
  private subscriptions = new Subscription();
  private viewInitialized = false;
  private dataLoaded = false;

  constructor(
    private statsService: StatistiqueService,
    private cdr: ChangeDetectorRef
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    console.log('AfterViewInit - ViewChild disponible:', !!this.salesChartRef);
    
    // Si les données sont déjà chargées, créer le graphique
    if (this.dataLoaded && this.ventes.length > 0) {
      this.createChartWhenReady();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.chart?.destroy();
  }

  loadData(period: 'mois' | 'annee' | 'semaine' | 'semestriel' = 'mois'): void {
    this.isLoading = true;
    this.dataLoaded = false;
    this.activePeriod = period;

    // Détruire le graphique existant
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    // Charger les données de ventes
    this.subscriptions.add(
      this.statsService.getVentesParPeriode(period).subscribe({
        next: (res) => {
          this.ventes = res.data || [];
          this.dataLoaded = true;
          console.log('Données ventes reçues:', this.ventes);
          
          // Forcer la détection de changements
          this.cdr.detectChanges();
          
          // Créer le graphique si tout est prêt
          if (this.viewInitialized && this.ventes.length > 0) {
            this.createChartWhenReady();
          }
        },
        error: (err) => {
          console.error('Erreur ventes:', err);
          this.isLoading = false;
          this.dataLoaded = true;
          this.ventes = [];
        }
      })
    );

    // Charger les données des clients
    this.subscriptions.add(
      this.statsService.getMeilleursClients().subscribe({
        next: (res) => {
          this.clients = res.data || [];
          this.isLoading = false;
          console.log('Données clients reçues:', this.clients);
        },
        error: (err) => {
          console.error('Erreur clients:', err);
          this.isLoading = false;
          this.clients = [];
        }
      })
    );
  }

  private createChartWhenReady(): void {
    // Attendre que l'élément soit dans le DOM
    setTimeout(() => {
      if (this.salesChartRef?.nativeElement) {
        this.createChart();
      } else {
        console.log('Canvas pas encore disponible, nouvelle tentative...');
        // Réessayer après un délai plus long
        setTimeout(() => {
          if (this.salesChartRef?.nativeElement) {
            this.createChart();
          } else {
            console.error('Canvas toujours non disponible après plusieurs tentatives');
          }
        }, 500);
      }
    }, 100);
  }

  createChart(): void {
    console.log('Tentative de création du graphique...');
    
    // Vérifications préalables
    if (!this.viewInitialized) {
      console.log('Vue non initialisée, attente...');
      return;
    }

    if (!this.salesChartRef?.nativeElement) {
      console.error('Canvas non trouvé! Référence:', this.salesChartRef);
      // Essayer de nouveau après un court délai
      setTimeout(() => {
        if (this.salesChartRef?.nativeElement) {
          this.createChart();
        }
      }, 200);
      return;
    }

    if (!this.ventes || this.ventes.length === 0) {
      console.warn('Aucune donnée de vente disponible');
      return;
    }

    const ctx = this.salesChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Impossible d\'obtenir le contexte 2D du canvas');
      return;
    }

    // Détruire le graphique existant
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    // Préparer les données
    const labels = this.ventes.map(v => this.getLabelForPeriod(v.periode));
    const data = this.ventes.map(v => parseFloat(v.total_ventes) || 0);

    console.log('Labels:', labels);
    console.log('Data:', data);

    try {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Ventes en FCFA',
            data: data,
            backgroundColor: 'rgba(99, 102, 241, 0.7)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              display: true,
              position: 'top'
            },
            tooltip: {
              callbacks: {
                label: (context) => `Ventes: ${this.formatCurrency(context.raw)}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => this.formatCurrency(value)
              }
            }
          },
          animation: {
            duration: 1000
          }
        }
      });

      console.log('Graphique créé avec succès!');
    } catch (error) {
      console.error('Erreur lors de la création du graphique:', error);
    }
  }

  // Méthodes helpers
  private formatNumber(value: any): string {
    const num = Number(value);
    return isNaN(num) ? '0' : num.toLocaleString('fr-FR');
  }

  formatCurrency(value: any): string {
    return `${this.formatNumber(value)} FCFA`;
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  }

  getLabelForPeriod(period: string): string {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 
                       'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    switch (this.activePeriod) {
      case 'mois': 
        const monthIndex = Number(period) - 1;
        return monthNames[monthIndex] || `Mois ${period}`;
      case 'semaine': 
        return `Semaine ${period}`;
      case 'semestriel': 
        return period === "1" ? '1er Semestre' : '2nd Semestre';
      case 'annee':
      default: 
        return `Année ${period}`;
    }
  }

  changePeriod(period: 'mois' | 'annee' | 'semaine' | 'semestriel'): void {
    if (this.activePeriod !== period) {
      console.log('Changement de période vers:', period);
      this.loadData(period);
    }
  }
}