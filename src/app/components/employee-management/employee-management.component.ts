import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

  interface Product {
  name: string;
  category: string;
  price: number;
  quantity: number;
  selected?: boolean;
}

@Component({
  selector: 'app-employee-management',
  imports: [ FormsModule,NgFor,NgIf],
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.css'],
})

export class EmployeeManagementComponent {

  products: Product[] = [
    { name: 'Chaussures', category: 'Mode', price: 45.99, quantity: 25 },
    { name: 'Casque Bluetooth', category: 'Électronique', price: 89.99, quantity: 10 }
  ];

  selectAll = false;
  showModal = false;
  editingProduct: Product | null = null;
  modalData: Product = this.getEmptyProduct();

  getEmptyProduct(): Product {
    return { name: '', category: '', price: 0, quantity: 0 };
  }

  toggleAllSelection() {
    this.products.forEach(p => p.selected = this.selectAll);
  }

  onCheckboxChange() {
    this.selectAll = this.products.every(p => p.selected);
  }

  openAddModal() {
    this.editingProduct = null;
    this.modalData = this.getEmptyProduct();
    this.showModal = true;
  }

  openEditModal(p: Product) {
    this.editingProduct = p;
    this.modalData = { ...p };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveProduct() {
    if (this.editingProduct) {
      Object.assign(this.editingProduct, this.modalData);
    } else {
      this.products.push({ ...this.modalData });
    }
    this.closeModal();
  }

  confirmDelete(p: Product) {
    this.products = this.products.filter(prod => prod !== p);
  }

  openDeleteModal() {
    this.products = this.products.filter(p => !p.selected);
  }
}
