import { Component, OnInit } from '@angular/core';
import { RendezVous } from '../../../models/rendezvous.model';
import { MedecinService } from '../../../services/medecin.service';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { RendezVousStatut } from '../../../models/enum';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rendez-vous',
  templateUrl: './rendez-vous.component.html',
  imports: [
    DatePipe,
    NgIf,
    NgForOf,
    CommonModule
  ],
})
export class MedecinRendezVousComponent implements OnInit {
  rendezVous: RendezVous[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Variables pour le modal de confirmation
  showConfirmModal = false;
  rendezVousToCancel: number | null = null;
  processingAction = false;

  constructor(
    private medecinService: MedecinService,
    private rendezVousService: RendezVousService
  ) { }

  ngOnInit(): void {
    this.loadMesRendezVous();
  }

  loadMesRendezVous(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.medecinService.getMesRendezVous().subscribe({
      next: (data: RendezVous[]) => {
        this.rendezVous = data;
        console.log('Rendez-vous chargés:', this.rendezVous);
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des rendez-vous';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  getStatutClass(statut: RendezVousStatut): string {
    switch(statut) {
      case RendezVousStatut.CONFIRME: return 'statut-confirme';
      case RendezVousStatut.EN_ATTENTE: return 'statut-attente';
      case RendezVousStatut.ANNULE: return 'statut-annule';
      case RendezVousStatut.TERMINE: return 'statut-termine';
      default: return 'statut-default';
    }
  }

    getStatutText(statut: string): string {
    switch(statut) {
      case RendezVousStatut.CONFIRME: return 'Confirmé';
      case RendezVousStatut.EN_ATTENTE: return 'En attente';
      case RendezVousStatut.ANNULE: return 'Annulé';
      case RendezVousStatut.TERMINE: return 'Terminé';
      default: return statut;
    }
  }

  confirmerRendezVous(rendezVousId: number): void {
    this.processingAction = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.rendezVousService.updateStatut(rendezVousId, RendezVousStatut.CONFIRME).subscribe({
      next: () => {
        this.successMessage = 'Rendez-vous confirmé avec succès';
        this.processingAction = false;
        // Recharger la liste
        this.loadMesRendezVous();
        // Masquer le message après 3 secondes
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors de la confirmation du rendez-vous';
        this.processingAction = false;
        console.error('Erreur:', error);
      }
    });
  }

  // Ouvrir le modal de confirmation d'annulation
  openCancelModal(rendezVousId: number): void {
    this.rendezVousToCancel = rendezVousId;
    this.showConfirmModal = true;
  }

  // Fermer le modal de confirmation
  closeCancelModal(): void {
    this.showConfirmModal = false;
    this.rendezVousToCancel = null;
  }

  // Annuler le rendez-vous
  annulerRendezVous(rendezVousId: number): void {
    this.openCancelModal(rendezVousId);
  }

  // Confirmer l'annulation
  confirmCancellation(): void {
    if (this.rendezVousToCancel === null) return;

    this.processingAction = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.rendezVousService.updateStatut(this.rendezVousToCancel, RendezVousStatut.ANNULE).subscribe({
      next: () => {
        this.successMessage = 'Rendez-vous annulé avec succès';
        this.processingAction = false;
        this.closeCancelModal();
        // Recharger la liste
        this.loadMesRendezVous();
        // Masquer le message après 3 secondes
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors de l\'annulation du rendez-vous';
        this.processingAction = false;
        this.closeCancelModal();
        console.error('Erreur:', error);
      }
    });
  }

  protected readonly RendezVousStatut = RendezVousStatut;
}
