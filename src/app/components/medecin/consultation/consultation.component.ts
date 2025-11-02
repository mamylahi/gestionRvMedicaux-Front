// consultation.component.ts
import {Component, OnInit} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {Router} from '@angular/router';
import {Consultation} from '../../../models/consultation.model';
import {MedecinService} from '../../../services/medecin.service';
import {StatutPaiement} from '../../../models/enum';

// Déclaration pour SweetAlert2
declare var Swal: any;

@Component({
  selector: 'app-medecin-consultation',
  templateUrl: './consultation.component.html',
  standalone: true,
  imports: [CommonModule, DatePipe]
})
export class MedecinConsultationComponent implements OnInit {
  consultations: Consultation[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private medecinService: MedecinService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadMesConsultations();
  }

  /**
   * Charger toutes les consultations du médecin
   */
  loadMesConsultations(): void {
    this.loading = true;
    this.errorMessage = '';

    this.medecinService.getMesConsultations().subscribe({
      next: (data: Consultation[]) => {
        this.consultations = data;
        this.loading = false;

        if (typeof Swal !== 'undefined' && data.length > 0) {
          Swal.fire({
            title: 'Succès !',
            text: `${data.length} consultation(s) chargée(s)`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            customClass: {
              popup: 'rounded-2xl'
            }
          });
        }
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des consultations';
        this.loading = false;
        console.error('Erreur:', error);

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Erreur',
            text: 'Impossible de charger les consultations',
            icon: 'error',
            confirmButtonColor: '#3B82F6',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-xl px-6 py-3 font-semibold'
            }
          });
        }
      }
    });
  }

  /**
   * Obtenir le nombre de consultations ce mois
   */
  getConsultationsCeMois(): number {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return this.consultations.filter(c => {
      const consultationDate = new Date(c.date_consultation);
      return consultationDate.getMonth() === currentMonth &&
        consultationDate.getFullYear() === currentYear;
    }).length;
  }

  /**
   * Obtenir le nombre de paiements en attente
   */
  getPaiementsEnAttente(): number {
    return this.consultations.filter(c =>
      c.paiement?.statut !== StatutPaiement.EN_ATTENTE
    ).length;
  }

  /**
   * Obtenir le nombre de patients uniques
   */
  getPatientsUniques(): number {
    const patientIds = new Set(
      this.consultations
        .filter(c => c.rendezvous?.patient_id)
        .map(c => c.rendezvous?.patient_id)
    );
    return patientIds.size;
  }

  /**
   * Voir les détails d'une consultation
   */
  voirDetails(consultationId: number): void {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Détails de la consultation',
        text: `Affichage des détails de la consultation #${consultationId}`,
        icon: 'info',
        confirmButtonColor: '#3B82F6',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl px-6 py-3 font-semibold'
        }
      });
    }

    // Navigation vers la page de détails
    // this.router.navigate(['/medecin/consultations', consultationId]);
  }


  /**
   * Obtenir le texte du statut de paiement
   */
  getStatutPaiementText(consultation: Consultation): string {
    return consultation.paiement?.statut === StatutPaiement.VALIDE ? 'Payé' : 'En attente';
  }

  /**
   * Obtenir le nom complet du patient
   */
  getPatientName(consultation: Consultation): string {
    const patient = consultation.rendezvous?.patient;
    if (patient?.user) {
      return `${patient.user.prenom} ${patient.user.nom}`;
    }
    return 'Patient inconnu';
  }

  /**
   * Formater une date
   */
  formatDate(date: any, format: string = 'dd/MM/yyyy'): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('fr-FR');
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  }

  /**
   * Exporter les consultations
   */
  exportConsultations(): void {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Export des consultations',
        text: 'Fonctionnalité d\'export en cours de développement',
        icon: 'info',
        confirmButtonColor: '#3B82F6',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl px-6 py-3 font-semibold'
        }
      });
    }
  }

  /**
   * Filtrer les consultations par période
   */
  filterByPeriod(period: 'week' | 'month' | 'year'): void {
    // Implémentation du filtre par période
    console.log(`Filtrer par: ${period}`);
  }

  protected readonly StatutPaiement = StatutPaiement;
}
