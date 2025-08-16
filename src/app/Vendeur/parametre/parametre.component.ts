import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/authservice.service';
import { BoutiqueService } from '../../services/boutique.service';
import Swal from 'sweetalert2';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { senegalPhoneValidator, } from '../../shared/pipes/senegal-phone.validator';

@Component({
  selector: 'app-parametre',
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './parametre.component.html',
  styleUrl: './parametre.component.css'
})
export class ParametreComponent implements OnInit {
  activeTab = 'profile';
  profileForm!: FormGroup;
  boutiqueForm!: FormGroup;
  passwordForm!: FormGroup;
  user: any;
  isLoading = false;
  boutiqueInfo: any;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private boutiqueService: BoutiqueService,
    private router: Router,   
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    // Vérifier d'abord l'authentification avant de charger les données
    if (this.authService.isAuthenticated()) {
      this.loadUserData();
      if (this.isVendeur()) {
        this.loadBoutiqueData();
      }
    } else {
      this.handleUnauthenticated();
    }
  }

  // CORRECTION 1: Retourner la valeur de la méthode
  isVendeur(): boolean {
    return this.authService.isVendeur();
  }

  initForms(): void {
    // Formulaire profil avec validation téléphone sénégalais
    this.profileForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      telephone: ['', [
        // Validateur personnalisé
        (control: { value: any; }) => {
          const value = control.value;
          if (!value) return null;
          
          const cleanValue = value.replace(/\D/g, '');
          if (cleanValue.length > 0 && cleanValue.length < 12) {
            return { invalidPhone: true };
          }
          return null;
        }
      ]], 
      adresse: ['', Validators.required]
    });

    // Formulaire boutique
    this.boutiqueForm = this.fb.group({
      nom: ['', Validators.required],
      adresse: ['', Validators.required],
      numeroCommercial: ['', [
        // Validateur personnalisé
        (control: { value: any; }) => {
          const value = control.value;
          if (!value) return null;
          
          const cleanValue = value.replace(/\D/g, '');
          if (cleanValue.length > 0 && cleanValue.length < 12) {
            return { invalidPhone: true };
          }
          return null;
        }
      ]],
      status: ['ouvret']
    });

    // Formulaire mot de passe
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.checkPasswords });
  }

  checkPasswords(group: FormGroup) {
    const pass = group.get('newPassword')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notSame: true };
  }

  loadUserData(): void {
    this.isLoading = true;
    
    this.authService.getProfil().pipe(
      take(1) // Important pour éviter les fuites mémoire
    ).subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue({
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          telephone: user.telephone,
          adresse: user.adresse
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur profil:", err);
        this.isLoading = false;
        this.handleUnauthenticated();
      }
    });
  }

  loadBoutiqueData(): void {
    this.isLoading = true;
    
    this.boutiqueService.getMyBoutique().pipe(
      take(1) // Important pour éviter les fuites mémoire
    ).subscribe({
      next: (response) => {
        this.boutiqueInfo = {
          id: response.id,
          nom: response.nom,
          adresse: response.adresse,
          numeroCommercial: response.numeroCommercial || '',
          status: response.status || 'ouvret',
          image: response.logo
        };
        
        this.boutiqueForm.patchValue({
          nom: this.boutiqueInfo.nom,
          adresse: this.boutiqueInfo.adresse,
          numeroCommercial: this.boutiqueInfo.numeroCommercial,
          status: this.boutiqueInfo.status
        });
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur boutique:", err);
        this.isLoading = false;
        if (err.status === 404) {
          this.showBoutiqueNotFoundWarning();
        }
      }
    });
  }

  showBoutiqueNotFoundWarning(): void {
    Swal.fire({
      title: 'Boutique introuvable',
      text: 'Aucune boutique associée à votre compte n/ a été trouvée.',
      icon: 'info'
    });
  }

  markAllAsTouched(): void {
    Object.values(this.boutiqueForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  updateBoutique(): void {
    if (this.boutiqueForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('nom', this.boutiqueForm.get('nom')?.value);
    formData.append('adresse', this.boutiqueForm.get('adresse')?.value);
    formData.append('numeroCommercial', this.boutiqueForm.get('numeroCommercial')?.value || '');
    formData.append('status', this.boutiqueForm.get('status')?.value || 'ouvret');
    formData.append('_method', 'PUT');

    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    }

    this.boutiqueService.updateBoutique(this.boutiqueInfo.id, formData).pipe(
      take(1)
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccess('Boutique mise à jour avec succès');
        this.loadBoutiqueData();
      },
      error: (err) => {
        this.isLoading = false;
        this.handleUpdateError(err);
      }
    });
  }
  private handleUpdateError(err: any): void {
    this.isLoading = false;
    console.error('Erreur mise à jour:', err);
    
    if (err.status === 401) {
      Swal.fire({
        icon: 'error',
        title: 'Session expirée',
        text: 'Votre session a expiré. Veuillez vous reconnecter.',
      }).then(() => {
        this.authService.logout();
        this.router.navigate(['/login']);
      });
    } else if (err.status === 422) {
      // Gestion spécifique des erreurs de validation
      const errors = err.error.errors;
      let errorMessage = 'Veuillez corriger les erreurs suivantes:<ul>';
      for (const field in errors) {
        errorMessage += `<li>${errors[field].join(', ')}</li>`;
      }
      errorMessage += '</ul>';
      
      Swal.fire({
        icon: 'error',
        title: 'Erreur de validation',
        html: errorMessage
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: err.error?.message || 'Une erreur est survenue lors de la mise à jour',
      });
    }
  }

  removeLogo(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.errorMessage = null;
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!validTypes.includes(file.type)) {
        this.errorMessage = 'Seuls les fichiers JPG, PNG ou GIF sont acceptés';
        return;
      }

      if (file.size > maxSize) {
        this.errorMessage = 'Le fichier ne doit pas dépasser 2MB';
        return;
      }

      this.errorMessage = null;
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }



  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    Swal.fire({
      title: 'Confirmer le changement',
      text: 'Voulez-vous vraiment changer votre mot de passe?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4e73df',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, changer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        const { currentPassword, newPassword } = this.passwordForm.value;
        
        this.authService.changerMotDePasse({
          ancienMotDePasse: currentPassword,
          nouveauMotDePasse: newPassword
        }).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.showSuccess('Mot de passe changé avec succès');
            this.passwordForm.reset();
          },
          error: (err) => {
            console.error("Erreur changement mot de passe:", err);
            this.isLoading = false;
            const message = err.error?.message || 'Erreur lors du changement de mot de passe';
            this.showError(message);
          }
        });
      }
    });
  }

  // CORRECTION 7: Méthode utilitaire pour marquer tous les champs comme touchés
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Méthode centralisée pour gérer l'état non authentifié
  private handleUnauthenticated(): void {
    this.authService.logout();
    Swal.fire({
      title: 'Session expirée',
      text: 'Veuillez vous reconnecter pour accéder à cette page',
      icon: 'warning',
      confirmButtonText: 'Se connecter'
    }).then(() => {
      // Rediriger vers la page de connexion si nécessaire
       this.router.navigate(['/login']);
    });
  }

  showSuccess(message: string): void {
    Swal.fire({
      title: 'Succès!',
      text: message,
      icon: 'success',
      confirmButtonColor: '#4e73df'
    });
  }

  showError(message: string): void {
    Swal.fire({
      title: 'Erreur!',
      text: message,
      icon: 'error',
      confirmButtonColor: '#4e73df'
    });
  }

  // ========== MÉTHODES POUR LE NUMÉRO COMMERCIAL (BOUTIQUE) ==========

  // Détecte l'opérateur à partir du numéro commercial
  detectOperator(): string | null {
    const phone = this.boutiqueForm.get('numeroCommercial')?.value;
    if (!phone) return null;

    const cleanPhone = phone.replace(/\D/g, '');
    const prefix = cleanPhone.substring(3, 5); // Extrait les 2 chiffres après +221

    const operators: {[key: string]: string} = {
      '77': 'Orange',
      '76': 'Free',
      '70': 'Expresso',
      '78': 'Orange',
      '75': 'Promobile',
      '33': 'Expresso',
      '30': 'Expresso'
    };

    return operators[prefix] || null;
  }

  // Formatage automatique pendant la saisie du numéro commercial
  onNumeroCommercialInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    const oldValue = input.value;
    
    // Formater la valeur
    let formatted = this.formatSenegalPhone(input.value);
    
    // Mettre à jour le formulaire
    this.boutiqueForm.patchValue({
      numeroCommercial: formatted
    }, { emitEvent: false });
    
    // Corriger la position du curseur
    setTimeout(() => {
      const newCursorPosition = this.calculateNewCursorPosition(oldValue, formatted, cursorPosition);
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  }

  // Gestion du collage pour le numéro commercial
  onNumeroCommercialPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const formatted = this.formatSenegalPhone(pastedText);
    
    this.boutiqueForm.patchValue({
      numeroCommercial: formatted
    });
  }

  // Validation du numéro commercial
  getNumeroCommercialError(): string {
    const phone = this.boutiqueForm.get('numeroCommercial')?.value;
    if (!phone) return '';
    
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length > 0 && !cleanPhone.startsWith('221')) {
      return 'Le numéro doit commencer par +221';
    }
    
    if (cleanPhone.length < 12) {
      return 'Numéro incomplet. Format: +221 XX XXX XX XX';
    }
    
    const prefix = cleanPhone.substring(3, 5);
    const validPrefixes = ['77', '76', '70', '78', '75', '33', '30'];
    
    if (!validPrefixes.includes(prefix)) {
      return 'Préfixe invalide. Utilisez: 77/78 (Orange), 76 (Free), 70 (Expresso)';
    }
    
    return '';
  }

  // ========== MÉTHODES UTILITAIRES COMMUNES ==========

  // Formatage du numéro pour la boutique (garde le format existant)
  private formatSenegalPhone(value: string): string {
    if (!value) return '';
    
    // Nettoyer la valeur
    let cleanValue = value.replace(/\D/g, '');
    
    // Ajouter +221 si nécessaire
    if (cleanValue.length > 0 && !cleanValue.startsWith('221')) {
      cleanValue = '221' + cleanValue;
    }
    
    // Limiter à 12 chiffres (221 + 9)
    cleanValue = cleanValue.substring(0, 12);
    
    // Formater selon le pattern +221 XX XXX XX XX
    let formatted = '+221';
    const localNumber = cleanValue.substring(3);
    
    if (localNumber.length > 0) {
      formatted += ' ' + localNumber.substring(0, 2);
    }
    if (localNumber.length > 2) {
      formatted += ' ' + localNumber.substring(2, 5);
    }
    if (localNumber.length > 5) {
      formatted += ' ' + localNumber.substring(5, 7);
    }
    if (localNumber.length > 7) {
      formatted += ' ' + localNumber.substring(7, 9);
    }
    
    return formatted;
  }


  // Calcul de la position du curseur
  private calculateNewCursorPosition(oldValue: string, newValue: string, oldPosition: number): number {
    // Logique pour maintenir le curseur au bon endroit
    // (implémentation plus sophistiquée possible)
    return Math.min(oldPosition + (newValue.length - oldValue.length), newValue.length);
  }

  // ========== NOUVELLES MÉTHODES POUR LE TÉLÉPHONE ==========

