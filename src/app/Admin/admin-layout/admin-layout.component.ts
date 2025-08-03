import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderAdminComponent } from "../header-admin/header-admin.component";
import { SidebardAdminComponent } from "../sidebard-admin/sidebard-admin.component";
import { CardsStatisticComponent } from "../cards-statistic/cards-statistic.component";

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, HeaderAdminComponent, SidebardAdminComponent, CardsStatisticComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {

}
