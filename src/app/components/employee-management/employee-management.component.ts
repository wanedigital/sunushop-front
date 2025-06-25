import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Employee {
  name: string;
  email: string;
  address: string;
  phone: string;
  selected?: boolean;
}

@Component({
  selector: 'app-employee-management',
  imports: [ FormsModule,NgFor,NgIf],
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.css'],
})
export class EmployeeManagementComponent {
  employees: Employee[] = [
    {
      name: 'Thomas Hardy',
      email: 'thomashardy@mail.com',
      address: '89 Chiaroscuro Rd, Portland, USA',
      phone: '(171) 555-2222',
    },
    {
      name: 'Dominique Perrier',
      email: 'dominiqueperrier@mail.com',
      address: 'Obere Str. 57, Berlin, Germany',
      phone: '(313) 555-5735',
    },
    // Ajoute les autres ici
  ];

  selectAll = false;
  showModal = false;
  editingEmployee: Employee | null = null;
  modalData: Employee = this.getEmptyEmployee();

  getEmptyEmployee(): Employee {
    return { name: '', email: '', address: '', phone: '' };
  }

  toggleAllSelection() {
    this.employees.forEach((emp) => (emp.selected = this.selectAll));
  }

  onCheckboxChange() {
    this.selectAll = this.employees.every((emp) => emp.selected);
  }

  openAddModal() {
    this.editingEmployee = null;
    this.modalData = this.getEmptyEmployee();
    this.showModal = true;
  }

  openEditModal(emp: Employee) {
    this.editingEmployee = emp;
    this.modalData = { ...emp };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveEmployee() {
    if (this.editingEmployee) {
      Object.assign(this.editingEmployee, this.modalData);
    } else {
      this.employees.push({ ...this.modalData });
    }
    this.closeModal();
  }

  confirmDelete(emp: Employee) {
    this.employees = this.employees.filter((e) => e !== emp);
  }

  openDeleteModal() {
    this.employees = this.employees.filter((emp) => !emp.selected);
  }
}
