import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RendezVous } from '../../../models/rendezvous.model';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { PatientService } from '../../../services/patient.service';
import { MedecinService } from '../../../services/medecin.service';
import { Patient } from '../../../models/patient.model';
import { Medecin } from '../../../models/medecin.model';
declare var Swal: any;

@Component({
  selector: 'app-rendezvous',
  standalone: true,
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
        console.log('Rendez-vous chargés:', this.rendezvous);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des rendez-vous:', error);
        Swal.fire({
          title: 'Erreur !',
          text: 'Erreur lors du chargement des rendez-vous',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'px-6 py-3 rounded-xl font-semibold'
          }
        });
        this.isLoading = false;
      }
    });
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

  loadMedecins() {
    this.medecinService.getAll().subscribe({
      next: (data: any) => {
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

    // Convertir les IDs pour les selects
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
      Swal.fire({
        title: 'Mise à jour',
        text: 'Voulez-vous enregistrer les modifications ?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Oui, mettre à jour',
        cancelButtonText: 'Annuler',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'px-6 py-3 rounded-xl font-semibold',
          cancelButton: 'px-6 py-3 rounded-xl font-semibold'
        }
      }).then((result: { isConfirmed: any; }) => {
        if (result.isConfirmed) {
          this.rendezvousService.update(this.selectedRdv.id, this.selectedRdv).subscribe({
            next: () => {
              Swal.fire({
                title: 'Mis à jour !',
                text: 'Le rendez-vous a été mis à jour avec succès',
                icon: 'success',
                confirmButtonColor: '#3b82f6',
                confirmButtonText: 'OK',
                timer: 3000,
                customClass: {
                  popup: 'rounded-2xl',
                  confirmButton: 'px-6 py-3 rounded-xl font-semibold'
                }
              });
              this.getAllRendezVous();
              this.closeModal();
            },
            error: (error: any) => {
              Swal.fire({
                title: 'Erreur !',
                text: 'Erreur lors de la mise à jour du rendez-vous',
                icon: 'error',
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'OK',
                customClass: {
                  popup: 'rounded-2xl',
                  confirmButton: 'px-6 py-3 rounded-xl font-semibold'
                }
              });
              console.error('Erreur lors de la mise à jour:', error);
            }
          });
        }
      });
    } else {
      this.rendezvousService.create(this.selectedRdv).subscribe({
        next: () => {
          Swal.fire({
            title: 'Créé !',
            text: 'Le rendez-vous a été créé avec succès',
            icon: 'success',
            confirmButtonColor: '#3b82f6',
            confirmButtonText: 'OK',
            timer: 3000,
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'px-6 py-3 rounded-xl font-semibold'
            }
          });
          this.getAllRendezVous();
          this.closeModal();
        },
        error: (error: any) => {
          Swal.fire({
            title: 'Erreur !',
            text: 'Erreur lors de la création du rendez-vous',
            icon: 'error',
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'px-6 py-3 rounded-xl font-semibold'
            }
          });
          console.error('Erreur lors de la création:', error);
        }
      });
    }
  }

  deleteRendezVous(id: number) {
    Swal.fire({
      title: 'Supprimer le rendez-vous ?',
      html: `
        <p class="text-gray-600 mb-4">Cette action est irréversible.</p>
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p class="text-red-800 text-sm">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            Le rendez-vous sera définitivement supprimé.
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '<i class="fas fa-trash mr-2"></i> Oui, supprimer',
      cancelButtonText: 'Annuler',
      background: '#fff',
      backdrop: 'rgba(0,0,0,0.4)',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-6 py-3 rounded-xl font-semibold',
        cancelButton: 'px-6 py-3 rounded-xl font-semibold',
        htmlContainer: 'text-left'
      }
    }).then((result: { isConfirmed: any; }) => {
      if (result.isConfirmed) {
        this.rendezvousService.delete(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Supprimé !',
              text: 'Le rendez-vous a été supprimé avec succès',
              icon: 'success',
              confirmButtonColor: '#3b82f6',
              confirmButtonText: 'OK',
              timer: 3000,
              customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'px-6 py-3 rounded-xl font-semibold'
              }
            });
            this.getAllRendezVous();
          },
          error: (error: any) => {
            Swal.fire({
              title: 'Erreur !',
              text: 'Erreur lors de la suppression du rendez-vous',
              icon: 'error',
              confirmButtonColor: '#ef4444',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'px-6 py-3 rounded-xl font-semibold'
              }
            });
            console.error('Erreur lors de la suppression:', error);
          }
        });
      }
    });
  }

  // Méthodes utilitaires
  getPatientLabel(patient: Patient): string {
    if (patient.user) {
      return `${patient.user.nom} ${patient.user.prenom} (${patient.numero_patient || 'N/A'})`;
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

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Méthodes pour récupérer les infos
  getPatientById(id: number): Patient | undefined {
    return this.patients.find(p => p.id === id);
  }

  getMedecinById(id: number): Medecin | undefined {
    return this.medecins.find(m => m.id === id);
  }

  getPatientName(id: number): string {
    const patient = this.getPatientById(id);
    if (patient?.user) {
      return `${patient.user.nom} ${patient.user.prenom}`;
    }
    return 'N/A';
  }

  getMedecinName(id: number): string {
    const medecin = this.getMedecinById(id);
    if (medecin?.user) {
      return `Dr. ${medecin.user.nom} ${medecin.user.prenom}`;
    }
    return 'N/A';
  }

  getPatientNumero(id: number): string {
    const patient = this.getPatientById(id);
    return patient?.numero_patient || 'N/A';
  }

  getMedecinSpecialite(id: number): string {
    const medecin = this.getMedecinById(id);
    return medecin?.specialite?.nom || 'Généraliste';
  }

  getInitials(entity: Patient | Medecin | undefined): string {
    if (!entity?.user) return '??';
    const prenom = entity.user.prenom || '';
    const nom = entity.user.nom || '';
    return (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
  }
}
