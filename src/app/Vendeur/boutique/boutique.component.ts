import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceService } from '../../services/service.service';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../../services/authservice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-boutique',
  templateUrl: './boutique.component.html',
  imports: [CommonModule, ReactiveFormsModule, NgIf],
  styleUrls: ['./boutique.component.css']
})
export class BoutiqueComponent {
  boutiqueForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private boutiqueService: ServiceService,
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

  removeLogo(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.boutiqueForm.patchValue({ logo: null });
    this.boutiqueForm.get('logo')?.setErrors(null);
  }

  onFileChange(event: any): void {
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
  formData.append('id_user', this.auth.getIdUser());

  if (this.selectedFile) {
    formData.append('logo', this.selectedFile);
  }

  if (this.auth.isAuthenticated()) {
    // Vérifier d'abord si une boutique avec les mêmes informations existe déjà
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

        // Si aucune boutique existante avec ces infos, procéder à la création
        this.boutiqueService.createBoutique(formData).subscribe({
          next: (res) => {
            this.isLoading = false;
            Swal.fire({
              title: "Boutique créée!",
              text: "Votre nouvelle boutique a été enregistrée avec succès.",
              icon: "success"
            });  
            this.resetForm();
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 3000);
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
      status: 'ouvret' // Réinitialiser avec le bon statut
    });
    this.selectedFile = null;
    this.previewUrl = null;
    const fileInput = document.getElementById('logoInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  isInvalid(controlName: string): boolean {
    const control = this.boutiqueForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get logoInvalid(): boolean {
    const control = this.boutiqueForm.get('logo');
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }
}