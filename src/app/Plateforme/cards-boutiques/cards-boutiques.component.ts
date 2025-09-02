import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/authservice.service';
import { ServiceService } from '../../services/service.service';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cards-boutiques',
  imports: [CommonModule, RouterModule,NgIf,NgFor],
  templateUrl: './cards-boutiques.component.html',
  styleUrl: './cards-boutiques.component.css'
})
export class CardsBoutiquesComponent implements OnInit{

  boutiques: any = [];
  isLoading = true;
  boutique: any = [];
  role: any;

  constructor(private boutiqueService: ServiceService, private auth:AuthService,) {}


  ngOnInit() {
        this.loadBoutiques();
}

imageBaseUrl = 'http://localhost:8000/';

  loadBoutiques(): void {
    this.boutiqueService.getBoutiques().subscribe({
      next: (data: any[]) => { // Assurez-vous que data est bien un tableau
        this.boutiques = data.map(boutique => {
          if (boutique.logo && !boutique.logo.startsWith('http')) {
            boutique.logo = 'http://localhost:8000' + boutique.logo;
          }
          return boutique;
        });
        this.isLoading = false;
        console.log('Boutiques avec URL complètes:', this.boutiques);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    return status === 'ouvret' ? 'bg-success' : 'bg-secondary';
  }


  isVendeur(): boolean {
  return this.role === 'Vendeur';
}
// Ajoutez ces méthodes à votre composant Angular

/**
 * Vérifie si une boutique est considérée comme "nouvelle"
 * @param boutique - L'objet boutique à vérifier
 * @returns true si la boutique est nouvelle (créée dans les 30 derniers jours)
 */
isNewBoutique(boutique: any): boolean {
  if (!boutique.dateCreation) return false;
  
  const dateCreation = new Date(boutique.dateCreation);
  const maintenant = new Date();
  const diffTime = Math.abs(maintenant.getTime() - dateCreation.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 30; // Considéré comme nouveau pendant 30 jours
}

/**
 * Obtient le texte du statut de la boutique
 * @param status - Le statut de la boutique
 * @returns Le texte formaté du statut
 */
getStatusText(status: string): string {
  switch (status?.toLowerCase()) {
    case 'ouvret':
    case 'ouvert':
    case 'open':
      return 'Ouvert';
    case 'ferme':
    case 'fermé':
    case 'closed':
    case 'fermer':
      return 'Fermé';
    case 'bientot':
    case 'bientôt':
      return 'Bientôt';
    default:
      return 'Inconnu';
  }
}

/**
 * Gère l'erreur de chargement d'image
 * @param event - L'événement d'erreur
 */
onImageError(event: any): void {
  // Masquer l'image et afficher le logo par défaut
  event.target.style.display = 'none';
}

/**
 * Animation au défilement (optionnel)
 * Vous pouvez utiliser cette méthode avec Intersection Observer
 */
private setupScrollAnimations(): void {
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observer toutes les cartes après le rendu
    setTimeout(() => {
      const cards = document.querySelectorAll('.boutique-card');
      cards.forEach(card => observer.observe(card));
    }, 100);
  }
}

/**
 * Appelée après l'initialisation du composant
 */
ngAfterViewInit(): void {
  this.setupScrollAnimations();
}

/**
 * Gestionnaire de clic pour les cartes (analytics, etc.)
 */
onBoutiqueCardClick(boutique: any): void {
  // Ici vous pouvez ajouter du tracking analytics
  console.log('Boutique consultée:', boutique.nom);
  
  // Exemple d'envoi d'événement analytics (si vous utilisez Google Analytics)
  // gtag('event', 'boutique_view', {
  //   'boutique_id': boutique.id,
  //   'boutique_name': boutique.nom
  // });
}
}
