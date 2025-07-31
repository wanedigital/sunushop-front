import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Commande, CommandeService } from '../../services/commande.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-commande',
  templateUrl: './confirmation-commande.component.html',
  styleUrls: ['./confirmation-commande.component.css'],
  imports : [CommonModule]
})
export class ConfirmationCommandeComponent implements OnInit {
  commande: Commande | null = null;
  loading = true;
  error = '';
  numeroCommande = '';
  email = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commandeService: CommandeService
  ) {}

  /*ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.numeroCommande = params['numero'];
      this.email = params['email'];

      if (this.numeroCommande && this.email) {
        this.chargerCommande();
      } else {
        this.error = 'Paramètres manquants pour afficher la commande';
        this.loading = false;
      }
    });
  }*/

     ngOnInit(): void {
    // Utilisez snapshot pour récupérer les paramètres immédiatement
    this.numeroCommande = this.route.snapshot.queryParamMap.get('numero') || '';
    this.email = this.route.snapshot.queryParamMap.get('email') || '';

    // Ajoutez des logs pour le débogage
    console.log('Numéro de commande:', this.numeroCommande);
    console.log('Email:', this.email);

    if (this.numeroCommande && this.email) {
      this.chargerCommande();
    } else {
      this.error = 'Paramètres manquants pour afficher la commande';
      this.loading = false;
      
      // Redirection après 5 secondes
      /*setTimeout(() => {
        this.retourAccueil();
      }, 5000);*/
    }
  }

  chargerCommande(): void {
    this.commandeService.getCommandeInvite({
      numeroCommande: this.numeroCommande,
      email: this.email
    }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.commande = response.data;
        } else {
          this.error = response.message || 'Commande introuvable';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Erreur lors du chargement de la commande';
      }
    });
  }

  annulerCommande(): void {
    if (!this.commande || !this.commandeService.peutEtreAnnulee(this.commande.etat)) {
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      this.commandeService.annulerCommande(this.commande.id).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Commande annulée avec succès');
            this.chargerCommande(); // Recharger pour mettre à jour le statut
          } else {
            alert(response.message || 'Erreur lors de l\'annulation');
          }
        },
        error: (error) => {
          alert(error.error?.message || 'Erreur lors de l\'annulation');
        }
      });
    }
  }

  getStatutLabel(statut: string): string {
    return this.commandeService.getStatutLabel(statut);
  }

  getStatutColor(statut: string): string {
    return this.commandeService.getStatutColor(statut);
  }

  peutEtreAnnulee(): boolean {
    return this.commande ? this.commandeService.peutEtreAnnulee(this.commande.etat) : false;
  }

  retourAccueil(): void {
    this.router.navigate(['/']);
  }
}