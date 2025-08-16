import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { ServiceService, Produit, Categorie } from '../../services/service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [FormsModule , CommonModule,NgFor],
  
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  produits: Produit[] = [];
  prods: Produit[] = [];

  selectAll = false;
  showModal = false;
  categories: Categorie[] = []; 
  editingProduit: Produit | null = null;
  modalData: Produit = this.initEmptyProduct();
  isLoading = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  paginationPages: number[] = [];
  prodsAll: Produit[] = []; // Stocke tous les produits
 filteredProds: Produit[] = []; // Produits filtrés
  searchTerm: string = ''; // Terme de recherche

  constructor(private produitService: ServiceService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProduitsVendeur()
  }

  initEmptyProduct(): Produit {
    return {
      id: undefined,
      libelle: '',
      description: '',
      prix: 0,
      quantite: 0,
      disponible: true,
      categorie_id: 1,
      image: '',
      selected: false
    };
  }

loadProduitsVendeur(): void {
  this.isLoading = true;
  
  this.produitService.getProduitsVendeur().subscribe({
    next: (response) => {
      this.boutiqueInfo = response
      console.log("Infos Boutique :", this.boutiqueInfo)

      
      // Stocke tous les produits
      this.prodsAll = response.produits;
      this.filteredProds = [...this.prodsAll];
      this.totalItems = this.filteredProds.length;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      
      // Affiche la première page
      this.updateDisplayedProducts();
      this.updatePaginationPages();
      
      this.isLoading = false;
    },
    error: (err) => {
      this.isLoading = false;
      if (err.status === 401) {
        Swal.fire({
          title: 'Session expirée',
          text: 'Veuillez vous reconnecter',
          icon: 'warning'
        });
      } else {
        Swal.fire('Erreur', 'Impossible de charger les produits', 'error');
      }
    }
  });
}

// Nouvelle méthode pour filtrer les produits
filterProducts(): void {
  if (!this.searchTerm) {
    this.filteredProds = [...this.prodsAll];
  } else {
    const term = this.searchTerm.toLowerCase();
    this.filteredProds = this.prodsAll.filter(p => 
      p.libelle.toLowerCase().includes(term) || 
      (p.description && p.description.toLowerCase().includes(term)) ||
      p.prix.toString().includes(term) ||
      this.getCategorieName(p.categorie_id).toLowerCase().includes(term)
    );
  }
  
  this.totalItems = this.filteredProds.length;
  this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  this.currentPage = 1;
  this.updateDisplayedProducts();
  this.updatePaginationPages();
}

// Modifiez updateDisplayedProducts()
updateDisplayedProducts(): void {
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  this.prods = this.filteredProds.slice(startIndex, endIndex);
}
// Ajoutez cette méthode pour gérer les changements de recherche
onSearchChange(): void {
  this.filterProducts();
}
 getCategorieName(categorieId: number): string {
  if (!this.categories || this.categories.length === 0) return 'Chargement...';
  const categorie = this.categories.find(c => c.id === categorieId);
  return categorie ? categorie.libelle : 'Inconnue';
}

async loadCategories() {
  try {
    const categories = await this.produitService.getCategories().toPromise();
    if (categories) {
      this.categories = categories;
      console.log('Catégories chargées:', this.categories); // Vérifiez la structure ici
    }
  } catch (err) {
    console.error('Erreur chargement catégories:', err);
    Swal.fire('Erreur', 'Impossible de charger les catégories', 'error');
  }
}
boutiqueInfo: any = {};

  toggleAllSelection(): void {
    this.produits.forEach(p => p.selected = this.selectAll);
  }

  onCheckboxChange(): void {
    this.selectAll = this.produits.every(p => p.selected);
  }

  openAddModal(): void {
    this.editingProduit = null;
    this.modalData = this.initEmptyProduct();
    this.selectedImage = null;
    this.imagePreview = null;
    this.showModal = true;
  }

  openEditModal(produit: Produit): void {
    this.editingProduit = { ...produit };
    this.modalData = { ...produit };
    this.selectedImage = null;
    this.imagePreview = produit.image 
      ? `http://localhost:8000/storage/${produit.image}` 
      : null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  handleImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0];
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    this.selectedImage = null;
    this.modalData.image = '';
  }

