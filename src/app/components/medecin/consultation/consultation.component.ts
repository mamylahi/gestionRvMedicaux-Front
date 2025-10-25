import { Component, OnInit } from '@angular/core';
import { Consultation } from '../../../models/consultation.model';
import { MedecinService } from '../../../services/medecin.service';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consultation',
  templateUrl: './consultation.component.html',
  imports: [
    DatePipe,
    CommonModule,
  ]
})
export class MedecinConsultationComponent implements OnInit {
  consultations: Consultation[] = [];
  loading = false;
  errorMessage = '';

  constructor(private medecinService: MedecinService) { }

  ngOnInit(): void {
    this.loadMesConsultations();
  }

  loadMesConsultations(): void {
    this.loading = true;
    this.errorMessage = '';

    this.medecinService.getMesConsultations().subscribe({
      next: (data: Consultation[]) => {
        this.consultations = data;
        this.loading = false;
        console.log(this.consultations);
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des consultations';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  voirDetails(consultationId: number): void {
    console.log('Voir détails de la consultation:', consultationId);
  }

  creerCompteRendu(consultationId: number): void {
    console.log('Créer compte rendu pour la consultation:', consultationId);
  }
}
