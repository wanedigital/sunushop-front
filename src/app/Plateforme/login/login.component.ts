import { CommonModule, NgIf, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authservice.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, NgIf, NgClass,  ReactiveFormsModule] ,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
    });
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
        this.router.navigate(['/accueil']);
      }, 2000);
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}