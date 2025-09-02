import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/authservice.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,  HttpClientModule],
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

    const role=this.auth.getRole()

     /// console.log("Utilisateur connecté :", this.auth.getName(), this.auth.getIdUser(), role);
  }

  title = 'sunushop';
}
