import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from '../../../services/patient.service';
import { AuthService } from '../../../services/auth.service';
import { DossierMedical } from '../../../models/dossiermedical.model';
import { GroupeSanguin } from '../../../models/enum';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-mon-dossier-medical',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './dossier-medical.component.html',
})
export class PatientDossierMedicalComponent implements OnInit {
  dossierMedical: any = null;
  patient: any = null;
  nombreConsultations: number = 0;
  derniereConsultation: any = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private patientService: PatientService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMonDossierMedical();
  }

  loadMonDossierMedical(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.patientService.getMonDossierMedical().subscribe({
      next: (response: any) => {
        console.log('=== DÉBUT DEBUG ===');
        console.log('Réponse complète:', response);
        console.log('Type:', typeof response);
        console.log('Keys:', Object.keys(response));

        // La structure de réponse de votre backend Laravel:
        // { success: true, data: { dossier_medical: {...}, patient: {...}, nombre_consultations: X, derniere_consultation: {...} } }

        if (response?.success && response?.data) {
          const data = response.data;

          console.log('Data extraite:', data);
          console.log('Dossier médical:', data.dossier_medical);
          console.log('Patient:', data.patient);

          // Assigner les données
          this.dossierMedical = data.dossier_medical;
          this.patient = data.patient;
          this.nombreConsultations = data.nombre_consultations || 0;
          this.derniereConsultation = data.derniere_consultation;

          // Enrichir dossierMedical avec patient pour la compatibilité du template
          if (this.dossierMedical && this.patient) {
            this.dossierMedical.patient = this.patient;
          }

          console.log('✅ Dossier médical final:', this.dossierMedical);
          console.log('✅ Patient:', this.patient);
          console.log('✅ Nombre consultations:', this.nombreConsultations);
          console.log('=== FIN DEBUG ===');

        } else {
          console.error('❌ Structure de réponse invalide:', response);
          this.errorMessage = 'Format de réponse invalide';
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erreur détaillée:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error body:', error.error);

        if (error.status === 401) {
          this.errorMessage = 'Vous devez être connecté pour accéder à votre dossier médical';
          this.router.navigate(['/login']);
        } else if (error.status === 404) {
          this.errorMessage = 'Aucun dossier médical trouvé';
        } else {
          this.errorMessage = error.error?.message || 'Erreur lors du chargement de votre dossier médical';
        }

        this.isLoading = false;
        this.dossierMedical = null;
      }
    });
  }

  formatGroupeSanguin(groupe: GroupeSanguin | string | undefined): string {
    if (!groupe) return 'Non renseigné';
    return groupe.toString().replace('_', ' ');
  }

  onEdit(): void {
    if (this.dossierMedical) {
      this.router.navigate(['/dossier-medical/modifier', this.dossierMedical.id]);
    }
  }
}
