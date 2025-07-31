import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ServiceService } from '../../services/service.service';

@Component({
  selector: 'app-acceuil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AcceuilComponent {
  boutiques: any = [];
  isLoading = true;
  boutique: any = [];

  constructor(private boutiqueService: ServiceService) {}

  ngOnInit(): void {
    this.loadBoutiques();
  }

  loadBoutiques(): void {
    this.boutiqueService.getBoutiques().subscribe({
      next: (data) => {
        this.boutiques = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    return status === 'ouvret' ? 'bg-success' : 'bg-secondary';
  }

  getStatusText(status: string): string {
    return status === 'ouvret' ? 'Ouvert' : 'Fermé';
  }
}