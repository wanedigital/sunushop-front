import { Component, OnInit } from '@angular/core';
// import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ClientRoutingModule } from '../client-routing.module';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-client-layout',
  templateUrl: './client-layout.component.html',
  styleUrls: ['./client-layout.component.css'],
  imports: [NavbarComponent, ClientRoutingModule, RouterOutlet]

})
export class ClientLayoutComponent implements OnInit {
  /*
  sidebarOpen = false;
  isMobile = window.innerWidth <= 768;
  */

  constructor() { }

  ngOnInit(): void {
    // window.addEventListener('resize', this.handleResize.bind(this));
  }

  /*
  handleResize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
  */
}