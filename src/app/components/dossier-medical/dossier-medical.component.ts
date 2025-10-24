import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {DossierMedical} from '../../models/dossiermedical.model';
import {Patient} from '../../models/patient.model';
import {DossierMedicalService} from '../../services/dossier-medical.service';
import {PatientService} from '../../services/patient.service';
import {FormsModule} from '@angular/forms';
import {CommonModule, DatePipe, NgClass} from '@angular/common';


@Component({
  selector: 'app-dossier-medical',
  templateUrl: './dossier-medical.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    DatePipe,
    CommonModule
  ]
})
export class DossierMedicalComponent implements OnInit {
  dossiers: DossierMedical[] = [];
  filteredDossiers: DossierMedical[] = [];
  patients: Patient[] = [];
  searchTerm: string = '';
  selectedGroupeSanguin: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  constructor(
    private dossierMedicalService: DossierMedicalService,
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.loadDossiers();
  }

  loadPatients(): void {
    this.patientService.getAll().subscribe({
      next: (data) => {
        this.patients = data;
      },
      error: (error) => {
        console.error('Erreur chargement patients:', error);
      }
    });
  }

  loadDossiers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dossierMedicalService.getAll().subscribe({
      next: (data) => {
        this.dossiers = data;
        this.filteredDossiers = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des dossiers médicaux';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onSearch(): void {
    let filtered = this.dossiers;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.patient?.user?.nom?.toLowerCase().includes(term) ||
        d.patient?.user?.prenom?.toLowerCase().includes(term) ||
        d.patient?.numero_patient?.toLowerCase().includes(term)
      );
    }

    if (this.selectedGroupeSanguin) {
      filtered = filtered.filter(d =>
        d.groupe_sanguin === this.selectedGroupeSanguin
      );
    }

    this.filteredDossiers = filtered;
  }

  onResetFilters(): void {
    this.searchTerm = '';
    this.selectedGroupeSanguin = '';
    this.loadDossiers();
  }

  onAdd(): void {
    this.router.navigate(['/dossiers-medicaux/add']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/dossiers-medicaux/modifier', id]);
  }

  onDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier médical ?')) {
      this.dossierMedicalService.delete(id).subscribe({
        next: () => {
          this.loadDossiers();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression';
          console.error('Erreur:', error);
        }
      });
    }
  }

  onView(id: number): void {
    this.router.navigate(['/dossiers-medicaux/details', id]);
  }

  getPatientName(dossier: DossierMedical): string {
    if (dossier.patient) {
      return `${dossier.patient?.user?.nom} ${dossier.patient?.user?.prenom}`;
    }
    return 'Patient inconnu';
  }

  getPatientNumeroDossier(dossier: DossierMedical): string {
    return dossier.patient?.numero_patient || 'N/A';
  }

  getGroupeSanguinBadgeClass(groupe: string | undefined): string {
    if (!groupe) return 'bg-secondary';

    const classes: { [key: string]: string } = {
      'A+': 'bg-danger',
      'A-': 'bg-warning',
      'B+': 'bg-info',
      'B-': 'bg-primary',
      'AB+': 'bg-success',
      'AB-': 'bg-dark',
      'O+': 'bg-danger',
      'O-': 'bg-warning'
    };
    return classes[groupe] || 'bg-secondary';
  }
}
