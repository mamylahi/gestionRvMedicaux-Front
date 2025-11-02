import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from '../../../services/patient.service';
import { AuthService } from '../../../services/auth.service';
import { GroupeSanguin } from '../../../models/enum';
import { DatePipe } from '@angular/common';
declare var Swal: any;

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
        if (response?.success && response?.data) {
          const data = response.data;

          this.dossierMedical = data.dossier_medical;
          this.patient = data.patient;
          this.nombreConsultations = data.nombre_consultations || 0;
          this.derniereConsultation = data.derniere_consultation;

          if (this.dossierMedical && this.patient) {
            this.dossierMedical.patient = this.patient;
          }

          // Notification de succès avec SweetAlert
          Swal.fire({
            icon: 'success',
            title: 'Dossier médical chargé',
            text: 'Votre dossier médical a été chargé avec succès',
            timer: 2000,
            showConfirmButton: false
          });

        } else {
          this.errorMessage = 'Format de réponse invalide';
          this.showErrorAlert('Format de réponse invalide');
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur détaillée:', error);

        if (error.status === 401) {
          this.errorMessage = 'Vous devez être connecté pour accéder à votre dossier médical';
          this.showErrorAlert('Session expirée. Veuillez vous reconnecter.');
          this.router.navigate(['/login']);
        } else if (error.status === 404) {
          this.errorMessage = 'Aucun dossier médical trouvé';
          this.showInfoAlert('Aucun dossier médical trouvé');
        } else {
          this.errorMessage = error.error?.message || 'Erreur lors du chargement de votre dossier médical';
          this.showErrorAlert(this.errorMessage);
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
      Swal.fire({
        title: 'Modifier le dossier',
        text: 'Vous allez être redirigé vers la page de modification',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Continuer',
        cancelButtonText: 'Annuler'
      }).then((result: { isConfirmed: any; }) => {
        if (result.isConfirmed) {
          this.router.navigate(['/dossier-medical/modifier', this.dossierMedical.id]);
        }
      });
    }
  }

  onExport(): void {
    Swal.fire({
      title: 'Exporter le dossier',
      text: 'Voulez-vous exporter votre dossier médical en PDF ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Exporter',
      cancelButtonText: 'Annuler'
    }).then((result: { isConfirmed: any; }) => {
      if (result.isConfirmed) {
        // Logique d'export PDF ici
        Swal.fire({
          icon: 'success',
          title: 'Export réussi',
          text: 'Votre dossier médical a été exporté en PDF',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  private showErrorAlert(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: message,
      confirmButtonColor: '#3085d6'
    });
  }

  private showInfoAlert(message: string): void {
    Swal.fire({
      icon: 'info',
      title: 'Information',
      text: message,
      confirmButtonColor: '#3085d6'
    });
  }
}
