import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from "./Vendeur/sidebar/sidebar.component";
import { NavbarComponent } from "./Vendeur/navbar/navbar.component";
import { NgIf } from '@angular/common';
import { EmployeeManagementComponent } from "./components/employee-management/employee-management.component";
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/authservice.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, NgIf, EmployeeManagementComponent,HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isPageVendeur: boolean = false;

  constructor(private router: Router, private auth:AuthService) {}

  ngOnInit(): void {
     this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      this.isPageVendeur = event.url.includes('/dashboard');
      console.log('isPageVendeur:', this.isPageVendeur); 
    }
  });
    this.auth.initializeUserFromStorage(); // 🔥 restaure l’utilisateur connecté

      console.log("Utilisateur connecté :", this.auth.getName());

  }

  title = 'sunushop';
}
