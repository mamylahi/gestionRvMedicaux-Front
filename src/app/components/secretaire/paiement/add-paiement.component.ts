import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { Paiement } from '../../../models/paiement.model';
import { StatutPaiement } from '../../../models/enum';
import { PaiementService } from '../../../services/paiement.service';
import { PatientService } from '../../../services/patient.service';
import { ConsultationService } from '../../../services/consultation.service';

@Component({
  selector: 'app-add-paiement',
  templateUrl: './add-paiement.component.html',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    DatePipe
  ]
})
export class AddPaiementComponent implements OnInit {
  paiement: Paiement = new Paiement();
  statutEnum = Object.values(StatutPaiement);

  patients: any[] = [];
  consultations: any[] = [];
  selectedPatientId: string = '';
  selectedConsultation: any = null;

  constructor(
    private paiementService: PaiementService,
    private patientService: PatientService,
    private consultationService: ConsultationService,
    private router: Router
  ) {
    // Initialiser la date de paiement à aujourd'hui
    const today = new Date();
    this.paiement.date_paiement = today.toISOString().split('T')[0];
    // Statut par défaut
    this.paiement.statut = StatutPaiement.VALIDE;
  }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getAll().subscribe({
      next: (data: any) => {
        if (data && data.data) {
          this.patients = Array.isArray(data.data) ? data.data : [data.data];
        } else if (Array.isArray(data)) {
          this.patients = data;
        } else {
          this.patients = [];
        }
        console.log('Patients chargés:', this.patients);
      },
      error: (err) => {
        console.error('Erreur de chargement des patients', err);
        this.patients = [];
      }
    });
  }

  onPatientChange(): void {
    if (this.selectedPatientId) {
      this.loadConsultationsForPatient(this.selectedPatientId);
      // Réinitialiser la consultation sélectionnée
      this.paiement.consultation_id = 0;
      this.selectedConsultation = null;
    } else {
      this.consultations = [];
      this.selectedConsultation = null;
    }
  }

  loadConsultationsForPatient(patientId: string): void {
    this.consultationService.getAll().subscribe({
      next: (data: any) => {
        let allConsultations: any[] = [];

        if (data && data.data) {
          allConsultations = Array.isArray(data.data) ? data.data : [data.data];
        } else if (Array.isArray(data)) {
          allConsultations = data;
        }

        // Filtrer les consultations pour le patient sélectionné
        this.consultations = allConsultations.filter(
          c => String(c.patient_id) === String(patientId)
        );

        console.log('Consultations pour le patient:', this.consultations);
      },
      error: (err) => {
        console.error('Erreur de chargement des consultations', err);
        this.consultations = [];
      }
    });
  }

  onConsultationChange(): void {
    if (this.paiement.consultation_id) {
      // Trouver la consultation sélectionnée
      this.selectedConsultation = this.consultations.find(
        c => c.id === this.paiement.consultation_id
      );
      console.log('Consultation sélectionnée:', this.selectedConsultation);
    } else {
      this.selectedConsultation = null;
    }
  }

  save(): void {
    if (!this.selectedPatientId) {
      alert('Veuillez sélectionner un patient');
      return;
    }

    if (!this.paiement.consultation_id) {
      alert('Veuillez sélectionner une consultation');
      return;
    }

    // S'assurer que moyen_paiement est défini
    if (!this.paiement.moyen_paiement) {
      this.paiement.moyen_paiement = 'espece';
    }

    console.log('Données du paiement à envoyer:', this.paiement);

    this.paiementService.create(this.paiement).subscribe({
      next: () => {
        console.log('Paiement créé avec succès');
        alert('Paiement enregistré avec succès !');
        this.router.navigate(['/paiements']);
      },
      error: (err) => {
        console.error('Erreur lors de la création du paiement', err);
        alert('Erreur lors de la création du paiement. Veuillez réessayer.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/paiements']);
  }
}
