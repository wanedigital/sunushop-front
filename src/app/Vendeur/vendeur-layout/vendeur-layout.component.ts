import { Component } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-vendeur-layout',
  imports: [RouterOutlet,SidebarComponent, NavbarComponent],
  templateUrl: './vendeur-layout.component.html',
  styleUrl: './vendeur-layout.component.css'
})
export class VendeurLayoutComponent {

}
