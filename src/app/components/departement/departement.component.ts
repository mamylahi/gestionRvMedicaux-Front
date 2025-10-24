import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Departement } from '../../models/departement.model';
import { DepartementService } from '../../services/departement.service';
import { SpecialiteService } from '../../services/specialite.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  specialites: any[] = [];

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
        // Gestion des différents formats de réponse
        if (response.success && response.data) {
          this.departements = response.data;
        } else if (Array.isArray(response)) {
          this.departements = response;
        } else {
          this.departements = [];
        }
        this.filteredDepartements = this.departements;
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
      this.filteredDepartements = this.departements;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredDepartements = this.departements.filter(dept =>
      dept.nom?.toLowerCase().includes(term) ||
      dept.description?.toLowerCase().includes(term)
    );
  }

  onResetFilters(): void {
    this.searchTerm = '';
    this.filteredDepartements = this.departements;
  }

  onAdd(): void {
    this.router.navigate(['/departements/nouveau']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/departements/modifier', id]);
  }

  onDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
      this.departementService.delete(id).subscribe({
        next: () => {
          this.loadDepartements();
        },
        error: (error: any) => {
          this.errorMessage = 'Erreur lors de la suppression';
          console.error('Erreur:', error);
        }
      });
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

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
}
