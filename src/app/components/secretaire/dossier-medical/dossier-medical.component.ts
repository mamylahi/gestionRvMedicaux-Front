import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { DossierMedical } from '../../../models/dossiermedical.model';
import { Patient } from '../../../models/patient.model';
import { DossierMedicalService } from '../../../services/dossier-medical.service';
import { PatientService } from '../../../services/patient.service';

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

  // Variables pour le modal
  showViewModal: boolean = false;
  selectedDossier: DossierMedical | null = null;
  selectedDossierPatientName: string = '';
  selectedDossierPatientNumber: string = '';

  groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  constructor(
      private dossierMedicalService: DossierMedicalService,
      private patientService: PatientService,
      private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDossiers();
    this.loadPatients();
  }

  loadDossiers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dossierMedicalService.getAll().subscribe({
      next: (data) => {
        console.log('Dossiers chargés:', data);
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
      filtered = filtered.filter(d => {
        const patientName = this.getPatientName(d).toLowerCase();
        const patientNumber = this.getPatientNumeroDossier(d).toLowerCase();
        return patientName.includes(term) || patientNumber.includes(term);
      });
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
    this.filteredDossiers = [...this.dossiers];
  }

  onAdd(): void {
    this.router.navigate(['/dossiers-medicaux/add']);
  }

  // Removed onEdit and onDelete methods

  onView(dossier: DossierMedical): void {
    this.selectedDossier = dossier;
    this.selectedDossierPatientName = this.getPatientName(dossier);
    this.selectedDossierPatientNumber = this.getPatientNumeroDossier(dossier);
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedDossier = null;
    this.selectedDossierPatientName = '';
    this.selectedDossierPatientNumber = '';
  }

  getPatientName(dossier: DossierMedical): string {
    if (dossier.patient?.user) {
      const nom = dossier.patient.user.nom || '';
      const prenom = dossier.patient.user.prenom || '';
      return `${nom} ${prenom}`.trim();
    }

    // Fallback: chercher dans la liste des patients
    const patient = this.patients.find(p => p.id === dossier.patient_id);
    if (patient?.user) {
      const nom = patient.user.nom || '';
      const prenom = patient.user.prenom || '';
      return `${nom} ${prenom}`.trim();
    }

    return 'Patient inconnu';
  }

  getPatientNumeroDossier(dossier: DossierMedical): string {
    if (dossier.patient?.numero_patient) {
      return dossier.patient.numero_patient;
    }

    // Fallback: chercher dans la liste des patients
    const patient = this.patients.find(p => p.id === dossier.patient_id);
    return patient?.numero_patient || 'N/A';
  }

  getGroupeSanguinBadgeClass(groupe: string | undefined): string {
    if (!groupe) return 'bg-gray-500';

    const classes: { [key: string]: string } = {
      'A+': 'bg-red-500',
      'A-': 'bg-orange-500',
      'B+': 'bg-blue-500',
      'B-': 'bg-indigo-500',
      'AB+': 'bg-green-500',
      'AB-': 'bg-purple-500',
      'O+': 'bg-red-600',
      'O-': 'bg-orange-600'
    };
    return classes[groupe] || 'bg-gray-500';
  }

  loadPatients() {
    this.patientService.getAll().subscribe({
      next: (data: any) => {
        this.patients = data.data || data || [];
        console.log('Patients chargés:', this.patients);
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des patients:', error);
      }
    });
  }
}
