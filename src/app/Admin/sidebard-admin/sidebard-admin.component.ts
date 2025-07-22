import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebard-admin',
  imports: [],
  templateUrl: './sidebard-admin.component.html',
  styleUrl: './sidebard-admin.component.css'
})
export class SidebardAdminComponent {
isSidebarExpanded = false;
  constructor(public router: Router) {
  }
  toggleSidebar(): void {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }
}
