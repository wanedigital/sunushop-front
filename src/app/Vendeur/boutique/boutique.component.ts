import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceService } from '../../services/service.service';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../../services/authservice.service';
import Swal from 'sweetalert2';
import { BoutiqueService } from '../../services/boutique.service';

@Component({
  selector: 'app-boutique',
  templateUrl: './boutique.component.html',
  imports: [CommonModule, ReactiveFormsModule, NgIf],
  styleUrls: ['./boutique.component.css']
})
export class BoutiqueComponent implements OnInit {
  boutiqueForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  isLoading = false;
  isCheckingBoutique = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  hasExistingBoutique: boolean = false;
  existingBoutique: any = null;

  constructor(
    private fb: FormBuilder,
    private boutiqueService: ServiceService,
    private serviceBoutique: BoutiqueService,

    private router: Router,
    private auth: AuthService
  ) {
    this.boutiqueForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      adresse: ['', Validators.required],
      numeroCommercial: ['', Validators.required],
      status: ['ouvret'], 
      logo: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.checkExistingBoutique();
  }

  checkExistingBoutique(): void {
    if (this.auth.isAuthenticated()) {
      this.isCheckingBoutique = true;
      
      this.serviceBoutique.hasBoutique().subscribe({
        next: (response: any) => {
          this.isCheckingBoutique = false;
          this.hasExistingBoutique = response.has_boutique;
          this.existingBoutique = response.boutique;
          
          if (this.hasExistingBoutique) {
            this.disableForm();
            this.showBoutiqueExistsAlert();
            
            // Vérifier si le statut est "ouvret" et rediriger
            if (this.existingBoutique && this.existingBoutique.status === 'ouvret') {
              this.redirectToVendorPage();
            }
          }
        },
        error: (err) => {
          this.isCheckingBoutique = false;
          console.error('Erreur vérification boutique:', err);
        }
      });
    }
  }

  // Nouvelle méthode pour surveiller les changements de statut
  checkStatusAndRedirect(): void {
    if (this.hasExistingBoutique && this.existingBoutique) {
      // Vérifier périodiquement le statut
      this.serviceBoutique.hasBoutique().subscribe({
        next: (response: any) => {
          if (response.has_boutique && response.boutique) {
            const newStatus = response.boutique.status;
            
            // Si le statut a changé et est maintenant "ouvret"
            if (newStatus === 'ouvret' && this.existingBoutique.status !== 'ouvret') {
              this.existingBoutique.status = newStatus;
              this.redirectToVendorPage();
            }
          }
        },
        error: (err) => {
          console.error('Erreur vérification statut:', err);
        }
      });
    }
  }

  redirectToVendorPage(): void {
    Swal.fire({
      title: '✅ Boutique activée!',
      text: 'Votre boutique a été validée. Vous allez être redirigé vers votre espace vendeur.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#007bff',
      timer: 3000,
      timerProgressBar: true
    }).then(() => {
      this.router.navigate(['/vendeur/produit']);
    });
  }

  disableForm(): void {
    this.boutiqueForm.disable();
    const fileInput = document.getElementById('logoInput') as HTMLInputElement;
    if (fileInput) fileInput.disabled = true;
  }

  enableForm(): void {
    this.boutiqueForm.enable();
    const fileInput = document.getElementById('logoInput') as HTMLInputElement;
    if (fileInput) fileInput.disabled = false;
  }

