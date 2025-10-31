import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SecretaireService } from '../../../services/secretaire.service';
import { Secretaire } from '../../../models/secretaire.model';

// Déclaration pour SweetAlert2
declare var Swal: any;

@Component({
  selector: 'app-secretaire',
  templateUrl: './secretaire.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class SecretaireComponent implements OnInit {
  secretaires: Secretaire[] = [];
  filteredSecretaires: Secretaire[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Modal
  showModal: boolean = false;
  isEditing: boolean = false;
  selectedSecretaire: Secretaire | null = null;

  // Nouveau/Édition secrétaire
  newSecretaire: any = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    numero_employe: '',
    password: '',
    password_confirmation: ''
  };

  constructor(private secretaireService: SecretaireService) {}

  ngOnInit(): void {
    this.loadSecretaires();
  }

  loadSecretaires(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.secretaireService.getAll().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.secretaires = response.data;
        } else if (Array.isArray(response)) {
          this.secretaires = response;
        } else {
          this.secretaires = [];
        }
        this.filteredSecretaires = [...this.secretaires];
        this.calculateTotalPages();
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des secrétaires';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredSecretaires = [...this.secretaires];
      this.currentPage = 1;
      this.calculateTotalPages();
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredSecretaires = this.secretaires.filter(s =>
      s.user?.nom?.toLowerCase().includes(term) ||
      s.user?.prenom?.toLowerCase().includes(term) ||
      s.user?.email?.toLowerCase().includes(term) ||
      s.user?.telephone?.toLowerCase().includes(term) ||
      s.numero_employe?.toLowerCase().includes(term)
    );
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  onResetFilters(): void {
    this.searchTerm = '';
    this.filteredSecretaires = [...this.secretaires];
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredSecretaires.length / this.itemsPerPage);
  }

  get paginatedSecretaires(): Secretaire[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSecretaires.slice(startIndex, startIndex + this.itemsPerPage);
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
    this.selectedSecretaire = null;

    // Générer automatiquement le numéro d'employé
    const numeroEmploye = this.secretaireService.generateNumeroEmploye();

    this.newSecretaire = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      numero_employe: numeroEmploye,
      password: '',
      password_confirmation: ''
    };
    this.showModal = true;
  }

  openEditModal(secretaire: Secretaire): void {
    this.isEditing = true;
    this.selectedSecretaire = secretaire;
    this.newSecretaire = {
      nom: secretaire.user?.nom || '',
      prenom: secretaire.user?.prenom || '',
      email: secretaire.user?.email || '',
      telephone: secretaire.user?.telephone || '',
      adresse: secretaire.user?.adresse || '',
      numero_employe: secretaire.numero_employe || '',
      password: '',
      password_confirmation: ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedSecretaire = null;
    this.isEditing = false;
    this.errorMessage = '';
  }

  saveSecretaire(): void {
    // Validation des champs obligatoires
    if (!this.newSecretaire.nom || !this.newSecretaire.prenom || !this.newSecretaire.email) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Champs manquants',
          text: 'Veuillez remplir tous les champs obligatoires (nom, prénom, email)',
          icon: 'warning',
          confirmButtonColor: '#9333EA',
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

    // Validation du mot de passe pour la création
    if (!this.isEditing) {
      if (!this.newSecretaire.password || this.newSecretaire.password.length < 8) {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Mot de passe invalide',
            text: 'Le mot de passe doit contenir au moins 8 caractères',
            icon: 'warning',
            confirmButtonColor: '#9333EA',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-xl px-6 py-3 font-semibold'
            }
          });
        } else {
          this.errorMessage = 'Le mot de passe doit contenir au moins 8 caractères';
        }
        return;
      }

      if (this.newSecretaire.password !== this.newSecretaire.password_confirmation) {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Mots de passe différents',
            text: 'Les mots de passe ne correspondent pas',
            icon: 'warning',
            confirmButtonColor: '#9333EA',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-xl px-6 py-3 font-semibold'
            }
          });
        } else {
          this.errorMessage = 'Les mots de passe ne correspondent pas';
        }
        return;
      }
    }

    if (this.isEditing && this.selectedSecretaire) {
      this.updateSecretaire();
    } else {
      this.createSecretaire();
    }
  }

  createSecretaire(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.secretaireService.create(this.newSecretaire).subscribe({
      next: (response: any) => {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Succès !',
            text: 'Secrétaire créé(e) avec succès',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'rounded-2xl'
            }
          });
        } else {
          this.successMessage = 'Secrétaire créé(e) avec succès';
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.closeModal();
        this.loadSecretaires();
        this.isLoading = false;
      },
      error: (error: any) => {
        let errorMsg = 'Une erreur est survenue lors de la création';

        // Gérer les erreurs spécifiques
        if (error.error && error.error.message) {
          errorMsg = error.error.message;
        } else if (error.error && error.error.errors) {
          const errors = error.error.errors;
          errorMsg = Object.values(errors).flat().join(', ');
        }

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Erreur',
            text: errorMsg,
            icon: 'error',
            confirmButtonColor: '#9333EA',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-xl px-6 py-3 font-semibold'
            }
          });
        } else {
          this.errorMessage = errorMsg;
        }
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  updateSecretaire(): void {
    if (!this.selectedSecretaire) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.secretaireService.update(this.selectedSecretaire.id.toString(), this.newSecretaire).subscribe({
      next: (response: any) => {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Succès !',
            text: 'Secrétaire modifié(e) avec succès',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'rounded-2xl'
            }
          });
        } else {
          this.successMessage = 'Secrétaire modifié(e) avec succès';
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.closeModal();
        this.loadSecretaires();
        this.isLoading = false;
      },
      error: (error: any) => {
        let errorMsg = 'Une erreur est survenue lors de la modification';

        if (error.error && error.error.message) {
          errorMsg = error.error.message;
        } else if (error.error && error.error.errors) {
          const errors = error.error.errors;
          errorMsg = Object.values(errors).flat().join(', ');
        }

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Erreur',
            text: errorMsg,
            icon: 'error',
            confirmButtonColor: '#9333EA',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-xl px-6 py-3 font-semibold'
            }
          });
        } else {
          this.errorMessage = errorMsg;
        }
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onDelete(id: number): void {
    const secretaire = this.secretaires.find(s => s.id === id);
    const secretaireName = secretaire ? `${secretaire.user?.prenom} ${secretaire.user?.nom}` : 'ce secrétaire';

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Confirmer la suppression',
        html: `Êtes-vous sûr de vouloir supprimer <strong>${secretaireName}</strong> ?<br><small class="text-gray-500">Cette action est irréversible</small>`,
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
          this.secretaireService.deleteSecretaire(id).subscribe({
            next: () => {
              Swal.fire({
                title: 'Supprimé !',
                text: 'Le secrétaire a été supprimé avec succès',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                customClass: {
                  popup: 'rounded-2xl'
                }
              });
              this.loadSecretaires();
            },
            error: (error: any) => {
              Swal.fire({
                title: 'Erreur',
                text: 'Une erreur est survenue lors de la suppression',
                icon: 'error',
                confirmButtonColor: '#9333EA',
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
      if (confirm(`Êtes-vous sûr de vouloir supprimer ${secretaireName} ?`)) {
        this.secretaireService.deleteSecretaire(id).subscribe({
          next: () => {
            this.successMessage = 'Secrétaire supprimé(e) avec succès';
            this.loadSecretaires();
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

  getInitials(secretaire: Secretaire): string {
    const nom = secretaire.user?.nom || '';
    const prenom = secretaire.user?.prenom || '';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  getFullName(secretaire: Secretaire): string {
    return `${secretaire.user?.prenom || ''} ${secretaire.user?.nom || ''}`.trim();
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

  protected readonly Math = Math;
}
