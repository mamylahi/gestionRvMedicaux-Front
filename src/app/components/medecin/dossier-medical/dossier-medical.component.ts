import { Component, OnInit } from '@angular/core';
import { DossierMedical } from '../../../models/dossiermedical.model';
import { MedecinService } from '../../../services/medecin.service';
import { GroupeSanguin } from '../../../models/enum';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dossier-medical',
  templateUrl: './dossier-medical.component.html',
  imports: [
    DatePipe,
    CommonModule,
  ]
})
export class MedecinDossierMedicalComponent implements OnInit {
  dossiersMedicaux: DossierMedical[] = [];
  loading = false;
  errorMessage = '';

  constructor(private medecinService: MedecinService) { }

  ngOnInit(): void {
    this.loadDossiersMedicaux();
  }

  loadDossiersMedicaux(): void {
    this.loading = true;
    this.errorMessage = '';

    this.medecinService.getMesDossiersMedicaux().subscribe({
      next: (data: DossierMedical[]) => {
        this.dossiersMedicaux = data;
        this.loading = false;
        console.log(this.dossiersMedicaux);
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des dossiers médicaux';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  getGroupeSanguinText(groupe: GroupeSanguin): string {
    return groupe || 'Non renseigné';
  }

  ouvrirDossier(dossierId: number): void {
    console.log('Ouvrir dossier médical:', dossierId);
  }

  modifierDossier(dossierId: number): void {
    console.log('Modifier dossier médical:', dossierId);
  }
}
