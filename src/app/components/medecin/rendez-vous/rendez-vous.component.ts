import { Component, OnInit } from '@angular/core';
import { RendezVous } from '../../../models/rendezvous.model';
import { MedecinService } from '../../../services/medecin.service';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { RendezVousStatut } from '../../../models/enum';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
declare var Swal: any;

@Component({
  selector: 'app-rendez-vous',
  templateUrl: './rendez-vous.component.html',
  imports: [
    DatePipe,
    NgIf,
    NgForOf,
    CommonModule
  ],
  standalone: true
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
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des rendez-vous';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  // Méthodes pour les statistiques
  get totalRendezVous(): number {
    return this.rendezVous.length;
  }

  get rendezVousEnAttente(): number {
    return this.rendezVous.filter(rdv => rdv.statut === RendezVousStatut.EN_ATTENTE).length;
  }

  get rendezVousConfirmes(): number {
    return this.rendezVous.filter(rdv => rdv.statut === RendezVousStatut.CONFIRME).length;
  }

  get rendezVousTermines(): number {
    return this.rendezVous.filter(rdv => rdv.statut === RendezVousStatut.TERMINE).length;
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

  getInitials(prenom: string | undefined, nom: string | undefined): string {
    if (!prenom || !nom) return '??';
    return (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
  }

  confirmerRendezVous(rendezVousId: number): void {
    Swal.fire({
      title: 'Confirmer le rendez-vous',
      text: 'Voulez-vous confirmer ce rendez-vous ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, confirmer',
      cancelButtonText: 'Annuler',
      background: '#fff',
      backdrop: 'rgba(0,0,0,0.4)',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-6 py-3 rounded-xl font-semibold',
        cancelButton: 'px-6 py-3 rounded-xl font-semibold'
      }
    }).then((result: { isConfirmed: any; }) => {
      if (result.isConfirmed) {
        this.processingAction = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.rendezVousService.updateStatut(rendezVousId, RendezVousStatut.CONFIRME).subscribe({
          next: () => {
            Swal.fire({
              title: 'Confirmé !',
              text: 'Le rendez-vous a été confirmé avec succès',
              icon: 'success',
              confirmButtonColor: '#3b82f6',
              confirmButtonText: 'OK',
              timer: 3000,
              customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'px-6 py-3 rounded-xl font-semibold'
              }
            });
            this.processingAction = false;
            this.loadMesRendezVous();
          },
          error: (error: any) => {
            Swal.fire({
              title: 'Erreur !',
              text: 'Erreur lors de la confirmation du rendez-vous',
              icon: 'error',
              confirmButtonColor: '#ef4444',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'px-6 py-3 rounded-xl font-semibold'
              }
            });
            this.processingAction = false;
            console.error('Erreur:', error);
          }
        });
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
        Swal.fire({
          title: 'Annulé !',
          text: 'Le rendez-vous a été annulé avec succès',
          icon: 'success',
          confirmButtonColor: '#3b82f6',
          confirmButtonText: 'OK',
          timer: 3000,
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'px-6 py-3 rounded-xl font-semibold'
          }
        });
        this.processingAction = false;
        this.closeCancelModal();
        this.loadMesRendezVous();
      },
      error: (error: any) => {
        Swal.fire({
          title: 'Erreur !',
          text: 'Erreur lors de l\'annulation du rendez-vous',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'px-6 py-3 rounded-xl font-semibold'
          }
        });
        this.processingAction = false;
        this.closeCancelModal();
        console.error('Erreur:', error);
      }
    });
  }

  // Supprimer définitivement un rendez-vous (pour les rendez-vous annulés)
  supprimerRendezVous(rendezVousId: number): void {
    Swal.fire({
      title: 'Supprimer le rendez-vous ?',
      html: `
        <p class="text-gray-600 mb-4">Cette action est irréversible.</p>
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p class="text-red-800 text-sm">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            Le rendez-vous sera définitivement supprimé de la base de données.
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
        this.processingAction = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.rendezVousService.delete(rendezVousId).subscribe({
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
            this.processingAction = false;
            this.loadMesRendezVous();
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
            this.processingAction = false;
            console.error('Erreur:', error);
          }
        });
      }
    });
  }

  protected readonly RendezVousStatut = RendezVousStatut;
}
