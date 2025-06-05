import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private isSidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  private isMobileViewSubject = new BehaviorSubject<boolean>(false);
  private sidebarWidthSubject = new BehaviorSubject<number>(250);

  isSidebarCollapsed$: Observable<boolean> = this.isSidebarCollapsedSubject.asObservable();
  isMobileView$: Observable<boolean> = this.isMobileViewSubject.asObservable();
  sidebarWidth$: Observable<number> = this.sidebarWidthSubject.asObservable();

  constructor() {
    this.checkViewport();
    window.addEventListener('resize', () => this.checkViewport());
    
    // Mettre à jour la largeur quand le sidebar change d'état
    this.isSidebarCollapsed$.subscribe(collapsed => {
      this.sidebarWidthSubject.next(collapsed ? 60 : 250);
    });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsedSubject.next(!this.isSidebarCollapsedSubject.value);
  }

  private checkViewport(): void {
    const isMobile = window.innerWidth <= 768;
    this.isMobileViewSubject.next(isMobile);
    
    if (isMobile) {
      this.isSidebarCollapsedSubject.next(true);
    }
  }
}