import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Paiement } from '../../../models/paiement.model';
import { StatutPaiement } from '../../../models/enum';
import { PaiementService } from '../../../services/paiement.service';

@Component({
  selector: 'app-paiement',
  templateUrl: './paiement.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class PaiementComponent implements OnInit {
  paiements: Paiement[] = [];
  statutEnum = StatutPaiement;

  // Variables pour les modales
  showModal = false;
  modalTitle = '';
  currentPaiement: Paiement = new Paiement();
  isEditMode = false;

  constructor(private paiementService: PaiementService) {}

  ngOnInit(): void {
    this.loadPaiements();
  }

  loadPaiements(): void {
    this.paiementService.getAll().subscribe({
      next: (data: any) => {
        if (data && data.data) {
          this.paiements = Array.isArray(data.data) ? data.data : [data.data];
        } else if (Array.isArray(data)) {
          this.paiements = data;
        } else {
          this.paiements = [];
        }
        console.log('Paiements chargés:', this.paiements);
      },
      error: (err) => {
        console.error('Erreur de chargement des paiements', err);
        this.paiements = [];
      }
    });
  }

  openAddModal(): void {
    this.modalTitle = 'Ajouter un paiement';
    this.currentPaiement = new Paiement();
    this.isEditMode = false;
    this.showModal = true;
  }

  openEditModal(paiement: Paiement): void {
    this.modalTitle = 'Modifier le paiement';
    this.currentPaiement = { ...paiement };
    this.isEditMode = true;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentPaiement = new Paiement();
  }

  savePaiement(): void {
    if (this.isEditMode) {
      this.paiementService.update(this.currentPaiement.id, this.currentPaiement).subscribe({
        next: () => {
          this.loadPaiements();
          this.closeModal();
        },
        error: (err) => console.error('Erreur de modification', err)
      });
    } else {
      this.paiementService.create(this.currentPaiement).subscribe({
        next: () => {
          this.loadPaiements();
          this.closeModal();
        },
        error: (err) => console.error('Erreur de création', err)
      });
    }
  }

  deletePaiement(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce paiement ?')) {
      this.paiementService.delete(id).subscribe({
        next: () => this.loadPaiements(),
        error: (err) => console.error('Erreur de suppression', err)
      });
    }
  }

  getStatutValues(): string[] {
    return Object.values(this.statutEnum);
  }

  getValidatedCount(): number {
    return this.paiements.filter(p => p.statut === this.statutEnum.VALIDE).length;
  }

  getPendingCount(): number {
    return this.paiements.filter(p => p.statut === this.statutEnum.EN_ATTENTE).length;
  }

  /**
   * Obtenir le nom du patient - Gère les 2 cas:
   * 1. Consultation avec rendez-vous: consultation.rendezvous.patient.user
   * 2. Consultation spontanée: consultation.patient.user (accès via (consultation as any))
   */
  getPatientName(paiement: Paiement): string {
    try {
      const consultation = paiement?.consultation;

      if (!consultation) {
        return 'Consultation non disponible';
      }

      // CAS 1: Consultation avec rendez-vous
      const userFromRdv = consultation.rendezvous?.patient?.user;
      if (userFromRdv?.nom && userFromRdv?.prenom) {
        return `${userFromRdv.nom} ${userFromRdv.prenom}`;
      }

      // CAS 2: Consultation spontanée (sans rendez-vous)
      // Accès dynamique car patient n'est pas dans le type Consultation
      const consultationAny = consultation as any;
      const userFromPatient = consultationAny.patient?.user;
      if (userFromPatient?.nom && userFromPatient?.prenom) {
        return `${userFromPatient.nom} ${userFromPatient.prenom}`;
      }

      return 'Patient non disponible';
    } catch (error) {
      console.error('Erreur lors de la récupération du nom du patient:', error);
      return 'Erreur patient';
    }
  }

  /**
   * Obtenir le type de consultation
   */
  getConsultationType(paiement: Paiement): string {
    const consultation = paiement?.consultation;

    if (!consultation) {
      return 'N/A';
    }

    // Si rendezvous existe, c'est avec RDV
    if (consultation.rendezvous) {
      return 'Avec RDV';
    }

    // Sinon vérifier si patient existe (consultation spontanée)
    const consultationAny = consultation as any;
    if (consultationAny.patient) {
      return 'Spontanée';
    }

    return 'N/A';
  }

  /**
   * Obtenir une icône selon le type de consultation
   */
  getConsultationIcon(paiement: Paiement): string {
    const type = this.getConsultationType(paiement);
    return type === 'Avec RDV' ? '📅' : type === 'Spontanée' ? '⚡' : '❓';
  }

  getConsultationDisplay(paiement: Paiement): string {
    if (paiement?.consultation?.id) {
      return `#${paiement.consultation.id}`;
    }
    return `#${paiement?.consultation_id || 'N/A'}`;
  }

  hasRendezVous(paiement: Paiement): boolean {
    return !!paiement?.consultation?.rendezvous;
  }

  isSpontaneous(paiement: Paiement): boolean {
    const consultation = paiement?.consultation;
    if (!consultation) return false;

    const hasRdv = !!consultation.rendezvous;
    const hasPatient = !!(consultation as any).patient;

    return hasPatient && !hasRdv;
  }
}
