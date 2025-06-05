import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from "./Vendeur/sidebar/sidebar.component";
import { NavbarComponent } from "./Vendeur/navbar/navbar.component";
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,NavbarComponent, SidebarComponent,NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isPageVendeur: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
     this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      this.isPageVendeur = event.url.includes('/dashboard');
      console.log('isPageVendeur:', this.isPageVendeur); 
    }
  });

  }

  title = 'sunushop';
}
