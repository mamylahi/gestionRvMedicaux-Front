import { Component, OnInit } from '@angular/core';
import { MedecinService } from '../../../services/medecin.service';
import { Patient } from '../../../models/patient.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  imports: [
    CommonModule,
  ]
})
export class MedecinPatientComponent implements OnInit {
  patients: Patient[] = [];
  loading = false;
  errorMessage = '';

  constructor(private medecinService: MedecinService) { }

  ngOnInit(): void {
    this.loadMesPatients();
  }

  loadMesPatients(): void {
    this.loading = true;
    this.errorMessage = '';

    this.medecinService.getMesPatients().subscribe({
      next: (data: Patient[]) => {
        this.patients = data;
        this.loading = false;
        console.log(this.patients);
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des patients';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  getInitials(prenom: string | undefined, nom: string | undefined): string {
    if (!prenom || !nom) return '??';
    return (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
  }

  calculerAge(dateNaissance: Date): number {
    if (!dateNaissance) return 0;
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  voirDossierMedical(patientId: number): void {
    console.log('Voir dossier médical du patient:', patientId);
  }

  prendreRendezVous(patientId: number): void {
    console.log('Prendre rendez-vous pour le patient:', patientId);
  }
}
