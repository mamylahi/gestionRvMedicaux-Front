import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConsultationService } from '../../../../../../../../../OneDrive/Desktop/gestionRvMedicaux-Front/gestionRvMedicaux-Front/gestionRvMedicaux-Front/src/app/services/consultation.service';
import { Consultation } from '../../../../../../../../../OneDrive/Desktop/gestionRvMedicaux-Front/gestionRvMedicaux-Front/gestionRvMedicaux-Front/src/app/models/consultation.model';

@Component({
  selector: 'app-consultation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultation.component.html',
})
export class ConsultationComponent implements OnInit {
  consultations: Consultation[] = [];
  filteredConsultations: Consultation[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private consultationService: ConsultationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadConsultations();
  }

  loadConsultations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.consultationService.getAll().subscribe({
      next: (data) => {
        this.consultations = data;
        this.filteredConsultations = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des consultations';
        this.isLoading = false;
        console.error('Erreur:', error);
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
      c.id.toString().includes(term) ||
      c.rendezvous_id.toString().includes(term) ||
      new Date(c.date_consultation).toLocaleDateString().includes(term)
    );
  }

  onAdd(): void {
    this.router.navigate(['/consultations/nouveau']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/consultations/modifier', id]);
  }

  onDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette consultation ?')) {
      this.consultationService.delete(id).subscribe({
        next: () => {
          this.loadConsultations();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression';
          console.error('Erreur:', error);
        }
      });
    }
  }

  onView(id: number): void {
    this.router.navigate(['/consultations/details', id]);
  }
}




