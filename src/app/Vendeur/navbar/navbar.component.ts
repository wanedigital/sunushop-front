import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { NgIf } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [NgIf],
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isScrolled = false;
  sidebarWidth = 250;
  isDropdownOpen = false;
  private subscriptions = new Subscription();

  constructor(private layoutService: LayoutService) {}

  ngOnInit(): void {
    this.checkScroll();
    
    // Subscription pour les changements de largeur du sidebar
    this.subscriptions.add(
      this.layoutService.sidebarWidth$.subscribe(width => {
        this.sidebarWidth = width;
      })
    );
    
    // Subscription pour la vue mobile
    this.subscriptions.add(
      this.layoutService.isMobileView$.subscribe(isMobile => {
        if (isMobile) this.isDropdownOpen = false;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('window:scroll')
  private checkScroll(): void {
    this.isScrolled = window.scrollY > 10;
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
    this.closeDropdown();
  }

  private closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  private onClickOutside(event: Event): void {
    if (!(event.target as HTMLElement).closest('.profile')) {
      this.closeDropdown();
    }
  }

  @HostListener('window:resize')
  private onResize(): void {
    if (window.innerWidth > 768) {
      this.closeDropdown();
    }
  }
}