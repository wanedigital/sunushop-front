import { CommonModule, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authservice.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,NgIf ]
})
export class RegisterComponent {


  // État du composant
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  passwordStrength = 0;

  // Injection de dépendances
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Formulaire
  registerForm: FormGroup;

  constructor() {
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      adresse: ['', Validators.required],
      telephone: [''],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      ]],
      password_confirmation: ['', Validators.required],
      profil: ['Client', Validators.required], // Ajouté pour correspondre au backend
      terms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  // Validateur personnalisé
  private passwordMatchValidator = (form: FormGroup) => {
  const password = form.get('password')?.value;
  const confirmPassword = form.get('password_confirmation')?.value;
  return password === confirmPassword ? null : { mismatch: true };
}


  // Vérification de la force du mot de passe
  checkPasswordStrength() {
    const password = this.registerForm.get('password')?.value;
    let strength = 0;
    
    if (password?.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    this.passwordStrength = strength * 25;
  }

  // Soumission du formulaire
 onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;

      const registerData = {
        nom: this.registerForm.value.nom,
        prenom: this.registerForm.value.prenom,
        telephone: this.registerForm.value.telephone,
        adresse: this.registerForm.value.adresse,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        password_confirmation: this.registerForm.value.password_confirmation,
        profil: this.registerForm.value.profil 
      };

      this.authService.register(registerData).subscribe({
        next: (result) => {
          console.log("Résultat:", result);
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error("Erreur:", error);
          this.isLoading = false;
        }
      });
    

      } else {
      console.warn("Formulaire invalide", this.registerForm.errors);
      this.registerForm.markAllAsTouched(); // Force l'affichage des erreurs
    }
  }


  // Basculer la visibilité du mot de passe
  togglePassword(field: 'password' | 'password_confirmation') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
}