saveProduit(): void {
    // Validation renforcée
    if (!this.modalData.libelle || !this.modalData.prix || !this.modalData.quantite || !this.modalData.categorie_id) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('libelle', this.modalData.libelle);
    formData.append('description', this.modalData.description || '');
    formData.append('prix', this.modalData.prix.toString());
    formData.append('quantite', this.modalData.quantite.toString());
    formData.append('disponible', this.modalData.disponible ? '1' : '0');
    formData.append('categorie_id', this.modalData.categorie_id.toString());

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    const request = this.editingProduit?.id
      ? this.produitService.updateProduit(this.editingProduit.id.toString(), formData)
      : this.produitService.addProduit(formData);

    request.subscribe({
      next: () => {
        this.loadProduitsVendeur();
        this.closeModal();
        Swal.fire(
          'Succès',
          this.editingProduit ? 'Produit mis à jour avec succès!' : 'Produit ajouté avec succès!',
          'success'
        );
      },
      error: (err) => {
        console.error('Erreur:', err);
        let errorMessage = 'Une erreur est survenue';
        if (err.status === 422) {
          errorMessage = err.error?.message || 'Validation failed';
          if (err.error?.errors) {
            errorMessage += ': ' + Object.values(err.error.errors).join(', ');
          }
        }
        
        Swal.fire('Erreur', errorMessage, 'error');
      }
    });
  }

confirmDelete(produit: Produit): void {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Vous ne pourrez pas annuler cette action!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed && produit.id) {
        this.produitService.deleteProduitById(produit.id.toString()).subscribe({
          next: () => {
            this.loadProduitsVendeur();
            Swal.fire('Supprimé!', 'Le produit a été supprimé.', 'success');
          },
          error: (err) => {
            console.error('Erreur de suppression:', err);
            Swal.fire('Erreur', 'Échec de la suppression du produit', 'error');
          }
        });
      }
    });
  }

  deleteSelected(): void {
    const selectedProducts = this.produits.filter(p => p.selected && p.id);
    
    if (selectedProducts.length === 0) {
      alert('Aucun produit sélectionné');
      return;
    }

    if (confirm(`Voulez-vous vraiment supprimer ${selectedProducts.length} produit(s) ?`)) {
      const deleteRequests = selectedProducts.map(p => 
        this.produitService.deleteProduitById(p.id!.toString())
      );

      Promise.all(deleteRequests.map(req => req.toPromise()))
        .then(() => {
          this.loadProduitsVendeur();
          alert(`${selectedProducts.length} produit(s) supprimé(s) avec succès`);
        })
        .catch(err => {
          console.error('Erreur lors de la suppression multiple:', err);
          alert('Une erreur est survenue lors de la suppression');
        });
    }
  }

  // Categories
  showCategorieModal = false;
categorieData: any = { libelle: '' };

openCategorieModal(): void {
  this.categorieData = { libelle: '' };
  this.showCategorieModal = true;
}

closeCategorieModal(): void {
  this.showCategorieModal = false;
}

saveCategorie(): void {
  if (!this.categorieData.libelle.trim()) {
    Swal.fire('Erreur', 'Le libellé est requis', 'warning');
    return;
  }

  this.produitService.createCategories(this.categorieData).subscribe({
    next: (res) => {
      Swal.fire('Succès', 'Catégorie ajoutée avec succès', 'success');
      this.loadCategories(); // recharge la liste si tu l'affiches quelque part
      this.closeCategorieModal();
    },
    error: (err) => {
      console.error(err);
      Swal.fire('Erreur', 'Une erreur est survenue', 'error');
    }
  });
}

      // Paginations
  updatePaginationPages(): void {
    const pagesToShow = 5; // Nombre de pages à afficher dans la pagination
    let startPage = Math.max(1, this.currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + pagesToShow - 1);

    if (endPage - startPage + 1 < pagesToShow) {
      startPage = Math.max(1, endPage - pagesToShow + 1);
    }

    this.paginationPages = Array.from(
      {length: endPage - startPage + 1},
      (_, i) => startPage + i
    );
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProduitsVendeur();
    }
  }


  changeItemsPerPage(): void {
    this.currentPage = 1; // Reset à la première page
    this.loadProduitsVendeur();
  }
}