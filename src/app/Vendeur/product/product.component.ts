import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { ServiceService, Produit, Categorie } from '../../services/service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [FormsModule, CommonModule,NgFor],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  produits: Produit[] = [];
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

  constructor(private produitService: ServiceService) {}

  ngOnInit(): void {
    this.loadProduits();
    this.loadCategories();
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
loadProduits(): void {
  this.isLoading = true;
  this.produitService.getProduitsPagines(this.currentPage, this.itemsPerPage)
    .subscribe({
      next: (response) => {
        this.produits = response.data || []; 
        this.totalItems = response.total;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.updatePaginationPages();
        this.isLoading = false;
      },
      error: (err) => {
        this.produits = []; 
        this.isLoading = false;
        Swal.fire('Erreur', 'Impossible de charger les produits', 'error');

      }
    });
}


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
        this.loadProduits();
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
            this.loadProduits();
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
          this.loadProduits();
          alert(`${selectedProducts.length} produit(s) supprimé(s) avec succès`);
        })
        .catch(err => {
          console.error('Erreur lors de la suppression multiple:', err);
          alert('Une erreur est survenue lors de la suppression');
        });
    }
  }

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
      this.loadProduits();
    }
  }

  changeItemsPerPage(): void {
    this.currentPage = 1; // Reset à la première page
    this.loadProduits();
  }
}