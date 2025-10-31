import { Component, OnInit } from '@angular/core';
import { DossierMedical } from '../../../models/dossiermedical.model';
import { MedecinService } from '../../../services/medecin.service';
import { DossierMedicalService } from '../../../services/dossier-medical.service';
import { GroupeSanguin } from '../../../models/enum';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dossier-medical',
  templateUrl: './dossier-medical.component.html',
  imports: [
    DatePipe,
    CommonModule,
    FormsModule
  ]
})
export class MedecinDossierMedicalComponent implements OnInit {
  dossiersMedicaux: DossierMedical[] = [];
  loading = false;
  errorMessage = '';

  // Modal state
  showModal = false;
  isEditMode = false;
  selectedDossier: DossierMedical | null = null;

  // Form data
  formData: any = {
    groupe_sanguin: '',
    allergies: '',
    antecedents_medicaux: '',
    antecedents_chirurgicaux: '',
    traitements_en_cours: '',
    vaccinations: '',
    notes: ''
  };

  // Available blood groups
  groupesSanguins = [
    'A_PLUS', 'A_MOINS', 'B_PLUS', 'B_MOINS',
    'AB_PLUS', 'AB_MOINS', 'O_PLUS', 'O_MOINS'
  ];

  constructor(
    private medecinService: MedecinService,
    private dossierMedicalService: DossierMedicalService
  ) { }

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
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des dossiers médicaux';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  getGroupeSanguinText(groupe: GroupeSanguin): string {
    if (!groupe) return 'Non renseigné';
    return groupe.replace('_', ' ');
  }

  ouvrirDossier(dossierId: number): void {
    const dossier = this.dossiersMedicaux.find(d => d.id === dossierId);
    if (dossier) {
      this.selectedDossier = dossier;
      this.isEditMode = false;
      this.showModal = true;
    }
  }

  modifierDossier(dossierId: number): void {
    const dossier = this.dossiersMedicaux.find(d => d.id === dossierId);
    if (dossier) {
      this.selectedDossier = dossier;
      this.isEditMode = true;
      this.formData = {
        groupe_sanguin: dossier.groupe_sanguin || '',
        // allergies: dossier.allergies || '',
        // antecedents_medicaux: dossier.antecedents_medicaux || '',
        // antecedents_chirurgicaux: dossier.antecedents_chirurgicaux || '',
        // traitements_en_cours: dossier.traitements_en_cours || '',
        // vaccinations: dossier.vaccinations || '',
        // notes: dossier.notes || ''
      };
      this.showModal = true;

    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedDossier = null;
    this.isEditMode = false;
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      groupe_sanguin: '',
      allergies: '',
      antecedents_medicaux: '',
      antecedents_chirurgicaux: '',
      traitements_en_cours: '',
      vaccinations: '',
      notes: ''
    };
  }

  saveDossier(): void {
    if (!this.selectedDossier) return;

    this.loading = true;
    this.errorMessage = '';

    this.dossierMedicalService.update(this.selectedDossier.id.toString(), this.formData).subscribe({
      next: (data: DossierMedical) => {
        // Update the dossier in the list
        const index = this.dossiersMedicaux.findIndex(d => d.id === data.id);
        if (index !== -1) {
          this.dossiersMedicaux[index] = data;
        }
        this.loading = false;
        this.closeModal();
        alert('Dossier médical mis à jour avec succès');
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors de la mise à jour du dossier médical';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }
}