// Détecte l'opérateur à partir du numéro de téléphone
detectTelephoneOperator(): string | null {
  const phone = this.profileForm.get('telephone')?.value;
  if (!phone) return null;

  const cleanPhone = phone.replace(/\D/g, '');
  const prefix = cleanPhone.substring(3, 5); // Extrait les 2 chiffres après +221

  const operators: {[key: string]: string} = {
    '77': 'Orange',
    '76': 'Free',
    '70': 'Expresso',
    '78': 'Orange',
    '75': 'Promobile'
  };

  return operators[prefix] || null;
}

// Formatage automatique pendant la saisie du téléphone
onTelephoneInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  const cursorPosition = input.selectionStart || 0;
  const oldValue = input.value;
  
  // Formater la valeur
  let formatted = this.formatSenegalPhone(input.value);
  
  // Mettre à jour le formulaire
  this.profileForm.patchValue({
    telephone: formatted
  }, { emitEvent: false });
  
  // Corriger la position du curseur
  setTimeout(() => {
    const newCursorPosition = this.calculateNewCursorPosition(oldValue, formatted, cursorPosition);
    input.setSelectionRange(newCursorPosition, newCursorPosition);
  }, 0);
}

// Gestion du collage pour le téléphone
onTelephonePaste(event: ClipboardEvent): void {
  event.preventDefault();
  const pastedText = event.clipboardData?.getData('text') || '';
  const formatted = this.formatSenegalPhone(pastedText);
  
  this.profileForm.patchValue({
    telephone: formatted
  });
}

