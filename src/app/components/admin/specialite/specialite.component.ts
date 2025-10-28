import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Specialite} from '../../../models/specialite.model';
import {SpecialiteService} from '../../../services/specialite.service';
import {DepartementService} from '../../../services/departement.service';

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
        this.filteredSpecialites = this.specialites;
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
  }

  onResetFilters(): void {
    this.searchTerm = '';
    this.selectedDepartement = '';
    this.filteredSpecialites = this.specialites;
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
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
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
        this.successMessage = 'Spécialité créée avec succès';
        this.closeModal();
        this.loadSpecialites();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors de la création de la spécialité';
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
        this.successMessage = 'Spécialité modifiée avec succès';
        this.closeModal();
        this.loadSpecialites();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors de la modification de la spécialité';
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
    if (confirm('Êtes-vous sûr de vouloir supprimer cette spécialité ?')) {
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

  getSpecialiteIcon(nom: string): string {
    const icons: { [key: string]: string } = {
      'Cardiologie': 'fa-heartbeat',
      'Pédiatrie': 'fa-baby',
      'Neurologie': 'fa-brain',
      'Orthopédie': 'fa-bone',
      'Dermatologie': 'fa-hand-sparkles',
      'Ophtalmologie': 'fa-eye',
      'Gynécologie': 'fa-venus',
      'Radiologie': 'fa-x-ray',
      'Chirurgie': 'fa-cut',
      'Médecine générale': 'fa-stethoscope',
      'Urgences': 'fa-ambulance',
      'Psychiatrie': 'fa-brain',
      'Anesthésie': 'fa-syringe',
      'Oncologie': 'fa-plus-square',
      'Rhumatologie': 'fa-bone',
      'Urologie': 'fa-procedures'
    };

    if (!nom) return 'fa-briefcase-medical';

    for (const [key, icon] of Object.entries(icons)) {
      if (nom.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }

    return 'fa-briefcase-medical';
  }

  getCreationDate(specialite: Specialite): string {
    return specialite.created_at ?
      new Date(specialite.created_at).toLocaleDateString('fr-FR') :
      'Date inconnue';
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
}
