import { CommonModule, NgIf, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/authservice.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, NgIf, NgClass,  ReactiveFormsModule,RouterModule] ,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  returnUrl: string = '/accueil'; // valeur par défaut

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService,   
    private route: ActivatedRoute, ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
    });

    // Récupérer returnUrl depuis les query params
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    })
  }

onSubmit() {
  if (this.loginForm.valid) {
    this.isLoading = true;
    this.errorMessage = '';

    const loginData = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      remember: this.loginForm.value.remember
    };

    this.authService.login(loginData).subscribe({
      next: (result) => {
        if (result && result.token) {
          // Stocker le token
          localStorage.setItem('token', JSON.stringify(result.token));
          console.log('✅ Token enregistré :', result.token);

          // Stocker l'utilisateur
          localStorage.setItem('user', JSON.stringify(result.user));
          console.log('✅ Utilisateur connecté :', result.user);

          // Vérifier le rôle
          const role = result.user['profil']?.libelle;
          if (role === 'Vendeur') {
            const boutiqueId = result.user['boutique']?.id;
            if (boutiqueId) {
              // Redirection vers la page boutique
              this.router.navigate(['/vendeur/produit']);
            } else {
              console.warn('⚠️ Aucun ID de boutique trouvé pour ce vendeur.');
              this.router.navigate(['/accueil']); // ou une autre page par défaut
            }
          } else {
            // Redirection standard
            this.router.navigate([this.returnUrl]);
          }
        } else {
          console.error('❌ Aucun token reçu depuis l’API');
          this.errorMessage = 'Erreur lors de la connexion.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur de connexion:', error);
        this.errorMessage = 'Identifiants incorrects';
        this.isLoading = false;
      }
    });
  }
}




  
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}