import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { StatistiqueService } from '../../services/statistique.service';
import { NgFor, NgIf } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { ServiceService } from '../../services/service.service';
import { RouterLink } from '@angular/router';
import { StockAlertPipe } from "../../shared/pipes/stock-alert.pipe";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [NgIf, RouterLink, StockAlertPipe, NgFor],
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isScrolled = false;
  sidebarWidth = 250;
  notificationCount = 0;
  cartCount = 0;
  private subscriptions = new Subscription();
  boutiqueInfo: any = {};
  showAlert = false;
  alertMessage = '';
  private alertTimeout: any;
  showOrderAlert = false;
  orderAlertMessage = '';
  private orderAlertTimeout: any;
  private notificationSound: HTMLAudioElement;
  soundEnabled = true;

  constructor(
    private layoutService: LayoutService, 
    private authService: ServiceService,
    private statsService: StatistiqueService
  ) {
this.notificationSound = new Audio('/notification.mp3');
this.notificationSound.volume = 0.9;
    this.loadSoundSettings();
  }

  ngOnInit(): void {
    this.checkScroll();
    this.setupSubscriptions();
    this.loadInitialData();
  }

  private loadSoundSettings(): void {
    try {
      this.notificationSound.load();
      const soundPref = localStorage.getItem('soundEnabled');
      this.soundEnabled = soundPref ? JSON.parse(soundPref) : true;
    } catch (e) {
      console.warn('Erreur initialisation son:', e);
    }
  }

  private setupSubscriptions(): void {
    this.subscriptions.add(
      this.layoutService.sidebarWidth$.subscribe(width => {
        this.sidebarWidth = width;
      })
    );

    this.subscriptions.add(
      interval(30000).subscribe(() => {
        if (document.visibilityState === 'visible') {
          this.loadNouvellesCommandes();
        }
      })
    );
  }

  private loadInitialData(): void {
    this.loadBoutiqueInfo();
    this.loadNouvellesCommandes();
  }

  private loadBoutiqueInfo(): void {
    this.authService.getProduitsVendeur().subscribe({
      next: (data: any) => {
        this.boutiqueInfo = data;
        this.checkStockAlerts(data.produits);
      },
      error: (err: any) => {
        console.error("Erreur boutique:", err);
        this.boutiqueInfo = { nom: 'Ma Boutique', logo: null, produits: [] };
      }
    });
  }

  private checkStockAlerts(produits: any[]): void {
    const lowStock = produits?.filter(p => p.quantite < 10) || [];
    this.notificationCount = lowStock.length;
    
    if (this.notificationCount > 0 && !this.showAlert) {
      this.showStockAlert(lowStock);
    }
  }

  private showStockAlert(products: any[]): void {
    if (this.alertTimeout) clearTimeout(this.alertTimeout);
    
    this.alertMessage = this.notificationCount === 1
      ? '1 produit en stock critique'
      : `${this.notificationCount} produits en stock critique`;
    
    this.showAlert = true;
    this.playNotification();

    this.alertTimeout = setTimeout(() => {
      this.showAlert = false;
    }, 10000);
  }

  private loadNouvellesCommandes(): void {
    this.subscriptions.add(
      this.statsService.getNouvellesCommandes().subscribe({
        next: (response: any) => {
          if (response.success) {
            const newCount = response.data.nombre_nouvelles_commandes || 0;
            if (newCount > this.cartCount) {
              this.showNewOrdersAlert(newCount);
            }
            this.cartCount = newCount;
          }
        },
        error: (err: any) => {
          console.error("Erreur commandes:", err);
          this.cartCount = 0;
        }
      })
    );
  }

  private showNewOrdersAlert(count: number): void {
    if (this.orderAlertTimeout) clearTimeout(this.orderAlertTimeout);
    
    this.orderAlertMessage = count === 1
      ? 'Nouvelle commande reçue !'
      : `${count} nouvelles commandes reçues !`;
    
    this.showOrderAlert = true;
    this.playNotification();

    this.orderAlertTimeout = setTimeout(() => {
      this.showOrderAlert = false;
    }, 10000);
  }

private playNotification(): void {
  if (!this.soundEnabled) return;

  try {
    this.notificationSound.currentTime = 0;
    this.notificationSound.play()
      .catch(error => {
        // Si échec, attendre une interaction utilisateur
        const playAfterInteraction = () => {
          this.notificationSound.play()
            .then(() => document.removeEventListener('click', playAfterInteraction))
            .catch(() => document.removeEventListener('click', playAfterInteraction));
        };
        document.addEventListener('click', playAfterInteraction, { once: true });
      });
  } catch (e) {
    console.warn('Erreur son:', e);
  }
}

  private playOnFirstInteraction(): void {
    this.notificationSound.currentTime = 0;
    this.notificationSound.play().catch(e => console.log('Échec lecture son'));
  }

  toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('soundEnabled', JSON.stringify(this.soundEnabled));
  }

  closeAlert(): void {
    this.showAlert = false;
    clearTimeout(this.alertTimeout);
  }

  closeOrderAlert(): void {
    this.showOrderAlert = false;
    clearTimeout(this.orderAlertTimeout);
  }

  onCartClick(): void {
    this.showOrderAlert = false;
    // La navigation est gérée par le routerLink dans le template
  }

  @HostListener('window:scroll')
  private checkScroll(): void {
    this.isScrolled = window.scrollY > 10;
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    clearTimeout(this.alertTimeout);
    clearTimeout(this.orderAlertTimeout);
  }
}