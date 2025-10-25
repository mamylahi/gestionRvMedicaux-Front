import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DossierMedical } from '../../../models/dossiermedical.model';
import { Patient } from '../../../models/patient.model';
import { DossierMedicalService } from '../../../services/dossier-medical.service';
import { PatientService } from '../../../services/patient.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import {SecretaireService} from '../../../services/secretaire.service';

@Component({
  selector: 'app-dossier-medical',
  templateUrl: './dossier-medical.component.html',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    CommonModule
  ]
})
export class SecretaireDossierMedicalComponent implements OnInit {
  dossiers: DossierMedical[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(
    private secretaireService: SecretaireService) {}

  ngOnInit(): void {
    this.loadDossiers();
  }

  loadDossiers(): void {
    this.loading = true;
    this.error = '';

    this.secretaireService.getDossiersMedicaux().subscribe({
      next: (data) => {
        this.dossiers = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des dossiers médicaux';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  getGroupeSanguinIcon(groupe: string): string {
    switch (groupe) {
      case 'A_POSITIF': return '🅰️➕';
      case 'A_NEGATIF': return '🅰️➖';
      case 'B_POSITIF': return '🅱️➕';
      case 'B_NEGATIF': return '🅱️➖';
      case 'AB_POSITIF': return '🆎➕';
      case 'AB_NEGATIF': return '🆎➖';
      case 'O_POSITIF': return '🅾️➕';
      case 'O_NEGATIF': return '🅾️➖';
      default: return '🏥';
    }
  }

  getAge(dateNaissance: string): number {
    if (!dateNaissance) return 0;
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  ouvrirDossier(dossier: DossierMedical): void {
    // Implémentez la navigation vers le détail du dossier
    console.log('Ouvrir le dossier:', dossier);
    alert(`Ouverture du dossier médical de ${dossier.patient?.user?.nom} ${dossier.patient?.user?.prenom}`);
  }
}
