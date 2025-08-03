// ============= historique.component.ts =============
import { Component, OnInit } from '@angular/core';
import { Commande, CommandeService } from '../../services/commande.service';
import { AuthService } from '../../services/authservice.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-historique',
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.css'],
  imports : [CommonModule]
})
export class HistoriqueComponent implements OnInit {
  commandes: Commande[] = [];
  loading = true;
  error = '';
  selectedCommande: Commande | null = null;
  userId: string | null = null;

  constructor(
    private commandeService: CommandeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Récupérer l'utilisateur connecté
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.loadCommandes();
      } else {
        this.error = 'Vous devez être connecté pour voir votre historique de commandes';
        this.loading = false;
      }
    });
  }

  /*loadCommandes(): void {
    this.loading = true;
    this.error = '';
    
    this.commandeService.getCommandes().subscribe({
       next: (response) => {
    this.commandes = response.data.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    this.loading = false;
  },
  error: (error) => {
    console.error('Erreur lors de la récupération des commandes', error);
    this.loading = false;
  }
    });
  }*/

  loadCommandes(): void {
  this.loading = true;
  this.error = '';
  
  this.commandeService.getCommandes().subscribe({
    next: (commandes) => {
      // Ajouter un log pour vérifier les données reçues
      console.log('Commandes reçues:', commandes);
      
      this.commandes = commandes.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      this.loading = false;
    },
    error: (error) => {
      console.error('Erreur lors du chargement des commandes:', error);
      this.error = 'Erreur lors du chargement de l\'historique';
      this.loading = false;
    }
  });
}

  getStatusClass(statut: string): string {
    return this.commandeService.getStatutColor(statut);
  }

  getStatusText(statut: string): string {
    return this.commandeService.getStatutLabel(statut);
  }

  peutAnnuler(statut: string): boolean {
    return this.commandeService.peutEtreAnnulee(statut);
  }

  showDetails(commande: Commande): void {
    this.selectedCommande = commande;
  }

  closeDetails(): void {
    this.selectedCommande = null;
  }

  annulerCommande(commande: Commande): void {
    if (!this.peutAnnuler(commande.etat)) {
      alert('Cette commande ne peut plus être annulée');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      this.commandeService.annulerCommande(commande.id).subscribe({
        next: () => {
          commande.etat = 'annuler';
          alert('Commande annulée avec succès');
          this.closeDetails();
        },
        error: (error) => {
          console.error('Erreur lors de l\'annulation:', error);
          alert('Erreur lors de l\'annulation de la commande');
        }
      });
    }
  }
}