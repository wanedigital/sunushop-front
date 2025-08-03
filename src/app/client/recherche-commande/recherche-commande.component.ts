import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommandeService } from '../../services/commande.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-recherche-commande',
  templateUrl: './recherche-commande.component.html',
  styleUrls: ['./recherche-commande.component.css'],
  imports : [FormsModule,NgIf]
})
export class RechercheCommandeComponent {
  formData = {
    numeroCommande: '',
    email: ''
  };
  
  loading = false;
  error = '';

  constructor(
    private commandeService: CommandeService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    this.loading = true;
    this.error = '';

    this.commandeService.getCommandeInvite({
      numeroCommande: this.formData.numeroCommande.trim(),
      email: this.formData.email.trim()
    }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          // Rediriger vers la page de confirmation avec les paramètres
          this.router.navigate(['/client/commande/confirmation'], {
            queryParams: {
              numero: response.data.numeroCommande,
              email: this.formData.email
            }
          });
        } else {
          this.error = response.message || 'Commande introuvable';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Erreur lors de la recherche. Vérifiez vos informations.';
      }
    });
  }

  isFormValid(): boolean {
    return this.formData.numeroCommande.trim() !== '' && 
           this.formData.email.trim() !== '' &&
           this.isValidEmail(this.formData.email);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  clearForm(): void {
    this.formData = {
      numeroCommande: '',
      email: ''
    };
    this.error = '';
  }
}
