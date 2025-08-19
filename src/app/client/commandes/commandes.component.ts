// ============= commandes.component.ts =============
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PanierItem, PanierService } from '../../services/panier.service';
import { AuthService, User } from '../../services/authservice.service';
import { CommandeRequest, CommandeService } from '../../services/commande.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-commandes',
  templateUrl: './commandes.component.html',
  styleUrls: ['./commandes.component.css'],
  imports : [CommonModule, FormsModule]
})
export class CommandesComponent implements OnInit {
  panierItems: PanierItem[] = [];
  currentUser: User | null = null;
  total = 0;
  loading = false;
  isUserConnected = false;
  
  // Formulaire de commande
  formData = {
    // Informations de livraison (toujours requises)
    adresseLivraison: '',
    telephone: '',
    notes: '',
    
    // Informations client (requises si non connecté)
    nom: '',
    prenom: '',
    email: ''
  };

  constructor(
    private panierService: PanierService,
    private commandeService: CommandeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Surveiller le panier
    this.panierService.panier$.subscribe(panier => {
      this.panierItems = panier;
      this.total = this.panierService.getTotalPanier();
      
      // Rediriger si le panier est vide
      if (this.panierItems.length === 0) {
        this.router.navigate(['/client/panier']);
      }
    });

    // Surveiller l'état de connexion
    this.authService.currentUser.subscribe(user => {
      console.log('Utilisateur dans commande:', user); // Debug
      this.currentUser = user;
      this.isUserConnected = !!user;
      
      if (user) {
        // Pré-remplir les champs avec les données de l'utilisateur
        this.formData.telephone = user.telephone || '';
        this.formData.adresseLivraison = user.adresse || '';
        this.formData.nom = user.nom || '';
        this.formData.prenom = user.prenom || '';
        this.formData.email = user.email || '';
        
        console.log('FormData après remplissage:', this.formData); // Debug
      } else {
        // Réinitialiser les champs si pas connecté
        this.formData = {
          adresseLivraison: '',
          telephone: '',
          notes: '',
          nom: '',
          prenom: '',
          email: ''
        };
      }
    });
  }

  onSubmit(): void {
    console.log('État de connexion:', this.isUserConnected); // Debug
    console.log('Utilisateur actuel:', this.currentUser); // Debug
    console.log('Données du formulaire:', this.formData); // Debug
    
    if (!this.isFormValid()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.loading = true;

    const commandeData: CommandeRequest = {
      items: this.panierItems.map(item => ({
        produitId: item.produit.id.toString(),
        quantite: item.quantite
      })),
      adresseLivraison: this.formData.adresseLivraison,
      telephone: this.formData.telephone,
      notes: this.formData.notes
    };

    // Ajouter les informations client si non connecté
    if (!this.isUserConnected) {
      commandeData.nom = this.formData.nom;
      commandeData.prenom = this.formData.prenom;
      commandeData.email = this.formData.email;
    } else {
      // ⚠️ Effacer explicitement les champs pour les utilisateurs connectés
      delete commandeData.nom;
      delete commandeData.prenom;
      delete commandeData.email;
    }

    console.log('Données envoyées à l\'API:', commandeData); // Debug

    this.commandeService.creerCommande(commandeData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          // Vider le panier après commande réussie
          this.panierService.viderPanier();
          
          alert(`Commande ${response.data.numeroCommande} passée avec succès !`);
          
          if (this.isUserConnected) {
            this.router.navigate(['/client/historique']);
          } else {
            // Pour les invités, rediriger vers une page de confirmation avec les détails
            this.router.navigate(['/client/commande/confirmation'], {
              queryParams: {
                numero: response.data.numeroCommande,
                email: this.formData.email
              }
            });
          }
        } else {
          alert(response.message || 'Erreur lors de la commande');
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur lors de la commande:', error);
        
        if (error.error && error.error.errors) {
          // Afficher les erreurs de validation
          const errors = Object.values(error.error.errors).flat();
          alert('Erreurs de validation:\n' + errors.join('\n'));
        } else {
          alert(error.error?.message || 'Erreur lors de la commande. Veuillez réessayer.');
        }
      }
    });
  }

  isFormValid(): boolean {
    const baseValid = this.formData.adresseLivraison.trim() !== '' && 
                     this.formData.telephone.trim() !== '';
    
    if (this.isUserConnected) {
      return baseValid;
    } else {
      // Pour les invités, vérifier aussi les informations personnelles
      return baseValid && 
             this.formData.nom.trim() !== '' &&
             this.formData.prenom.trim() !== '' &&
             this.formData.email.trim() !== '' &&
             this.isValidEmail(this.formData.email);
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  retourPanier(): void {
    this.router.navigate(['/client/panier']);
  }

  // Méthode pour basculer vers la connexion/inscription
 goToLogin(): void {
  Swal.fire({
    title: 'Êtes-vous sûr ?',
    text: "Vous ne pourrez pas annuler cette action !",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Oui, continuer',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      // Navigation vers la page de login avec paramètre de retour
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/client/commande' }
      });

      // Message de confirmation
      Swal.fire('Redirection', 'Vous allez être redirigé vers la page de connexion.', 'success');
    }
  }).catch((err) => {
    console.error('Erreur lors de la redirection :', err);
    Swal.fire('Erreur', 'Impossible de rediriger vers la page de connexion.', 'error');
  });
}
}