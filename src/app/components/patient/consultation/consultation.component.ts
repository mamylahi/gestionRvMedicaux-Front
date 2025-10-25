import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from '../../../services/patient.service';
import { AuthService } from '../../../services/auth.service';
import { Consultation } from '../../../models/consultation.model';

@Component({
  selector: 'app-mes-consultations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultation.component.html',
})
export class PatientConsultationComponent implements OnInit {
  consultations: Consultation[] = [];
  filteredConsultations: Consultation[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private patientService: PatientService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMesConsultations();
  }

  loadMesConsultations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.patientService.getMesConsultations().subscribe({
      next: (data) => {
        console.log('Mes consultations chargées:', data);
        this.consultations = data;
        this.filteredConsultations = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur détaillée:', error);
        this.errorMessage = 'Erreur lors du chargement de vos consultations';
        this.isLoading = false;
        this.consultations = [];
        this.filteredConsultations = [];
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredConsultations = this.consultations;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredConsultations = this.consultations.filter(c =>
      c.rendezvous?.medecin?.user?.nom.toLowerCase().includes(term) ||
      c.rendezvous?.medecin?.user?.prenom?.toLowerCase().includes(term)
    );
  }

  onResetFilters(): void {
    this.searchTerm = '';
    this.filteredConsultations = this.consultations;
  }

  onView(id: number): void {
    this.router.navigate(['/consultations/details', id]);
  }

  truncateText(text: string | undefined, maxLength: number = 50): string {
    if (!text) return 'Non spécifié';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}
