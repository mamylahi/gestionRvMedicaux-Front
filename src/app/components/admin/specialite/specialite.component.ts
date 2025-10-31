// specialite.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Specialite } from '../../../models/specialite.model';
import { SpecialiteService } from '../../../services/specialite.service';
import { DepartementService } from '../../../services/departement.service';

// Déclaration pour SweetAlert2
declare var Swal: any;

@Component({
  selector: 'app-specialite',
  templateUrl: './specialite.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ]
})
export class SpecialiteComponent implements OnInit {
  specialites: Specialite[] = [];
  filteredSpecialites: Specialite[] = [];
  searchTerm: string = '';
  selectedDepartement: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  departements: any[] = [];
  isLoadingDepartements: boolean = false;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Modal
  showModal: boolean = false;
  isEditing: boolean = false;
  selectedSpecialite: Specialite | null = null;

  // Nouveau/Édition spécialité
  newSpecialite: any = {
    nom: '',
    departement_id: ''
  };

  constructor(
    private specialiteService: SpecialiteService,
    private departementService: DepartementService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSpecialites();
    this.loadDepartements();
  }

  loadSpecialites(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.specialiteService.getAll().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.specialites = response.data;
        } else if (Array.isArray(response)) {
          this.specialites = response;
        } else {
          this.specialites = [];
        }
        this.filteredSpecialites = [...this.specialites];
        this.calculateTotalPages();
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des spécialités';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  loadDepartements(): void {
    this.isLoadingDepartements = true;

    this.departementService.getAll().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.departements = response.data;
        } else if (Array.isArray(response)) {
          this.departements = response;
        } else {
          this.departements = [];
        }
        this.isLoadingDepartements = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des départements:', error);
        this.errorMessage = 'Erreur lors du chargement des départements';
        this.isLoadingDepartements = false;
      }
    });
  }

  onSearch(): void {
    let filtered = this.specialites;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.nom?.toLowerCase().includes(term) ||
        s.departement?.nom?.toLowerCase().includes(term) ||
        this.getDepartementName(s).toLowerCase().includes(term)
      );
    }

    if (this.selectedDepartement) {
      filtered = filtered.filter(s =>
        s.departement_id && s.departement_id.toString() === this.selectedDepartement
      );
    }

    this.filteredSpecialites = filtered;
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  onResetFilters(): void {
    this.searchTerm = '';
    this.selectedDepartement = '';
    this.filteredSpecialites = [...this.specialites];
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredSpecialites.length / this.itemsPerPage);
  }

  get paginatedSpecialites(): Specialite[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSpecialites.slice(startIndex, startIndex + this.itemsPerPage);
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
    this.selectedSpecialite = null;
    this.newSpecialite = {
      nom: '',
      departement_id: ''
    };
    this.showModal = true;
  }

  openEditModal(specialite: Specialite): void {
    this.isEditing = true;
    this.selectedSpecialite = specialite;
    this.newSpecialite = {
      nom: specialite.nom,
      departement_id: specialite.departement_id || ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedSpecialite = null;
    this.isEditing = false;
    this.errorMessage = '';
  }

  saveSpecialite(): void {
    if (!this.newSpecialite.nom || !this.newSpecialite.departement_id) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Champs manquants',
          text: 'Veuillez remplir tous les champs obligatoires',
          icon: 'warning',
          confirmButtonColor: '#3B82F6',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-xl px-6 py-3 font-semibold'
          }
        });
      } else {
        this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      }
      return;
    }

    if (this.isEditing && this.selectedSpecialite) {
      this.updateSpecialite();
    } else {
      this.createSpecialite();
    }
  }

  createSpecialite(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.specialiteService.create(this.newSpecialite).subscribe({
      next: () => {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Succès !',
            text: 'Spécialité créée avec succès',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'rounded-2xl'
            }
          });
        } else {
          this.successMessage = 'Spécialité créée avec succès';
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.closeModal();
        this.loadSpecialites();
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
          this.errorMessage = 'Erreur lors de la création de la spécialité';
        }
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  updateSpecialite(): void {
    if (!this.selectedSpecialite) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.specialiteService.update(this.selectedSpecialite.id, this.newSpecialite).subscribe({
      next: () => {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Succès !',
            text: 'Spécialité modifiée avec succès',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'rounded-2xl'
            }
          });
        } else {
          this.successMessage = 'Spécialité modifiée avec succès';
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.closeModal();
        this.loadSpecialites();
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
          this.errorMessage = 'Erreur lors de la modification de la spécialité';
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
    const specialite = this.specialites.find(s => s.id === id);
    if (specialite) {
      this.openEditModal(specialite);
    }
  }

  onDelete(id: number): void {
    const specialite = this.specialites.find(s => s.id === id);
    const specialiteName = specialite?.nom || 'cette spécialité';

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Confirmer la suppression',
        html: `Êtes-vous sûr de vouloir supprimer <strong>${specialiteName}</strong> ?<br><small class="text-gray-500">Cette action est irréversible</small>`,
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
          this.specialiteService.delete(id).subscribe({
            next: () => {
              Swal.fire({
                title: 'Supprimé !',
                text: 'La spécialité a été supprimée avec succès',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                customClass: {
                  popup: 'rounded-2xl'
                }
              });
              this.loadSpecialites();
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
      if (confirm(`Êtes-vous sûr de vouloir supprimer ${specialiteName} ?`)) {
        this.specialiteService.delete(id).subscribe({
          next: () => {
            this.successMessage = 'Spécialité supprimée avec succès';
            this.loadSpecialites();
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
    this.router.navigate(['/specialites/details', id]);
  }

  getDepartementName(specialite: Specialite): string {
    if (specialite.departement?.nom) {
      return specialite.departement.nom;
    }

    if (specialite.departement_id) {
      const dept = this.departements.find(d => d.id === specialite.departement_id);
      return dept?.nom || `Département ${specialite.departement_id}`;
    }

    return 'Département non assigné';
  }

  getDepartementNameById(id: number | string): string {
    const dept = this.departements.find(d => d.id == id);
    return dept?.nom || '';
  }

  getCreationDate(specialite: Specialite): string {
    return specialite.created_at ?
      new Date(specialite.created_at).toLocaleDateString('fr-FR') :
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

  getUniqueDepartementsCount(): number {
    const uniqueDeptIds = new Set(this.specialites.map(s => s.departement_id).filter(id => id));
    return uniqueDeptIds.size;
  }

  protected readonly Math = Math;
}
