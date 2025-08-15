import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { CommandeService } from '../../services/commande.service';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Interfaces
interface Commande {
  id: number;
  numeroCommande: string;
  date: string;
  user?: {
    nom: string;
    prenom: string;
    email: string;
  };
  nom_client?: string;
  prenom_client?: string;
  email_client?: string;
  telephone_client: string;
  adresse_client: string;
  total: number;
  etat: 'en attente' | 'valider' | 'en cours' | 'terminer' | 'annuler';
  detail_commandes: DetailCommande[];
}

interface DetailCommande {
  produit: {
    libelle: string;
    description: string;
    image?: string;
  };
  prixunitaire: number;
  quantite: number;
}

@Component({
  selector: 'app-commandes',
  templateUrl: './commandeClients.component.html',
  imports: [TruncatePipe, CommonModule, NgbPaginationModule, FormsModule],
  styleUrls: ['./commandeClients.component.css'],
  providers: [DecimalPipe,CurrencyPipe],
  standalone: true
})
export class CommandeclientsComponent implements OnInit, OnDestroy {
  // Propriétés
  commandes: Commande[] = [];
  filteredCommandes: Commande[] = [];
  selectedCommande: Commande | null = null;
  selectedCommandes: Set<number> = new Set();
  isLoading = false;
  page = 1;
  pageSize = 10;
  searchTerm: string = '';
  public Math = Math;

  // Statistiques
  stats = {
    total: 0,
    enAttente: 0,
    validees: 0,
    terminees: 0,
    annulees: 0
  };

  // Options de statut
  statutOptions = [
    { value: 'en attente', label: 'En attente', color: 'warning', icon: '⏳' },
    { value: 'valider', label: 'Validée', color: 'info', icon: '✅' },
    { value: 'en cours', label: 'En cours', color: 'primary', icon: '🚛' },
    { value: 'terminer', label: 'Terminée', color: 'success', icon: '🎉' },
    { value: 'annuler', label: 'Annulée', color: 'danger', icon: '❌' }
  ];

