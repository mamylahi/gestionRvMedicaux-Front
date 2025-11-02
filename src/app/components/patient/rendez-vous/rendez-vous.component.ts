import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RendezVous } from '../../../models/rendezvous.model';
import { PatientService } from '../../../services/patient.service';
import { AuthService } from '../../../services/auth.service';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { RendezVousStatut } from '../../../models/enum';
declare var Swal: any;

@Component({
  selector: 'app-mes-rendezvous',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rendez-vous.component.html',
})
export class PatientRendezVousComponent implements OnInit {
  rendezvous: RendezVous[] = [];
  filteredRendezVous: RendezVous[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Pour la compatibilité avec le template
  get loading(): boolean {
    return this.isLoading;
  }

  get rendezVous(): RendezVous[] {
    return this.filteredRendezVous;
  }

  // Variables pour les actions
  processingAction: boolean = false;

  constructor(
    private patientService: PatientService,
    private authService: AuthService,
    private rendezVousService: RendezVousService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMesRendezVous();
  }

  loadMesRendezVous(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.patientService.getMesRendezVous().subscribe({
      next: (data: any) => {
        console.log('Mes rendez-vous chargés:', data);
        this.rendezvous = data;
        this.filteredRendezVous = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur détaillée:', error);
        this.errorMessage = 'Erreur lors du chargement de vos rendez-vous';
        this.isLoading = false;
        this.rendezvous = [];
        this.filteredRendezVous = [];
      }
    });
  }

  // Méthodes pour les statistiques
  get rendezVousEnAttente(): number {
    return this.rendezvous.filter(rdv =>
      rdv.statut === RendezVousStatut.EN_ATTENTE || rdv.statut?.toLowerCase() === 'en_attente'
    ).length;
  }

  get rendezVousConfirmes(): number {
    return this.rendezvous.filter(rdv =>
      rdv.statut === RendezVousStatut.CONFIRME || rdv.statut?.toLowerCase() === 'confirme'
    ).length;
  }

  get rendezVousTermines(): number {
    return this.rendezvous.filter(rdv =>
      rdv.statut === RendezVousStatut.TERMINE || rdv.statut?.toLowerCase() === 'termine'
    ).length;
  }

  get rendezVousAnnules(): number {
    return this.rendezvous.filter(rdv =>
      rdv.statut === RendezVousStatut.ANNULE || rdv.statut?.toLowerCase() === 'annule'
    ).length;
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRendezVous = this.rendezvous;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredRendezVous = this.rendezvous.filter(rdv =>
      rdv.medecin?.user?.nom?.toLowerCase().includes(term) ||
      rdv.medecin?.user?.prenom?.toLowerCase().includes(term) ||
      rdv.motif?.toLowerCase().includes(term) ||
      rdv.statut?.toLowerCase().includes(term)
    );
  }

  onResetFilters(): void {
    this.searchTerm = '';
    this.filteredRendezVous = this.rendezvous;
  }

  onView(id: number): void {
    this.router.navigate(['/rendezvous/details', id]);
  }

  getStatutClass(statut: string | RendezVousStatut): string {
    const statutLower = statut?.toString().toLowerCase();
    switch (statutLower) {
      case 'confirme':
      case RendezVousStatut.CONFIRME:
        return 'statut-confirme';
      case 'en_attente':
      case RendezVousStatut.EN_ATTENTE:
        return 'statut-attente';
      case 'annule':
      case RendezVousStatut.ANNULE:
        return 'statut-annule';
      case 'termine':
      case RendezVousStatut.TERMINE:
        return 'statut-termine';
      default:
        return 'statut-default';
    }
  }

  getStatutText(statut: string | RendezVousStatut): string {
    const statutLower = statut?.toString().toLowerCase();
    switch (statutLower) {
      case 'confirme':
      case RendezVousStatut.CONFIRME:
        return 'Confirmé';
      case 'en_attente':
      case RendezVousStatut.EN_ATTENTE:
        return 'En attente';
      case 'annule':
      case RendezVousStatut.ANNULE:
        return 'Annulé';
      case 'termine':
      case RendezVousStatut.TERMINE:
        return 'Terminé';
      default:
        return statut?.toString().replace('_', ' ').toUpperCase() || 'NON DÉFINI';
    }
  }

  formatStatut(statut: string): string {
    return this.getStatutText(statut);
  }

  getInitials(prenom: string | undefined, nom: string | undefined): string {
    if (!prenom || !nom) return '??';
    return (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
  }

  // Annuler un rendez-vous avec SweetAlert
  annulerRendezVous(rendezVousId: number): void {
    Swal.fire({
      title: 'Annuler le rendez-vous ?',
      html: `
        <p class="text-gray-600 mb-4">Voulez-vous vraiment annuler ce rendez-vous ?</p>
        <div class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
          <p class="text-amber-800 text-sm">
            <i class="fas fa-info-circle mr-2"></i>
            Le médecin sera automatiquement notifié de cette annulation.
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '<i class="fas fa-ban mr-2"></i> Oui, annuler',
      cancelButtonText: 'Non, garder',
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

        // Appel au service pour annuler en changeant le statut
        this.rendezVousService.updateStatut(rendezVousId, RendezVousStatut.ANNULE).subscribe({
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
            console.error('Erreur:', error);
          }
        });
      }
    });
  }

  // Voir les détails d'un rendez-vous
  voirDetails(rendezVousId: number): void {
    this.router.navigate(['/patient/rendez-vous', rendezVousId]);
  }

  // Accès à l'enum pour le template
  protected readonly RendezVousStatut = RendezVousStatut;
}
