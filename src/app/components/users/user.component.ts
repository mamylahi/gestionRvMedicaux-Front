import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

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

  // Nouvel utilisateur
  newUser: any = {
    nom: '',
    prenom: '',
    email: '',
    role: 'patient',
    telephone: '',
    adresse: '',
    password: '',
    password_confirmation: ''
  };

  constructor(private authService: AuthService) {}

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
    this.newUser = {
      nom: '',
      prenom: '',
      email: '',
      role: 'patient',
      telephone: '',
      adresse: '',
      password: '',
      password_confirmation: ''
    };
    this.showUserModal = true;
  }

  openEditUserModal(user: User): void {
    this.isEditing = true;
    this.selectedUser = user;
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
  }

  saveUser(): void {
    if (this.isEditing && this.selectedUser) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser(): void {
    this.isLoading = true;
    this.authService.register(this.newUser).subscribe({
      next: (response) => {
        this.successMessage = 'Utilisateur créé avec succès';
        this.closeUserModal();
        this.loadUsers();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la création de l\'utilisateur';
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

    this.authService.updateUser(this.selectedUser.id, updateData).subscribe({
      next: (response) => {
        this.successMessage = 'Utilisateur modifié avec succès';
        this.closeUserModal();
        this.loadUsers();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la modification de l\'utilisateur';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.prenom} ${user.nom} ?`)) {
      this.authService.deleteUser(user.id).subscribe({
        next: () => {
          this.successMessage = 'Utilisateur supprimé avec succès';
          this.loadUsers();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression de l\'utilisateur';
          console.error('Erreur:', error);
        }
      });
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
}
