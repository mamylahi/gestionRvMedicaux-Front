import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from '../../../services/patient.service';
import { AuthService } from '../../../services/auth.service';
import { PaiementService } from '../../../services/paiement.service';
import { Paiement } from '../../../models/paiement.model';
import { StatutPaiement } from '../../../models/enum';
declare var Swal: any;

@Component({
  selector: 'app-mes-paiements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paiement.component.html',
})
export class PatientPaiementsComponent implements OnInit {
  paiements: Paiement[] = [];
  filteredPaiements: Paiement[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  totalMontant: number = 0;

  constructor(
    private patientService: PatientService,
    private authService: AuthService,
    private paiementService: PaiementService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMesPaiements();
  }

  loadMesPaiements(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.patientService.getMesPaiements().subscribe({
      next: (data) => {
        console.log('Mes paiements chargés:', data);
        this.paiements = data;
        this.filteredPaiements = data;
        this.calculateTotal();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur détaillée:', error);
        this.errorMessage = 'Erreur lors du chargement de vos paiements';
        this.isLoading = false;
        this.paiements = [];
        this.filteredPaiements = [];
      }
    });
  }

  calculateTotal(): void {
    this.totalMontant = this.filteredPaiements
      .filter(p => p.statut?.toLowerCase() === 'paye')
      .reduce((sum, p) => sum + (p.montant || 0), 0);
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPaiements = this.paiements;
      this.calculateTotal();
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredPaiements = this.paiements.filter(p =>
      p.moyen_paiement?.toLowerCase().includes(term) ||
      p.statut?.toLowerCase().includes(term) ||
      p.montant?.toString().includes(term)
    );
    this.calculateTotal();
  }

  onResetFilters(): void {
    this.searchTerm = '';
    this.filteredPaiements = this.paiements;
    this.calculateTotal();
  }

  onPayer(id: number): void {
    Swal.fire({
      title: 'Confirmer le paiement',
      html: `
        <p class="text-gray-600 mb-4">Voulez-vous marquer ce paiement comme payé ?</p>
        <div class="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
          <p class="text-green-800 text-sm">
            <i class="fas fa-check-circle mr-2"></i>
            Le statut sera mis à jour automatiquement.
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '<i class="fas fa-check mr-2"></i> Oui, payer',
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
        this.isLoading = true;

        // Mettre à jour le statut à PAYE - conversion de l'ID en string
        this.paiementService.updateStatut(id.toString(), StatutPaiement.VALIDE).subscribe({
          next: () => {
            Swal.fire({
              title: 'Payé !',
              text: 'Le paiement a été marqué comme payé avec succès',
              icon: 'success',
              confirmButtonColor: '#3b82f6',
              confirmButtonText: 'OK',
              timer: 3000,
              customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'px-6 py-3 rounded-xl font-semibold'
              }
            });
            this.isLoading = false;
            this.loadMesPaiements();
          },
          error: (error: any) => {
            Swal.fire({
              title: 'Erreur !',
              text: 'Erreur lors de la mise à jour du paiement',
              icon: 'error',
              confirmButtonColor: '#ef4444',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'px-6 py-3 rounded-xl font-semibold'
              }
            });
            this.isLoading = false;
            console.error('Erreur:', error);
          }
        });
      }
    });
  }

  getStatutClass(statut: string): string {
    switch (statut?.toLowerCase()) {
      case 'paye':
        return 'bg-green-100 text-green-800';
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'echoue':
        return 'bg-red-100 text-red-800';
      case 'rembourse':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatStatut(statut: string): string {
    switch (statut?.toLowerCase()) {
      case 'paye':
        return 'Payé';
      case 'en_attente':
        return 'En attente';
      case 'echoue':
        return 'Échoué';
      case 'rembourse':
        return 'Remboursé';
      default:
        return statut?.replace('_', ' ').toUpperCase() || 'NON DÉFINI';
    }
  }

  formatMoyenPaiement(moyen: string): string {
    switch (moyen?.toLowerCase()) {
      case 'carte_bancaire':
        return 'Carte Bancaire';
      case 'especes':
        return 'Espèces';
      case 'virement':
        return 'Virement';
      case 'cheque':
        return 'Chèque';
      case 'mobile_money':
        return 'Mobile Money';
      default:
        return moyen?.replace('_', ' ').toUpperCase() || 'NON DÉFINI';
    }
  }

  getPaiementsParStatut(statut: string): number {
    return this.paiements.filter(p => p.statut?.toLowerCase() === statut).length;
  }
}
