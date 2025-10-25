import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {RendezVous} from '../../../models/rendezvous.model';
import {PatientService} from '../../../services/patient.service';
import {AuthService} from '../../../services/auth.service';

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

  constructor(
    private patientService: PatientService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMesRendezVous();
  }

  loadMesRendezVous(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.patientService.getMesRendezVous().subscribe({
      next: (data:any) => {
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

  getStatutClass(statut: string): string {
    switch (statut?.toLowerCase()) {
      case 'confirme':
        return 'bg-green-100 text-green-800';
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'annule':
        return 'bg-red-100 text-red-800';
      case 'termine':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatStatut(statut: string): string {
    return statut?.replace('_', ' ').toUpperCase() || 'NON DÉFINI';
  }
}
