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
          
          },
        error: (error) => {
          console.error("Erreur:", error);
          this.isLoading = false;
        }
      });
      setTimeout(() => {
        this.isLoading = false;
        // ✅ Redirection dynamique après login
          this.router.navigate([this.returnUrl]);      
        }, 2000);
    }
  }
  
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}