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
      status: ['ouvret', Validators.required],
      logo: [null, Validators.required] // Contrôle pour la validation du fichier
    });
  }

  // Méthode pour supprimer le logo sélectionné
  removeLogo(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.boutiqueForm.patchValue({ logo: null });
    this.boutiqueForm.get('logo')?.setErrors(null); // Réinitialise les erreurs de validation
  }

  // Gestion du changement de fichier
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validation du fichier
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
      this.boutiqueForm.patchValue({ logo: file });

      // Création de l'aperçu
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Soumission du formulaire
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
    formData.append('status', this.boutiqueForm.get('status')?.value);
    formData.append('id_user', this.auth.getIdUser());

    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    }

    if(this.auth.isAuthenticated()){
       this.boutiqueService.createBoutique(formData).subscribe({
      next: (res) => {
        this.isLoading = false;
        Swal.fire({
          title: "Création!",
          text: "Veuillez patientez ",
          icon: "success"
        });  
        this.resetForm();
        // Redirection après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error.message || 'Une erreur est survenue';
        console.error('Erreur:', err);
      }
    });
    }else{
      Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: "Impossible de créer la boutique car vous n'êtes pas connecté.",
          showConfirmButton: true
        }).then(() => {
          // Redirige vers la page de connexion avec l'URL de retour
          this.router.navigate(['/login'], { queryParams: { returnUrl: '/boutique' } });
        });      
    }
   
  }

  // Marque tous les champs comme touchés pour afficher les erreurs
  private markAllAsTouched(): void {
    Object.values(this.boutiqueForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  // Réinitialise le formulaire
  private resetForm(): void {
    this.boutiqueForm.reset({
      status: 'ouvret'
    });
    this.selectedFile = null;
    this.previewUrl = null;
    // Réinitialise l'input file
    const fileInput = document.getElementById('logoInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  // Vérifie si un champ est invalide
  isInvalid(controlName: string): boolean {
    const control = this.boutiqueForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

   get logoInvalid(): boolean {
    const control = this.boutiqueForm.get('logoFile');
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }
}