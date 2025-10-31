import { Component, OnInit } from '@angular/core';
import { MedecinService } from '../../../services/medecin.service';
import { DossierMedicalService } from '../../../services/dossier-medical.service';
import { Patient } from '../../../models/patient.model';
import { DossierMedical } from '../../../models/dossiermedical.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  imports: [CommonModule]
})
export class MedecinPatientComponent implements OnInit {
  patients: Patient[] = [];
  loading = false;
  errorMessage = '';

  // Modal
  showModal = false;
  selectedDossierMedical: DossierMedical | null = null;
  loadingDossier = false;
  dossierErrorMessage = '';

  constructor(
    private medecinService: MedecinService,
    private dossierMedicalService: DossierMedicalService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadMesPatients();
  }

  loadMesPatients(): void {
    this.loading = true;
    this.errorMessage = '';

    this.medecinService.getMesPatients().subscribe({
      next: (data: Patient[]) => {
        this.patients = data;
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des patients';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  getInitials(prenom: string | undefined, nom: string | undefined): string {
    if (!prenom || !nom) return '??';
    return (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
  }

  calculerAge(dateNaissance: Date): number {
    if (!dateNaissance) return 0;
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  voirDossierMedical(patientId: number): void {
    this.loadingDossier = true;
    this.dossierErrorMessage = '';
    this.showModal = true;

    // Charger le dossier médical du patient
    this.dossierMedicalService.getByPatientId(patientId).subscribe({
      next: (dossier: DossierMedical) => {
        this.selectedDossierMedical = dossier;
        this.loadingDossier = false;
      },
      error: (error: any) => {
        this.dossierErrorMessage = 'Erreur lors du chargement du dossier médical';
        this.loadingDossier = false;
        console.error('Erreur:', error);
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedDossierMedical = null;
    this.dossierErrorMessage = '';
  }

  getGroupeSanguinText(groupe: string | undefined): string {
    return groupe || 'Non renseigné';
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  prendreRendezVous(patientId: number): void {
    // Navigation vers la page de rendez-vous
    this.router.navigate(['/rendez-vous'], { queryParams: { patientId } });
  }

  contacterPatient(patient: Patient): void {
    if (patient.user?.email) {
      window.location.href = `mailto:${patient.user.email}`;
    }
  }
}
