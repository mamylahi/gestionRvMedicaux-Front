// departement.component.ts (reste identique, juste la méthode getTruncatedDescription à ajouter)
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Departement } from '../../../models/departement.model';
import { DepartementService } from '../../../services/departement.service';
import { SpecialiteService } from '../../../services/specialite.service';

// Déclaration pour SweetAlert2
declare var Swal: any;

@Component({
  selector: 'app-departement',
  templateUrl: './departement.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ]
})
export class DepartementComponent implements OnInit {
  departements: Departement[] = [];
  filteredDepartements: Departement[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  specialites: any[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Modal
  showModal: boolean = false;
  isEditing: boolean = false;
  selectedDepartement: Departement | null = null;

  // Nouveau/Édition département
  newDepartement: any = {
    nom: '',
    description: ''
  };

  constructor(
    private departementService: DepartementService,
    private specialiteService: SpecialiteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDepartements();
    this.loadSpecialites();
  }

  loadDepartements(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.departementService.getAll().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.departements = response.data;
        } else if (Array.isArray(response)) {
          this.departements = response;
        } else {
          this.departements = [];
        }
        this.filteredDepartements = [...this.departements];
        this.calculateTotalPages();
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des départements';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  loadSpecialites(): void {
    this.specialiteService.getAll().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.specialites = response.data;
        } else if (Array.isArray(response)) {
          this.specialites = response;
        }
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des spécialités:', error);
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredDepartements = [...this.departements];
      this.currentPage = 1;
      this.calculateTotalPages();
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredDepartements = this.departements.filter(dept =>
      dept.nom?.toLowerCase().includes(term) ||
      dept.description?.toLowerCase().includes(term)
    );
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  onResetFilters(): void {
    this.searchTerm = '';
    this.filteredDepartements = [...this.departements];
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredDepartements.length / this.itemsPerPage);
  }

