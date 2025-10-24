import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Specialite } from '../../models/specialite.model';
import { SpecialiteService } from '../../services/specialite.service';
import { DepartementService } from '../../services/departement.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  departements: any[] = [];
  isLoadingDepartements: boolean = false;

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
        // Gestion des différents formats de réponse
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
        console.log('Réponse départements:', response); // Debug

        // Gestion des différents formats de réponse
        if (response.success && response.data) {
          this.departements = response.data;
        } else if (Array.isArray(response)) {
          this.departements = response;
        } else {
          this.departements = [];
          console.warn('Format de réponse inattendu pour les départements:', response);
        }

        this.isLoadingDepartements = false;
      },
      error: (error: any) => {
        console.error('Erreur complète lors du chargement des départements:', error);
        this.errorMessage = 'Erreur lors du chargement des départements';
        this.isLoadingDepartements = false;

        // Données de test en cas d'erreur
        this.departements = [
          { id: 1, nom: 'Médecine Générale' },
          { id: 2, nom: 'Chirurgie' },
          { id: 3, nom: 'Pédiatrie' },
          { id: 4, nom: 'Imagerie Médicale' }
        ];
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

  onAdd(): void {
    this.router.navigate(['/specialites/nouveau']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/specialites/modifier', id]);
  }

  onDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette spécialité ?')) {
      this.specialiteService.delete(id).subscribe({
        next: () => {
          this.loadSpecialites();
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

    // Si le département n'est pas chargé, chercher dans la liste des départements
    if (specialite.departement_id) {
      const dept = this.departements.find(d => d.id === specialite.departement_id);
      return dept?.nom || `Département ${specialite.departement_id}`;
    }

    return 'Département non assigné';
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

  // Méthode pour debugger
  debugDepartements(): void {
    console.log('Départements chargés:', this.departements);
    console.log('Spécialités chargées:', this.specialites);
  }
}
