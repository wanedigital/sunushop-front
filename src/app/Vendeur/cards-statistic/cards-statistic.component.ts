import { Component, OnInit } from '@angular/core';
import { Commande, CommandeService } from '../../services/commande.service';
import { Produit, ServiceService } from '../../services/service.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { StatistiqueService } from '../../services/statistique.service';

@Component({
  selector: 'app-card-statistic',
  imports: [],
  templateUrl: './cards-statistic.component.html',
  styleUrl: './cards-statistic.component.css'
})
export class CardsStatisticComponent implements OnInit{

  commandes: Commande[] = [];
  filteredCommandes: Commande[] = [];
  totalCommande=0;
  terminees=0;
  prodsAll: Produit[] = []; // Stocke tous les produits
  filteredProds: Produit[] = []; // Produits filtrés
  totalItems=0;
  boutiqueInfo: any = {};
  totalQuantiteProduits= 0;
  totalClients= 0;

  ngOnInit(): void {
    this.loadCommande()
    this.loadProduitsVendeur();
    this.loadClients();
  }
  constructor(private commandeService: CommandeService,private produitService: ServiceService,
    private router: Router,private statistiqueService: StatistiqueService
  ){}
  loadCommande() {
  setTimeout(() => {
    this.commandeService.getCommandesByBoutique(10).subscribe({
      next: (res) => {
        this.commandes = res.data;
        const terminees = this.commandes.filter(c => c.etat === 'terminer');
        this.totalCommande=this.commandes.length
        if(terminees){
          this.terminees=+1;
        }
        console.log('Commandes terminees :', this.terminees);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des commandes:', err);
        console.log('Impossible de charger les commandes');
      }
    });
  }, 500);
}

loadProduitsVendeur(): void {
  this.produitService.getProduitsVendeur().subscribe({
    next: (response) => {
      // Stocke les infos de la boutique
      this.boutiqueInfo = response;
      console.log("Infos Boutique :", this.boutiqueInfo);

      // Stocke tous les produits
      this.prodsAll = response.produits || [];
      this.filteredProds = [...this.prodsAll];
      this.totalItems = this.filteredProds.length;

      // Calcule la quantité totale
      const totalQuantite = this.prodsAll.reduce((acc, produit) => acc + (produit.quantite || 0), 0);
      console.log('Quantité totale des produits :', totalQuantite);

      // Tu peux aussi stocker cette valeur dans une variable si tu veux l'afficher dans le template
      this.totalQuantiteProduits = totalQuantite;
    },

    error: (err) => {
      if (err.status === 401) {
        this.router.navigate(['/login']);
        Swal.fire({
          title: 'Session expirée',
          text: 'Veuillez vous reconnecter',
          icon: 'warning',
        });
      } else {
        Swal.fire('Erreur', 'Impossible de charger les produits', 'error');
      }
    }
  });
}
loadClients(){
  this.statistiqueService.getClients().subscribe({
      next: (data) => {
        if (data.success) {
          this.totalClients = data.nombre_total;
          console.log("totalClients :", this.totalClients)
        }
      },
      error: (err) => {
        console.error('Erreur API', err);
      }
    });
  }
}