  get paginatedDepartements(): Departement[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredDepartements.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getDisplayedPages(): number[] {
    const pages = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Gestion du modal
  openAddModal(): void {
    this.isEditing = false;
    this.selectedDepartement = null;
    this.newDepartement = {
      nom: '',
      description: ''
    };
    this.showModal = true;
  }

  openEditModal(departement: Departement): void {
    this.isEditing = true;
    this.selectedDepartement = departement;
    this.newDepartement = {
      nom: departement.nom,
      description: departement.description || ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedDepartement = null;
    this.isEditing = false;
    this.errorMessage = '';
  }

  saveDepartement(): void {
    if (!this.newDepartement.nom || this.newDepartement.nom.length < 3) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Champ invalide',
          text: 'Le nom du département est obligatoire (minimum 3 caractères)',
          icon: 'warning',
          confirmButtonColor: '#3B82F6',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-xl px-6 py-3 font-semibold'
          }
        });
      } else {
        this.errorMessage = 'Le nom du département est obligatoire (minimum 3 caractères)';
      }
      return;
    }

    if (this.isEditing && this.selectedDepartement) {
      this.updateDepartement();
    } else {
      this.createDepartement();
    }
  }

  createDepartement(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.departementService.create(this.newDepartement).subscribe({
      next: () => {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Succès !',
            text: 'Département créé avec succès',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'rounded-2xl'
            }
          });
        } else {
          this.successMessage = 'Département créé avec succès';
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.closeModal();
        this.loadDepartements();
        this.isLoading = false;
      },
      error: (error: any) => {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Erreur',
            text: 'Une erreur est survenue lors de la création',
            icon: 'error',
            confirmButtonColor: '#3B82F6',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-xl px-6 py-3 font-semibold'
            }
          });
        } else {
          this.errorMessage = 'Erreur lors de la création du département';
        }
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  updateDepartement(): void {
    if (!this.selectedDepartement) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.departementService.update(this.selectedDepartement.id, this.newDepartement).subscribe({
      next: () => {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Succès !',
            text: 'Département modifié avec succès',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'rounded-2xl'
            }
          });
        } else {
          this.successMessage = 'Département modifié avec succès';
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.closeModal();
        this.loadDepartements();
        this.isLoading = false;
      },
      error: (error: any) => {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Erreur',
            text: 'Une erreur est survenue lors de la modification',
            icon: 'error',
            confirmButtonColor: '#3B82F6',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-xl px-6 py-3 font-semibold'
            }
          });
        } else {
          this.errorMessage = 'Erreur lors de la modification du département';
        }
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onAdd(): void {
    this.openAddModal();
  }

  onEdit(id: number): void {
    const departement = this.departements.find(d => d.id === id);
    if (departement) {
      this.openEditModal(departement);
    }
  }

  onDelete(id: number): void {
    const departement = this.departements.find(d => d.id === id);
    const departementName = departement?.nom || 'ce département';

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Confirmer la suppression',
        html: `Êtes-vous sûr de vouloir supprimer <strong>${departementName}</strong> ?<br><small class="text-gray-500">Cette action est irréversible</small>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl px-6 py-3 font-semibold',
          cancelButton: 'rounded-xl px-6 py-3 font-semibold'
        }
      }).then((result: { isConfirmed: any; }) => {
        if (result.isConfirmed) {
          this.departementService.delete(id).subscribe({
            next: () => {
              Swal.fire({
                title: 'Supprimé !',
                text: 'Le département a été supprimé avec succès',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                customClass: {
                  popup: 'rounded-2xl'
                }
              });
              this.loadDepartements();
            },
            error: (error: any) => {
              Swal.fire({
                title: 'Erreur',
                text: 'Une erreur est survenue lors de la suppression',
                icon: 'error',
                confirmButtonColor: '#3B82F6',
                customClass: {
                  popup: 'rounded-2xl',
                  confirmButton: 'rounded-xl px-6 py-3 font-semibold'
                }
              });
              console.error('Erreur:', error);
            }
          });
        }
      });
    } else {
      if (confirm(`Êtes-vous sûr de vouloir supprimer ${departementName} ?`)) {
        this.departementService.delete(id).subscribe({
          next: () => {
            this.successMessage = 'Département supprimé avec succès';
            this.loadDepartements();
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error: any) => {
            this.errorMessage = 'Erreur lors de la suppression';
            console.error('Erreur:', error);
          }
        });
      }
    }
  }

  onView(id: number): void {
    this.router.navigate(['/departements/details', id]);
  }

  getCreationDate(dept: Departement): string {
    return dept.created_at ?
      new Date(dept.created_at).toLocaleDateString('fr-FR') :
      'Date inconnue';
  }

  formatDateFr(date: Date, format: string): string {
    if (!date) {
      return format.includes('HH') ? '--:--' : 'Date inconnue';
    }

    try {
      return formatDate(date, format, 'fr-FR');
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return format.includes('HH') ? '--:--' : 'Date invalide';
    }
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getSpecialitesNames(departementId: number): string {
    const specialites = this.specialites.filter(s => s.departement_id === departementId);

    if (specialites.length === 0) {
      return 'Aucune spécialité';
    }

    if (specialites.length === 1) {
      return specialites[0].nom;
    }

    // Si plusieurs spécialités, retourner les noms séparés par des virgules
    return specialites.map(s => s.nom).join(', ');
  }

  getSpecialitesCount(departementId: number): number {
    return this.specialites.filter(s => s.departement_id === departementId).length;
  }

  getTotalSpecialites(): number {
    return this.specialites.length;
  }

  getDepartementsAvecSpecialites(): number {
    const deptAvecSpecialites = new Set(this.specialites.map(s => s.departement_id));
    return deptAvecSpecialites.size;
  }

  getCharCount(field: string): number {
    return this.newDepartement[field]?.length || 0;
  }

  // Nouvelle méthode pour tronquer la description
  getTruncatedDescription(description: string | null | undefined, maxLength: number = 50): string {
    if (!description) return 'Aucune description';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }

  protected readonly Math = Math;
}
