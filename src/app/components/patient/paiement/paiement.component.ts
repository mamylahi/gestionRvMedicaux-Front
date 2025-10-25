import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from '../../../services/patient.service';
import { AuthService } from '../../../services/auth.service';
import { Paiement } from '../../../models/paiement.model';

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
    this.totalMontant = this.filteredPaiements.reduce((sum, p) => sum + (p.montant || 0), 0);
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

  onView(id: number): void {
    this.router.navigate(['/paiements/details', id]);
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
    return statut?.replace('_', ' ').toUpperCase() || 'NON DÉFINI';
  }

  formatMoyenPaiement(moyen: string): string {
    return moyen?.replace('_', ' ').toUpperCase() || 'NON DÉFINI';
  }
}
