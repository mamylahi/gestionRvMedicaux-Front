import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from '../../../services/patient.service';
import { AuthService } from '../../../services/auth.service';
import { DossierMedical } from '../../../models/dossiermedical.model';

@Component({
  selector: 'app-mon-dossier-medical',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dossier-medical.component.html',
})
export class PatientDossierMedicalComponent implements OnInit {
  dossierMedical: DossierMedical | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private patientService: PatientService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMonDossierMedical();
  }

  loadMonDossierMedical(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.patientService.getMonDossierMedical().subscribe({
      next: (data) => {
        console.log('Mon dossier médical chargé:', data);
        // L'API retourne un tableau, on prend le premier élément
        if (data && data.length > 0) {
          this.dossierMedical = data;
          console.log(data);
        } else {
          this.errorMessage = 'Aucun dossier médical trouvé';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur détaillée:', error);
        this.errorMessage = 'Erreur lors du chargement de votre dossier médical';
        this.isLoading = false;
        this.dossierMedical = null;
      }
    });
  }

  formatGroupeSanguin(groupe: string | undefined): string {
    if (!groupe) return 'Non renseigné';
    return groupe;
  }

  onEdit(): void {
    if (this.dossierMedical) {
      this.router.navigate(['/dossier-medical/modifier', this.dossierMedical.id]);
    }
  }
}
