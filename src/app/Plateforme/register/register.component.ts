import { CommonModule, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/authservice.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIf, RouterModule]
})
export class RegisterComponent {
  // État du composant
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  passwordStrength = 0;
  detectedOperator = '';

  // Injection de dépendances
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Formulaire
  registerForm: FormGroup;

  // Opérateurs sénégalais
  private operators = [
    { name: 'Orange', prefixes: ['77', '78', '70'] },
    { name: 'Free', prefixes: ['76'] },
    { name: 'Expresso', prefixes: ['75'] },
    { name: 'Promobile', prefixes: ['33'] }
  ];

  constructor() {
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      adresse: ['', Validators.required],
      telephone: ['+221'], // Valeur par défaut +221
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      ]],
      password_confirmation: ['', Validators.required],
      profil: ['Client', Validators.required],
      terms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  // Méthode pour détecter l'opérateur
  private detectOperator(phoneNumber: string): string {
    // Extraire les 2 premiers chiffres après +221
    const prefix = phoneNumber.replace('+221', '').substring(0, 2);
    
    for (const operator of this.operators) {
      if (operator.prefixes.includes(prefix)) {
        return operator.name;
      }
    }
    return '';
  }

  // Méthode pour gérer la saisie du téléphone
  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Si l'utilisateur efface tout, remettre +221
    if (value === '' || value === '+') {
      value = '+221';
      input.value = value;
      this.registerForm.patchValue({ telephone: value });
      this.detectedOperator = '';
      return;
    }
    
    // Si l'utilisateur ne commence pas par +221, forcer +221
    if (!value.startsWith('+221')) {
      // Nettoyer la valeur en gardant seulement les chiffres
      const numbers = value.replace(/\D/g, '');
      value = '+221' + (numbers.length > 3 ? numbers.substring(3) : '');
    }
    
    // Limiter à 9 chiffres après +221 (soit +221XXXXXXXXX = 13 caractères au total)
    if (value.length > 13) {
      value = value.substring(0, 13);
    }
    
    // Extraire seulement les chiffres après +221
    const phoneDigits = value.replace('+221', '');
    if (phoneDigits.length > 9) {
      value = '+221' + phoneDigits.substring(0, 9);
    }
    
    input.value = value;
    this.registerForm.patchValue({ telephone: value });
    
    // Détecter l'opérateur si on a au moins 2 chiffres
    if (phoneDigits.length >= 2) {
      this.detectedOperator = this.detectOperator(value);
    } else {
      this.detectedOperator = '';
    }
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
      this.registerForm.markAllAsTouched();
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