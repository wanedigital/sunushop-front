// ============= profil.component.ts =============
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, PasswordChangeRequest, ProfilUpdateRequest } from '../../services/authservice.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css'],
  imports : [FormsModule, CommonModule]
})
export class ProfilComponent implements OnInit {
  currentUser: any | null = null;
  isEditing = false;
  loading = false;
  error = '';
  successMessage = '';

  // Formulaires
  profilForm = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: ''
  };

  passwordForm = {
    ancienMotDePasse: '',
    nouveauMotDePasse: '',
    confirmerMotDePasse: ''
  };

  showPasswordForm = false;

  constructor(
    private authService: AuthService,
    private router: Router,
        private cdRef: ChangeDetectorRef

  ) {}

  ngOnInit(): void {
    this.authService.initializeUserFromStorage(); // ← assure que le BehaviorSubject est prêt

    this.authService.getProfil().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.populateForm(user); // ← méthode à créer juste après
        this.cdRef.detectChanges();
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement du profil';
      }
    });
  }

  private populateForm(user: any): void {
    this.profilForm = {
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      telephone: user.telephone || '',
      adresse: user.adresse || ''
    };
  }


  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.error = '';
    this.successMessage = '';
        this.cdRef.detectChanges();

  }

  cancelEdit(): void {
    this.isEditing = false;
    this.error = '';
    if (this.currentUser) {
      this.profilForm = {
        nom: this.currentUser.nom || '',
        prenom: this.currentUser.prenom || '',
        email: this.currentUser.email || '',
        telephone: this.currentUser.telephone || '',
        adresse: this.currentUser.adresse || ''
      };
    }
  }

  updateProfil(): void {
    if (!this.profilForm.nom.trim() || !this.profilForm.prenom.trim()) {
      this.error = 'Le nom et prénom sont obligatoires';
      return;
    }

    this.loading = true;
    this.error = '';

    const updateData: ProfilUpdateRequest = {
      nom: this.profilForm.nom,
      prenom: this.profilForm.prenom,
      email: this.profilForm.email,
      adresse: this.profilForm.adresse,
      telephone: this.profilForm.telephone
    };

    this.authService.updateProfil(updateData).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.isEditing = false;
        this.loading = false;
        this.successMessage = 'Profil mis à jour avec succès !';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        this.error = error.error?.message || 'Erreur lors de la mise à jour du profil';
        this.loading = false;
      }
    });
  }

  /*togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    this.passwordForm = {
      ancienMotDePasse: '',
      nouveauMotDePasse: '',
      confirmerMotDePasse: ''
    };
    this.error = '';
    this.successMessage = '';
  }*/

  // États de visibilité pour les mots de passe
  showAncienMotDePasse = false;
  showNouveauMotDePasse = false;
  showConfirmerMotDePasse = false;

  // Fonctions pour basculer la visibilité
  togglePasswordVisibility(field: string): void {
    switch (field) {
      case 'ancien':
        this.showAncienMotDePasse = !this.showAncienMotDePasse;
        break;
      case 'nouveau':
        this.showNouveauMotDePasse = !this.showNouveauMotDePasse;
        break;
      case 'confirmer':
        this.showConfirmerMotDePasse = !this.showConfirmerMotDePasse;
        break;
    }
    this.cdRef.detectChanges();
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    
    // Réinitialisez les messages
    this.error = '';
    this.successMessage = '';
    
    // Réinitialisez le formulaire si on le cache
    if (!this.showPasswordForm) {
      this.passwordForm = {
        ancienMotDePasse: '',
        nouveauMotDePasse: '',
        confirmerMotDePasse: ''
      };
    }
    
    // Force la mise à jour de la vue
    this.cdRef.detectChanges();
    console.log('showPasswordForm:', this.showPasswordForm); // Debug

  }

  changePassword(): void {
    if (!this.passwordForm.ancienMotDePasse || !this.passwordForm.nouveauMotDePasse) {
      this.error = 'Tous les champs mot de passe sont obligatoires';
      return;
    }

    if (this.passwordForm.nouveauMotDePasse !== this.passwordForm.confirmerMotDePasse) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (this.passwordForm.nouveauMotDePasse.length < 6) {
      this.error = 'Le nouveau mot de passe doit contenir au moins 6 caractères';
      return;
    }

    this.loading = true;
    this.error = '';

    const passwordData: PasswordChangeRequest = {
      ancienMotDePasse: this.passwordForm.ancienMotDePasse,
      nouveauMotDePasse: this.passwordForm.nouveauMotDePasse
    };

    this.authService.changerMotDePasse(passwordData).subscribe({
      next: () => {
        this.loading = false;
        this.showPasswordForm = false;
        this.passwordForm = {
          ancienMotDePasse: '',
          nouveauMotDePasse: '',
          confirmerMotDePasse: ''
        };
        this.successMessage = 'Mot de passe modifié avec succès !';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Erreur lors du changement de mot de passe:', error);
        this.error = error.error?.message || 'Erreur lors du changement de mot de passe';
        this.loading = false;
      }
    });
  }

logout(): void {
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
      try {
        // Déconnexion de l'utilisateur
        this.authService.logout();

        // Redirection vers la page de login
        this.router.navigate(['/login']);

        // Message de confirmation
        Swal.fire('Déconnecté', 'Vous avez été déconnecté avec succès.', 'success');
      } catch (err) {
        console.error('Erreur lors de la déconnexion :', err);
        Swal.fire('Erreur', 'La déconnexion a échoué.', 'error');
      }
    }
  }).catch((err) => {
    console.error('Erreur lors de l’affichage du dialogue :', err);
    Swal.fire('Erreur', 'Une erreur est survenue.', 'error');
  });
}
}