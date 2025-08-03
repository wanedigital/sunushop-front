import { Component } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { RouterOutlet } from '@angular/router';
import { CardsStatisticComponent } from "../cards-statistic/cards-statistic.component";

@Component({
  selector: 'app-vendeur-layout',
  imports: [RouterOutlet, SidebarComponent, NavbarComponent, CardsStatisticComponent],
  templateUrl: './vendeur-layout.component.html',
  styleUrl: './vendeur-layout.component.css'
})
export class VendeurLayoutComponent {

}