  showBoutiqueExistsAlert(): void {
    Swal.fire({
      title: 'Boutique existante',
      html: `Vous avez déjà une boutique :<br><br>
            <strong>Nom:</strong> ${this.existingBoutique.nom}<br>
            <strong>Statut:</strong> ${this.getStatusLabel(this.existingBoutique.status)}<br><br>
            ${this.existingBoutique.status !== 'ouvret' ? 
              'En attente de validation par les administrateurs.' : 
              'Votre boutique est active !'}`,
      icon: 'info',
      confirmButtonText: this.existingBoutique.status === 'ouvret' ? 'Accéder à ma boutique' : 'Compris',
      confirmButtonColor: '#007bff',
      showCancelButton: this.existingBoutique.status !== 'ouvret',
      cancelButtonText: 'Actualiser le statut'
    }).then((result) => {
      if (result.isConfirmed && this.existingBoutique.status === 'ouvret') {
        this.router.navigate(['/vendeur/produits']);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.checkStatusAndRedirect();
      }
    });
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'ouvret': '✅ Ouvert',
      'ferme': '❌ Fermé',
      'en_attente': '⏳ En attente'
    };
    return statusLabels[status] || status;
  }

  removeLogo(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.boutiqueForm.patchValue({ logo: null });
    this.boutiqueForm.get('logo')?.setErrors(null);
  }

  onFileChange(event: any): void {
    if (this.hasExistingBoutique) return;
    
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 2 * 1024 * 1024;

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
      this.boutiqueForm.patchValue({ logo: file });

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.hasExistingBoutique) {
      this.showBoutiqueExistsAlert();
      return;
    }

    this.errorMessage = null;
    this.successMessage = null;

    if (this.boutiqueForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('nom', this.boutiqueForm.get('nom')?.value);
    formData.append('adresse', this.boutiqueForm.get('adresse')?.value);
    formData.append('numeroCommercial', this.boutiqueForm.get('numeroCommercial')?.value);
    formData.append('status', 'ouvret'); 
    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    }

    if (this.auth.isAuthenticated()) {
      this.boutiqueService.getBoutiques().subscribe({
        next: (boutiques: any[]) => {
          const nomBoutique = this.boutiqueForm.get('nom')?.value;
          const adresseBoutique = this.boutiqueForm.get('adresse')?.value;
          const numCommercial = this.boutiqueForm.get('numeroCommercial')?.value;

          const boutiqueExistante = boutiques.find(b => 
            b.nom === nomBoutique || 
            b.adresse === adresseBoutique ||
            b.numeroCommercial === numCommercial
          );

          if (boutiqueExistante) {
            this.isLoading = false;
            Swal.fire({
              icon: 'warning',
              title: 'Boutique existante',
              html: `Une boutique avec ces informations existe déjà:<br><br>
                    <strong>Nom:</strong> ${boutiqueExistante.nom}<br>
                    <strong>Adresse:</strong> ${boutiqueExistante.adresse}<br>
                    <strong>Numéro commercial:</strong> ${boutiqueExistante.numeroCommercial}`,
              showConfirmButton: true
            });
            return;
          }

          this.boutiqueService.createBoutique(formData).subscribe({
            next: (res: any) => {
              this.isLoading = false;
              
              Swal.fire({
                title: "✅ Demande envoyée!",
                html: `
                  <div style="text-align: left;">
                    <p>Votre demande de création de boutique a été envoyée.</p>
                    <p><strong>Statut:</strong> ⏳ En attente de validation</p>
                    
                    ${res.email_sent ? 
                      `<p><strong>📧 Email envoyé à : ${res.email_address}</strong></p>
                       <p>Veuillez vérifier votre boîte mail pour valider votre compte vendeur.</p>` : 
                      `<p><strong>❌ Email non envoyé</strong></p>
                       <p>Utilisez le lien ci-dessous pour valider manuellement :</p>`
                    }
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                      <strong>Lien de validation :</strong><br>
                      <div style="display: flex; align-items: center; margin-top: 10px;">
                        <input type="text" id="validationLink" value="${res.validation_url}" 
                               style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                               readonly>
                        <button onclick="copyLink()" 
                                style="margin-left: 10px; padding: 8px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                          📋 Copier
                        </button>
                      </div>
                    </div>
                    
                    <p style="color: #6c757d; font-size: 14px; margin-top: 10px;">
                      <i>⏰ Valable 60 minutes | Vérifiez vos spams si besoin</i>
                    </p>
                  </div>
                `,
                icon: "info",
                confirmButtonText: "Fermer",
                confirmButtonColor: "#007bff",
                width: '650px',
                didOpen: () => {
                  (window as any).copyLink = () => {
                    const input = document.getElementById('validationLink') as HTMLInputElement;
                    input.select();
                    document.execCommand('copy');
                    Swal.showValidationMessage('Lien copié !');
                    setTimeout(() => Swal.resetValidationMessage(), 2000);
                  };
                }
              });  
              
              this.resetForm();
              this.hasExistingBoutique = true;
              this.existingBoutique = { 
                nom: this.boutiqueForm.get('nom')?.value,
                status: 'en_attente' 
              };
              this.disableForm();
              
              // Démarrer la surveillance du statut
              this.startStatusMonitoring();
            },
            error: (err) => {
              this.handleCreationError(err);
            }
          });
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: "Impossible de vérifier les boutiques existantes",
          });
        }
      });
    } else {
      this.handleNotAuthenticated();
    }
  }

  startStatusMonitoring(): void {
    // Vérifier le statut toutes les 30 secondes
    const interval = setInterval(() => {
      if (this.hasExistingBoutique) {
        this.serviceBoutique.hasBoutique().subscribe({
          next: (response: any) => {
            if (response.has_boutique && response.boutique) {
              const newStatus = response.boutique.status;
              
              if (newStatus === 'ouvret') {
                clearInterval(interval);
                this.existingBoutique.status = newStatus;
                this.redirectToVendorPage();
              }
            }
          },
          error: (err) => {
            console.error('Erreur monitoring statut:', err);
          }
        });
      } else {
        clearInterval(interval);
      }
    }, 30000); // 30 secondes
  }

  private handleCreationError(err: any): void {
    this.isLoading = false;
    console.error('Erreur création:', err);
    
    if (err.status === 401) {
      Swal.fire({
        icon: 'error',
        title: 'Session expirée',
        text: 'Votre session a expiré. Veuillez vous reconnecter.',
        showConfirmButton: true
      }).then(() => {
        this.auth.logout(); 
        this.router.navigate(['/login'], { 
          queryParams: { returnUrl: '/boutique' } 
        });
      });
    } else {
      this.errorMessage = err.error?.message || 'Une erreur est survenue lors de la création de la boutique';
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: this.errorMessage || "Erreur lors de la création de la boutique",
      });
    }
  }

  private handleNotAuthenticated(): void {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: "Impossible de créer la boutique car vous n'êtes pas connecté.",
      showConfirmButton: true
    }).then(() => {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/creatboutique' } });
    });
  }

  private markAllAsTouched(): void {
    Object.values(this.boutiqueForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private resetForm(): void {
    this.boutiqueForm.reset({
      status: 'ouvret'
    });
    this.selectedFile = null;
    this.previewUrl = null;
    const fileInput = document.getElementById('logoInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  isInvalid(controlName: string): boolean {
    if (this.hasExistingBoutique) return false;
    const control = this.boutiqueForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get logoInvalid(): boolean {
    if (this.hasExistingBoutique) return false;
    const control = this.boutiqueForm.get('logo');
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  get canShowForm(): boolean {
    return !this.isCheckingBoutique && !this.hasExistingBoutique;
  }

  get isFormDisabled(): boolean {
    return this.hasExistingBoutique || this.isCheckingBoutique;
  }
}