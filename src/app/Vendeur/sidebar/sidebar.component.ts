import { Component, OnInit, TrackByFunction } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { MenuItem } from '../../models/menu-item';
import { NgForOf, NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  imports: [NgForOf, NgIf, NgClass],
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  isMobileView = false;
  sections: Array<'top' | 'bottom'> = ['top', 'bottom'];

  menuItems: Record<'top' | 'bottom', MenuItem[]> = {
    top: [
      { icon: 'bi-speedometer2', label: 'Dashboard', route: '/dashboard', isActive: true },
      { icon: 'bi-bag-check', label: 'Ma Boutique', route: '/boutique' },
      { icon: 'bi-pie-chart', label: 'Statistique', route: '/statistique' },
      { icon: 'bi-chat-dots', label: 'Messages', route: '/messages' },
      { icon: 'bi-people', label: 'Clients', route: '/client' }
    ],
    bottom: [
      { icon: 'bi-gear', label: 'Settings', route: '/settings' },
      { icon: 'bi-power', label: 'Logout', route: '/logout' }
    ]
  };

  trackByFn: TrackByFunction<MenuItem> = (index, item) => item.route;

  constructor(private layoutService: LayoutService) {}

  ngOnInit(): void {
    this.layoutService.isSidebarCollapsed$.subscribe(collapsed => this.isCollapsed = collapsed);
    this.layoutService.isMobileView$.subscribe(isMobile => this.isMobileView = isMobile);
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  setActiveItem(item: MenuItem): void {
    Object.keys(this.menuItems).forEach(section => {
      this.menuItems[section as 'top' | 'bottom'].forEach(i => i.isActive = false);
    });
    item.isActive = true;
  }
}
