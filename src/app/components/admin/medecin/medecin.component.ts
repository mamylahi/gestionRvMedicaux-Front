import { Component, OnInit } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass, NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import {SpecialiteService} from '../../../services/specialite.service';
import {MedecinService} from '../../../services/medecin.service';
import {Specialite} from '../../../models/specialite.model';
import {Medecin} from '../../../models/medecin.model';

@Component({
  selector: 'app-medecin',
  templateUrl: './medecin.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    DatePipe,
    NgFor,
    CommonModule,
  ]
})
export class MedecinComponent implements OnInit {
  medecins: Medecin[] = [];
  filteredMedecins: Medecin[] = [];
  specialites: Specialite[] = [];
  searchTerm: string = '';
  selectedSpecialiteId: string = '';
  filterDisponible: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private medecinService: MedecinService,
    private specialiteService: SpecialiteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSpecialites();
    this.loadMedecins();
  }

  loadSpecialites(): void {
    this.specialiteService.getAll().subscribe({
      next: (data: any) => {
        // ✅ CORRECTION: S'assurer que c'est un tableau
        if (data && data.data) {
          this.specialites = Array.isArray(data.data) ? data.data : [data.data];
        } else if (Array.isArray(data)) {
          this.specialites = data;
        } else {
          this.specialites = [];
        }
        console.log('Spécialités chargées:', this.specialites);
      },
      error: (error) => {
        console.error('Erreur chargement spécialités:', error);
        this.specialites = []; // ✅ S'assurer que c'est un tableau même en cas d'erreur
      }
    });
  }

  loadMedecins(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.medecinService.getAll().subscribe({
      next: (data: any) => {
        // ✅ CORRECTION: S'assurer que c'est un tableau
        if (data && data.data) {
          this.medecins = Array.isArray(data.data) ? data.data : [data.data];
        } else if (Array.isArray(data)) {
          this.medecins = data;
        } else {
          this.medecins = [];
        }

        this.filteredMedecins = [...this.medecins]; // ✅ Créer une copie
        this.isLoading = false;
        console.log('Médecins chargés:', this.medecins);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des médecins';
        this.isLoading = false;
        this.medecins = []; // ✅ S'assurer que c'est un tableau même en cas d'erreur
        this.filteredMedecins = [];
        console.error('Erreur:', error);
      }
    });
  }

  onSearch(): void {
    let filtered = this.medecins;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.user?.nom?.toLowerCase().includes(term) ||
        m.user?.prenom?.toLowerCase().includes(term) ||
        m.numero_medecin?.toLowerCase().includes(term) ||
        m.specialite?.nom?.toLowerCase().includes(term)
      );
    }

    if (this.selectedSpecialiteId) {
      filtered = filtered.filter(m =>
        m.specialite_id?.toString() === this.selectedSpecialiteId
      );
    }

    if (this.filterDisponible !== '') {
      const disponible = this.filterDisponible === 'true';
      filtered = filtered.filter(m => m.disponible === disponible);
    }

    this.filteredMedecins = filtered;
  }

  onFilterBySpecialite(): void {
    if (!this.selectedSpecialiteId) {
      this.loadMedecins();
      return;
    }

    this.isLoading = true;
    this.medecinService.getBySpecialite(this.selectedSpecialiteId).subscribe({
      next: (data: any) => {
        // ✅ CORRECTION: S'assurer que c'est un tableau
        if (data && data.data) {
          this.medecins = Array.isArray(data.data) ? data.data : [data.data];
        } else if (Array.isArray(data)) {
          this.medecins = data;
        } else {
          this.medecins = [];
        }
        this.filteredMedecins = [...this.medecins];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du filtrage';
        this.isLoading = false;
        this.medecins = [];
        this.filteredMedecins = [];
        console.error('Erreur:', error);
      }
    });
  }

  onFilterDisponibles(): void {
    this.isLoading = true;
    this.medecinService.getDisponibles().subscribe({
      next: (data: any) => {
        // ✅ CORRECTION: S'assurer que c'est un tableau
        if (data && data.data) {
          this.medecins = Array.isArray(data.data) ? data.data : [data.data];
        } else if (Array.isArray(data)) {
          this.medecins = data;
        } else {
          this.medecins = [];
        }
        this.filteredMedecins = [...this.medecins];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du filtrage';
        this.isLoading = false;
        this.medecins = [];
        this.filteredMedecins = [];
        console.error('Erreur:', error);
      }
    });
  }

  // ... le reste de vos méthodes reste inchangé
  onResetFilters(): void {
    this.searchTerm = '';
    this.selectedSpecialiteId = '';
    this.filterDisponible = '';
    this.loadMedecins();
  }

  onEdit(id: number): void {
    this.router.navigate(['/medecins/modifier', id]);
  }

  onDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce médecin ?')) {
      this.medecinService.delete(id).subscribe({
        next: () => {
          this.loadMedecins();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression';
          console.error('Erreur:', error);
        }
      });
    }
  }

  onView(id: number): void {
    this.router.navigate(['/medecins/details', id]);
  }

  onViewDashboard(id: number): void {
    this.router.navigate(['/medecins/dashboard', id]);
  }

  getMedecinName(medecin: Medecin): string {
    if (medecin.user) {
      return `Dr. ${medecin.user.nom} ${medecin.user.prenom}`;
    }
    return 'Médecin inconnu';
  }

  getSpecialiteName(medecin: Medecin): string {
    return medecin.specialite?.nom || 'Non spécifiée';
  }

  getAvailableMedecinsCount(): number {
    return this.medecins.filter(m => m.disponible).length;
  }

  getUnavailableMedecinsCount(): number {
    return this.medecins.filter(m => !m.disponible).length;
  }
}
