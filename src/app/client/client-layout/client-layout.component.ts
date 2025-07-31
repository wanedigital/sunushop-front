/*import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-client-layout',
  imports: [RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.css'
})
export class ClientLayoutComponent {

}*/

/*import { Component } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { ClientRoutingModule } from "../client-routing.module";

@Component({
  selector: 'app-client-layout',
  templateUrl: './client-layout.component.html',
  styleUrls: ['./client-layout.component.css'],
  imports: [SidebarComponent, NavbarComponent, ClientRoutingModule]
})



export class ClientLayoutComponent {
  sidebarOpen = false;

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    console.log('Sidebar toggled:', this.sidebarOpen);
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}

function ngOnInit() {
  throw new Error('Function not implemented.');
}*/

import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ClientRoutingModule } from '../client-routing.module';

@Component({
  selector: 'app-client-layout',
  templateUrl: './client-layout.component.html',
  styleUrls: ['./client-layout.component.css'],
  imports: [SidebarComponent, NavbarComponent, ClientRoutingModule]

})
export class ClientLayoutComponent implements OnInit {
  sidebarOpen = false;
  isMobile = window.innerWidth <= 768;

  ngOnInit(): void {
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  handleResize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    console.log('Sidebar toggled:', this.sidebarOpen);
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}


