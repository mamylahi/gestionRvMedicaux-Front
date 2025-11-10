import { Component, OnInit } from '@angular/core';
import {CommonModule, formatDate} from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import {SpecialiteService} from '../../../services/specialite.service';

// Déclaration pour SweetAlert2
declare var Swal: any;

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  telephone?: string;
  adresse?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class UserComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Filtres
  searchTerm: string = '';
  selectedRole: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Modal
  showUserModal: boolean = false;
  selectedUser: User | null = null;
  isEditing: boolean = false;

  // Contrôle affichage spécialité
  showSpecialiteField: boolean = false;

  // Contrôle visibilité mot de passe
  showPassword: boolean = false;
  showPasswordConfirmation: boolean = false;

  // Nouvel utilisateur
  newUser: any = {
    nom: '',
    prenom: '',
    email: '',
    role: 'patient',
    telephone: '',
    adresse: '',
    password: '',
    password_confirmation: '',
    specialite_id: ''
  };

  constructor(
    private authService: AuthService,
    private specialiteService: SpecialiteService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getAllUsers().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.users = Array.isArray(response.data) ? response.data : [response.data];
        } else if (Array.isArray(response)) {
          this.users = response;
        } else {
          this.users = [];
        }
        this.filteredUsers = [...this.users];
        this.calculateTotalPages();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des utilisateurs';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  togglePasswordConfirmationVisibility(): void {
    this.showPasswordConfirmation = !this.showPasswordConfirmation;
  }

  onRoleChange(): void {
    const role = this.newUser.role;

    if (role === 'medecin') {
      this.showSpecialiteField = true;
    } else {
      this.showSpecialiteField = false;
      this.newUser.specialite_id = '';
    }
  }

  onSearch(): void {
    let filtered = this.users;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.nom?.toLowerCase().includes(term) ||
        user.prenom?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.telephone?.toLowerCase().includes(term)
      );
    }

    if (this.selectedRole) {
      filtered = filtered.filter(user => user.role === this.selectedRole);
    }

    this.filteredUsers = filtered;
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  onResetFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.filteredUsers = [...this.users];
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
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

  getRoleLabel(role: string): string {
    const roles: { [key: string]: string } = {
      'admin': 'Administrateur',
      'medecin': 'Médecin',
      'secretaire': 'Secrétaire',
      'patient': 'Patient'
    };
    return roles[role] || role;
  }

  getRoleBadgeClass(role: string): string {
    const classes: { [key: string]: string } = {
      'admin': 'bg-red-100 text-red-800',
      'medecin': 'bg-blue-100 text-blue-800',
      'secretaire': 'bg-green-100 text-green-800',
      'patient': 'bg-purple-100 text-purple-800'
    };
    return classes[role] || 'bg-gray-100 text-gray-800';
  }

  openAddUserModal(): void {
    this.isEditing = false;
    this.selectedUser = null;
    this.showSpecialiteField = false;
    this.showPassword = false;
    this.showPasswordConfirmation = false;
    this.newUser = {
      nom: '',
      prenom: '',
      email: '',
      role: 'patient',
      telephone: '',
      adresse: '',
      password: '',
      password_confirmation: '',
      specialite_id: ''
    };
    this.showUserModal = true;
  }

  openEditUserModal(user: User): void {
    // Demander confirmation avec SweetAlert2
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Modifier l\'utilisateur',
        html: `Voulez-vous modifier <strong>${user.prenom} ${user.nom}</strong> ?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3B82F6',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Oui, modifier',
        cancelButtonText: 'Annuler',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl px-6 py-3 font-semibold',
          cancelButton: 'rounded-xl px-6 py-3 font-semibold'
        }
      }).then((result: { isConfirmed: boolean }) => {
        if (result.isConfirmed) {
          this.proceedToEdit(user);
        }
      });
    } else {
      // Fallback si SweetAlert2 n'est pas disponible
      if (confirm(`Voulez-vous modifier ${user.prenom} ${user.nom} ?`)) {
        this.proceedToEdit(user);
      }
    }
  }

  private proceedToEdit(user: User): void {
    this.isEditing = true;
    this.selectedUser = user;
    this.showSpecialiteField = user.role === 'medecin';
    this.showPassword = false;
    this.showPasswordConfirmation = false;
    this.newUser = {
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      telephone: user.telephone || '',
      adresse: user.adresse || '',
      password: '',
      password_confirmation: ''
    };
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.selectedUser = null;
    this.isEditing = false;
    this.showSpecialiteField = false;
    this.showPassword = false;
    this.showPasswordConfirmation = false;
  }

  saveUser(): void {
    if (this.isEditing && this.selectedUser) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  private showSnackbar(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    const bgColors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    };

    const snackbar = document.createElement('div');
    snackbar.className = `fixed bottom-6 right-6 ${bgColors[type]} text-white px-6 py-4 rounded-xl shadow-2xl z-[9999] flex items-center gap-3 animate-slide-in-right`;
    snackbar.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${type === 'success'
      ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'
      : type === 'error'
        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>'
        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
    }
      </svg>
      <span class="font-semibold">${message}</span>
    `;

    document.body.appendChild(snackbar);

    setTimeout(() => {
      snackbar.classList.add('animate-slide-out-right');
      setTimeout(() => {
        document.body.removeChild(snackbar);
      }, 300);
    }, 3000);
  }

  createUser(): void {
    this.isLoading = true;
    const userData = { ...this.newUser };

    // Ne pas envoyer specialite_id si ce n'est pas un médecin
    if (userData.role !== 'medecin') {
      delete userData.specialite_id;
    }

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.showSnackbar('Utilisateur créé avec succès', 'success');
        this.closeUserModal();
        this.loadUsers();
        this.isLoading = false;
      },
      error: (error) => {
        this.showSnackbar('Erreur lors de la création de l\'utilisateur', 'error');
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  updateUser(): void {
    if (!this.selectedUser) return;

    this.isLoading = true;
    const updateData = { ...this.newUser };

    // Ne pas envoyer les champs de mot de passe s'ils sont vides
    if (!updateData.password) {
      delete updateData.password;
      delete updateData.password_confirmation;
    }

    // Ne pas envoyer specialite_id si ce n'est pas un médecin
    if (updateData.role !== 'medecin') {
      delete updateData.specialite_id;
    }

    this.authService.updateUser(this.selectedUser.id, updateData).subscribe({
      next: (response) => {
        this.showSnackbar('Utilisateur modifié avec succès', 'success');
        this.closeUserModal();
        this.loadUsers();
        this.isLoading = false;
      },
      error: (error) => {
        this.showSnackbar('Erreur lors de la modification de l\'utilisateur', 'error');
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  deleteUser(user: User): void {
    // Utiliser SweetAlert2 si disponible
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Confirmer la suppression',
        html: `Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>${user.prenom} ${user.nom}</strong> ?<br><small class="text-gray-500">Cette action est irréversible</small>`,
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
          this.authService.deleteUser(user.id).subscribe({
            next: () => {
              this.showSnackbar('Utilisateur supprimé avec succès', 'success');
              this.loadUsers();
            },
            error: (error) => {
              this.showSnackbar('Erreur lors de la suppression de l\'utilisateur', 'error');
              console.error('Erreur:', error);
            }
          });
        }
      });
    } else {
      // Fallback vers confirm natif si SweetAlert2 n'est pas disponible
      if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.prenom} ${user.nom} ?`)) {
        this.authService.deleteUser(user.id).subscribe({
          next: () => {
            this.showSnackbar('Utilisateur supprimé avec succès', 'success');
            this.loadUsers();
          },
          error: (error) => {
            this.showSnackbar('Erreur lors de la suppression de l\'utilisateur', 'error');
            console.error('Erreur:', error);
          }
        });
      }
    }
  }

  getUserInitials(nom: string, prenom: string): string {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  getFullName(user: User): string {
    return `${user.prenom} ${user.nom}`;
  }

  getStats() {
    return {
      total: this.users.length,
      admin: this.users.filter(u => u.role === 'admin').length,
      medecin: this.users.filter(u => u.role === 'medecin').length,
      secretaire: this.users.filter(u => u.role === 'secretaire').length,
      patient: this.users.filter(u => u.role === 'patient').length
    };
  }

  protected readonly Math = Math;

  // Méthode pour formater les dates en français
  formatDateFr(date: string, format: string): string {
    return formatDate(date, format, 'fr-FR');
  }
}
