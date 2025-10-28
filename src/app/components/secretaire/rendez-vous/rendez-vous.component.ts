import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RendezVous } from '../../../models/rendezvous.model';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { PatientService } from '../../../services/patient.service';
import { MedecinService } from '../../../services/medecin.service';
import { Patient } from '../../../models/patient.model';
import { Medecin } from '../../../models/medecin.model';

@Component({
  selector: 'app-rendezvous',
  templateUrl: './rendez-vous.component.html',
  imports: [CommonModule, FormsModule]
})
export class RendezvousComponent implements OnInit {
  rendezvous: RendezVous[] = [];
  showModal = false;
  editing = false;
  selectedRdv: RendezVous = new RendezVous();

  patients: Patient[] = [];
  medecins: Medecin[] = [];
  isLoading = false;

  constructor(
    private rendezvousService: RendezVousService,
    private patientService: PatientService,
    private medecinService: MedecinService
  ) {}

  ngOnInit() {
    this.getAllRendezVous();
    this.loadPatients();
    this.loadMedecins();
  }

  getAllRendezVous() {
    this.isLoading = true;
    this.rendezvousService.getAll().subscribe({
      next: (data: RendezVous[]) => {
        this.rendezvous = data;
        console.log(this.rendezvous);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des rendez-vous:', error);
        this.isLoading = false;
      }
    });
  }

  loadPatients() {
    this.patientService.getAll().subscribe({
      next: (data: any) => {
        // Adaptez selon la structure de votre API
        this.patients = data.data || data || [];
        console.log('Patients chargés:', this.patients);
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des patients:', error);
      }
    });
  }

  loadMedecins() {
    this.medecinService.getAll().subscribe({
      next: (data: any) => {
        // Adaptez selon la structure de votre API
        this.medecins = data.data || data || [];
        console.log('Médecins chargés:', this.medecins);
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des médecins:', error);
      }
    });
  }

  openAddModal() {
    this.editing = false;
    this.selectedRdv = new RendezVous();
    this.selectedRdv.statut = 'en_attente';
    this.selectedRdv.date_rendezvous = new Date();
    this.showModal = true;
  }

  openEditModal(rdv: RendezVous) {
    this.editing = true;
    this.selectedRdv = { ...rdv };

    // Convertir les IDs en string pour les selects
    if (this.selectedRdv.patient_id) {
      this.selectedRdv.patient_id = this.selectedRdv.patient_id as any;
    }
    if (this.selectedRdv.medecin_id) {
      this.selectedRdv.medecin_id = this.selectedRdv.medecin_id as any;
    }

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveRendezVous() {
    if (this.editing) {
      this.rendezvousService.update(this.selectedRdv.id, this.selectedRdv).subscribe({
        next: () => {
          this.getAllRendezVous();
          this.closeModal();
        },
        error: (error: any) => {
          console.error('Erreur lors de la mise à jour:', error);
          alert('Erreur lors de la mise à jour du rendez-vous');
        }
      });
    } else {
      this.rendezvousService.create(this.selectedRdv).subscribe({
        next: () => {
          this.getAllRendezVous();
          this.closeModal();
        },
        error: (error: any) => {
          console.error('Erreur lors de la création:', error);
          alert('Erreur lors de la création du rendez-vous');
        }
      });
    }
  }

  deleteRendezVous(id: number) {
    if (confirm('Voulez-vous vraiment supprimer ce rendez-vous ?')) {
      this.rendezvousService.delete(id).subscribe({
        next: () => {
          this.getAllRendezVous();
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression du rendez-vous');
        }
      });
    }
  }

  // Méthodes utilitaires pour les labels
  getPatientLabel(patient: Patient): string {
    if (patient.user) {
      return `${patient.user.nom} ${patient.user.prenom} (${patient.numero_patient})`;
    }
    return `Patient #${patient.id}`;
  }

  getMedecinLabel(medecin: Medecin): string {
    if (medecin.user) {
      const specialite = medecin.specialite?.nom || 'Généraliste';
      return `Dr. ${medecin.user.nom} ${medecin.user.prenom} - ${specialite}`;
    }
    return `Médecin #${medecin.id}`;
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'en_attente': 'En attente',
      'confirme': 'Confirmé',
      'annule': 'Annulé',
      'termine': 'Terminé'
    };
    return labels[statut] || statut;
  }

  // Méthode pour formater la date pour l'input date
  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Méthode pour formater l'heure pour l'input time
  getCurrentTime(): string {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }
}