  // Observables
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private commandeService: CommandeService,
    private modalService: NgbModal
  ) {
    this.setupSearchDebounce();
  }

  // Lifecycle hooks
  ngOnInit(): void {
    this.loadCommandes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  // Initialisation
  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(term => this.performSearch(term));
  }

  // Méthodes de chargement
  loadCommandes(): void {
    this.isLoading = true;
    
    setTimeout(() => {
      this.commandeService.getCommandesByBoutique(10).subscribe({
        next: (res) => {
          this.commandes = res.data || [];
          this.filteredCommandes = [...this.commandes];
          this.calculateStats();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des commandes:', err);
          this.isLoading = false;
          this.showErrorMessage('Impossible de charger les commandes');
        }
      });
    }, 500);
  }

  // Méthodes utilitaires
  trackByFn(index: number, item: Commande): number {
    return item?.id ?? index;
  }

  getClientFullName(commande: Commande): string {
    if (commande.user) {
      return `${commande.user.nom} ${commande.user.prenom}`;
    }
    return `${commande.nom_client || ''} ${commande.prenom_client || ''}`.trim();
  }

  getClientEmail(commande: Commande): string {
    return commande.user?.email || commande.email_client || '';
  }

 

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Gestion des statuts
  getEtatBadgeClass(etat: string): string {
    const statutOption = this.statutOptions.find(opt => opt.value === etat);
    return `badge bg-${statutOption?.color || 'secondary'}`;
  }

  getStatutIcon(etat: string): string {
    const statutOption = this.statutOptions.find(opt => opt.value === etat);
    return statutOption?.icon || '📋';
  }

  getStatutLabel(etat: string): string {
    const statutOption = this.statutOptions.find(opt => opt.value === etat);
    return statutOption?.label || etat;
  }

  getStatusColor(etat: string): string {
    const colors = {
      'en attente': '#f59e0b',
      'valider': '#06b6d4', 
      'en cours': '#4361ee',
      'terminer': '#10b981',
      'annuler': '#ef4444'
    };
    return colors[etat as keyof typeof colors] || '#6b7280';
  }

  canUpdateStatus(commande: Commande, newStatus: string): boolean {
    const currentStatus = commande.etat;
    
    if (currentStatus === 'terminer' && newStatus !== 'terminer') {
      return false;
    }
    
    if (currentStatus === 'annuler' && newStatus !== 'annuler' && newStatus !== 'terminer') {
      return false;
    }
    
    return true;
  }

  // Méthodes de recherche et filtrage
  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  private performSearch(term: string): void {
    if (!term.trim()) {
      this.filteredCommandes = [...this.commandes];
      return;
    }

    const searchTerm = term.toLowerCase().trim();
    this.filteredCommandes = this.commandes.filter(cmd =>
      this.matchesSearchTerm(cmd, searchTerm)
    );
    
    this.page = 1;
  }

  private matchesSearchTerm(commande: Commande, term: string): boolean {
    const searchFields = [
      commande.numeroCommande?.toString(),
      commande.user?.nom,
      commande.user?.prenom,
      commande.user?.email,
      commande.nom_client,
      commande.prenom_client,
      commande.email_client,
      commande.telephone_client,
      commande.adresse_client,
      commande.etat,
      commande.total?.toString()
    ];

    return searchFields.some(field => 
      field?.toLowerCase().includes(term)
    );
  }

  filterByStatus(status: string): void {
    this.searchTerm = '';
    if (status === 'all') {
      this.filteredCommandes = [...this.commandes];
    } else {
      this.filteredCommandes = this.commandes.filter(cmd => cmd.etat === status);
    }
    this.page = 1;
  }

  // Méthodes de tri
  sortBy(field: keyof Commande, direction: 'asc' | 'desc' = 'asc'): void {
    this.filteredCommandes.sort((a, b) => {
      let valueA = a[field];
      let valueB = b[field];

      if (field === 'date') {
        valueA = new Date(valueA as string).getTime();
        valueB = new Date(valueB as string).getTime();
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return direction === 'asc' ? valueA - valueB : valueB - valueA;
      }

      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();
      
      if (direction === 'asc') {
        return strA < strB ? -1 : strA > strB ? 1 : 0;
      } else {
        return strA > strB ? -1 : strA < strB ? 1 : 0;
      }
    });
  }

  // Gestion des statistiques
  private calculateStats(): void {
    this.stats = {
      total: this.commandes.length,
      enAttente: this.commandes.filter(c => c.etat === 'en attente').length,
      validees: this.commandes.filter(c => c.etat === 'valider').length,
      terminees: this.commandes.filter(c => c.etat === 'terminer').length,
      annulees: this.commandes.filter(c => c.etat === 'annuler').length
    };
  }

  get filteredTotal(): number {
    return this.filteredCommandes.reduce((sum, cmd) => sum + cmd.total, 0);
  }

  // Gestion des pages
  get paginatedCommandes(): Commande[] {
    const startIndex = (this.page - 1) * this.pageSize;
    return this.filteredCommandes.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCommandes.length / this.pageSize);
  }

  // Gestion des modales
  openDetailModal(content: any, commande: Commande): void {
    this.selectedCommande = { ...commande };
    
    const modalRef = this.modalService.open(content, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      windowClass: 'fade-in-modal'
    });

    modalRef.result.then(
      () => this.selectedCommande = null,
      () => this.selectedCommande = null
    );
  }

  // Gestion des sélections
  onToggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    checked ? this.selectAllCommandes() : this.clearSelection();
  }

  onStatusSelectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filterByStatus(value);
  }

  toggleCommandeSelection(commandeId: number, event?: Event): void {
    if (event) {
      const checked = (event.target as HTMLInputElement).checked;
      checked ? this.selectedCommandes.add(commandeId) : this.selectedCommandes.delete(commandeId);
    } else {
      this.selectedCommandes.has(commandeId) 
        ? this.selectedCommandes.delete(commandeId) 
        : this.selectedCommandes.add(commandeId);
    }
  }

  selectAllCommandes(): void {
    this.paginatedCommandes.forEach(cmd => this.selectedCommandes.add(cmd.id));
  }

  clearSelection(): void {
    this.selectedCommandes.clear();
  }

  // Mise à jour des statuts
  updateStatut(commande: Commande, newStatut: string): void {
    console.log('Tentative de mise à jour:', {id: commande.id, newStatut});
    
    this.commandeService.updateStatut(commande.id, newStatut).subscribe({
      next: (res) => {
        console.log('Réponse du serveur:', res);
        // ...
      },
      error: (err) => {
        console.error('Erreur complète:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        console.error('Corps de la réponse:', err.error);
        // ...
      }
    });
  }

  bulkUpdateStatus(newStatus: string): void {
    if (this.selectedCommandes.size === 0) {
      this.showErrorMessage('Aucune commande sélectionnée');
      return;
    }

    const commandesToUpdate = this.commandes.filter(cmd => 
      this.selectedCommandes.has(cmd.id) && 
      this.canUpdateStatus(cmd, newStatus)
    );

    if (commandesToUpdate.length === 0) {
      this.showErrorMessage('Aucune commande ne peut être mise à jour');
      return;
    }

    const confirmation = confirm(
      `Voulez-vous vraiment modifier le statut de ${commandesToUpdate.length} commande(s) ?`
    );

    if (!confirmation) return;

    const updatePromises = commandesToUpdate.map(cmd => 
      this.commandeService.updateStatut(cmd.id, newStatus).toPromise()
    );

    Promise.all(updatePromises)
      .then(() => {
        commandesToUpdate.forEach(cmd => cmd.etat = newStatus as any);
        this.calculateStats();
        this.clearSelection();
        this.showSuccessMessage(`${commandesToUpdate.length} commande(s) mise(s) à jour`);
      })
      .catch(error => {
        console.error('Erreur lors de la mise à jour par lot:', error);
        this.showErrorMessage('Erreur lors de la mise à jour');
      });
  }

  // Export
  exportToCSV(): void {
    const csvData = this.filteredCommandes.map(cmd => ({
      'N° Commande': cmd.numeroCommande,
      'Date': this.formatDate(cmd.date),
      'Client': this.getClientFullName(cmd),
      'Email': this.getClientEmail(cmd),
      'Téléphone': cmd.telephone_client,
      'Adresse': cmd.adresse_client,
      'Montant': cmd.total,
      'Statut': this.getStatutLabel(cmd.etat)
    }));

    this.downloadCSV(csvData, 'commandes.csv');
  }

  private downloadCSV(data: any[], filename: string): void {
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }

  // Rafraîchissement
  refreshData(): void {
    this.loadCommandes();
    this.showSuccessMessage('Données actualisées');
  }

  // Messages
  private showSuccessMessage(message: string): void {
    console.log('✅ Succès:', message);
  }

  private showErrorMessage(message: string): void {
    console.error('❌ Erreur:', message);
  }
  printPage(): void {
  window.print();
}
isStatusDisabled(currentStatus: string): boolean {
  return ['terminer', 'annuler'].includes(currentStatus);
}
}