// Validation du téléphone avec message d'erreur personnalisé
getTelephoneError(): string {
  const phone = this.profileForm.get('telephone')?.value;
  if (!phone) return '';
  
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length > 0 && !cleanPhone.startsWith('221')) {
    return 'Le numéro doit commencer par +221';
  }
  
  if (cleanPhone.length < 12) {
    return 'Numéro incomplet. Format: +221 XX XXX XX XX';
  }
  
  const prefix = cleanPhone.substring(3, 5);
  const validPrefixes = ['77', '76', '70', '78', '75'];
  
  if (!validPrefixes.includes(prefix)) {
    return 'Préfixe invalide. Utilisez: 77/78 (Orange), 76 (Free), 70 (Expresso), 75 (Promobile)';
  }
  
  return '';
}

// ========== MODIFICATION DE LA MÉTHODE updateProfile() ==========

updateProfile(): void {
  if (this.profileForm.invalid) {
    this.markFormGroupTouched(this.profileForm);
    return;
  }
  
  Swal.fire({
    title: 'Confirmer la modification',
    text: 'Voulez-vous vraiment mettre à jour votre profil?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#4e73df',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Oui, mettre à jour',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;
      // getRawValue inclut les champs disabled
      const profileData = this.profileForm.getRawValue();
      // Supprimer le champ phoneOperator avant l'envoi
      delete profileData.phoneOperator;
      
      this.authService.updateProfil(profileData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showSuccess('Profil mis à jour avec succès');
          // Recharger les données utilisateur
          this.loadUserData();
        },
        error: (err) => {
          console.error("Erreur mise à jour profil:", err);
          this.isLoading = false;
          this.showError(err.error?.message || 'Erreur lors de la mise à jour du profil');
        }
      });
    }
  });
}
  
}