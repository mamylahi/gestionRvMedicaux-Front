import { Component, OnInit } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {Patient} from '../../../models/patient.model';
import {PatientService} from '../../../services/patient.service';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterLink
  ]
})
export class PatientComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.patientService.getAll().subscribe({
      next: (response: any) => {
        // Gestion de la réponse avec le format de votre API
        if (response.success && response.data) {
          this.patients = response.data;
          this.filteredPatients = response.data;
        } else {
          this.patients = response; // Fallback si pas de structure standard
          this.filteredPatients = response;
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des patients';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPatients = this.patients;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredPatients = this.patients.filter(p =>
      p.user?.nom?.toLowerCase().includes(term) ||
      p.user?.prenom?.toLowerCase().includes(term) ||
      p.user?.email?.toLowerCase().includes(term) ||
      p.numero_patient?.toLowerCase().includes(term) ||
      p.user?.telephone?.toLowerCase().includes(term)
    );
  }

  onResetFilters(): void {
    this.searchTerm = '';
    this.filteredPatients = this.patients;
  }

  onExport(): void {
    // Implémentation de l'export
    console.log('Export des patients', this.filteredPatients);
    // Vous pouvez implémenter l'export CSV ou PDF ici
  }

  onEdit(id: number): void {
    this.router.navigate(['/patients/modifier', id]);
  }

  onDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      this.patientService.delete(id).subscribe({
        next: () => {
          this.loadPatients();
        },
        error: (error: any) => {
          this.errorMessage = 'Erreur lors de la suppression';
          console.error('Erreur:', error);
        }
      });
    }
  }

  onView(id: number): void {
    this.router.navigate(['/patients/details', id]);
  }

  onViewDashboard(id: number): void {
    this.router.navigate(['/patients/dashboard', id]);
  }

  getInitials(patient: Patient): string {
    const nom = patient.user?.nom || '';
    const prenom = patient.user?.prenom || '';
    return (prenom.charAt(0) + nom.charAt(0)).toUpperCase() || 'PA';
  }

  getCreationDate(patient: Patient): string {
    return patient.created_at ?
      new Date(patient.created_at).toLocaleDateString('fr-FR') :
      'Date inconnue';
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
