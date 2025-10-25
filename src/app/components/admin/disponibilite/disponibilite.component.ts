import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {MedecinService} from '../../../../../../../../../OneDrive/Desktop/gestionRvMedicaux-Front/gestionRvMedicaux-Front/gestionRvMedicaux-Front/src/app/services/medecin.service';
import {DisponibiliteService} from '../../../../../../../../../OneDrive/Desktop/gestionRvMedicaux-Front/gestionRvMedicaux-Front/gestionRvMedicaux-Front/src/app/services/disponibilite.service';
import {Disponibilite} from '../../../../../../../../../OneDrive/Desktop/gestionRvMedicaux-Front/gestionRvMedicaux-Front/gestionRvMedicaux-Front/src/app/models/disponibilite.model';
import {Medecin} from '../../../../../../../../../OneDrive/Desktop/gestionRvMedicaux-Front/gestionRvMedicaux-Front/gestionRvMedicaux-Front/src/app/models/medecin.model';
import {FormsModule} from '@angular/forms';
import {CommonModule, DatePipe} from '@angular/common';


@Component({
  selector: 'app-disponibilite',
  templateUrl: './disponibilite.component.html',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    CommonModule

  ]
})
export class DisponibiliteComponent implements OnInit {
  disponibilites: Disponibilite[] = [];
  filteredDisponibilites: Disponibilite[] = [];
  medecins: Medecin[] = [];
  searchTerm: string = '';
  selectedMedecinId: string = '';
  startDate: string = '';
  endDate: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private disponibiliteService: DisponibiliteService,
    private medecinService: MedecinService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMedecins();
    this.loadDisponibilites();
  }

  loadMedecins(): void {
    this.medecinService.getAll().subscribe({
      next: (data) => {
        this.medecins = data;
      },
      error: (error) => {
        console.error('Erreur chargement médecins:', error);
      }
    });
  }

  loadDisponibilites(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.disponibiliteService.getAll().subscribe({
      next: (data) => {
        this.disponibilites = data;
        this.filteredDisponibilites = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des disponibilités';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onSearch(): void {
    let filtered = this.disponibilites;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.medecin?.user?.nom?.toLowerCase().includes(term) ||
        d.medecin?.user?.prenom?.toLowerCase().includes(term)
      );
    }

    if (this.selectedMedecinId) {
      filtered = filtered.filter(d =>
        d.medecin_id.toString() === this.selectedMedecinId
      );
    }

    this.filteredDisponibilites = filtered;
  }

  onFilterByMedecin(): void {
    if (!this.selectedMedecinId) {
      this.loadDisponibilites();
      return;
    }

    this.isLoading = true;
    this.disponibiliteService.getByMedecin(this.selectedMedecinId).subscribe({
      next: (data) => {
        this.disponibilites = data;
        this.filteredDisponibilites = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du filtrage';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onFilterByDateRange(): void {
    if (!this.startDate || !this.endDate) {
      this.errorMessage = 'Veuillez sélectionner une plage de dates';
      return;
    }

    this.isLoading = true;
    this.disponibiliteService.getByDateRange(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.disponibilites = data;
        this.filteredDisponibilites = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du filtrage par dates';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onResetFilters(): void {
    this.searchTerm = '';
    this.selectedMedecinId = '';
    this.startDate = '';
    this.endDate = '';
    this.loadDisponibilites();
  }

  onAdd(): void {
    this.router.navigate(['/disponibilites/add']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/disponibilites/modifier', id]);
  }

  onDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette disponibilité ?')) {
      this.disponibiliteService.delete(id).subscribe({
        next: () => {
          this.loadDisponibilites();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression';
          console.error('Erreur:', error);
        }
      });
    }
  }

  onView(id: number): void {
    this.router.navigate(['/disponibilites/details', id]);
  }

  getMedecinName(disponibilite: Disponibilite): string {
    if (disponibilite.medecin) {
      return `Dr. ${disponibilite.medecin?.user?.nom} ${disponibilite.medecin?.user?.prenom}`;
    }
    return 'Médecin inconnu';
  }

  isExpired(dateDebut: Date): boolean {
    return new Date(dateDebut) < new Date();
  }

  isActive(dateDebut: Date, dateFin: Date): boolean {
    const now = new Date();
    return new Date(dateDebut) <= now && new Date(dateFin) >= now;
  }
}
