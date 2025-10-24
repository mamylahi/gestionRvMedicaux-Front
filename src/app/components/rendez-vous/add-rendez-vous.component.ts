import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import {Patient} from '../../models/patient.model';
import {Medecin} from '../../models/medecin.model';
import {RendezVousStatut} from '../../models/enum';
import {RendezVousService} from '../../services/rendez-vous.service';
import {PatientService} from '../../services/patient.service';
import {MedecinService} from '../../services/medecin.service';
import {CommonModule, DatePipe} from '@angular/common';


@Component({
  selector: 'app-add-rendez-vous',
  templateUrl: './add-rendez-vous.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    CommonModule
  ],
})
export class AddRendezVousComponent implements OnInit {
  rendezVousForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  patients: Patient[] = [];
  medecins: Medecin[] = [];

  statuts = [
    { value: RendezVousStatut.EN_ATTENTE, label: 'En attente' },
    { value: RendezVousStatut.CONFIRME, label: 'Confirmé' },
    { value: RendezVousStatut.TERMINE, label: 'Terminé' },
    { value: RendezVousStatut.ANNULE, label: 'Annulé' }
  ];

  heuresDisponibles: string[] = [];

  constructor(
    private fb: FormBuilder,
    private rendezVousService: RendezVousService,
    private patientService: PatientService,
    private medecinService: MedecinService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.generateHeuresDisponibles();
    this.initForm();
    this.loadPatients();
    this.loadMedecins();
  }

  initForm(): void {
    this.rendezVousForm = this.fb.group({
      patient_id: ['', Validators.required],
      medecin_id: ['', Validators.required],
      date_rendezvous: [this.getMinDate(), Validators.required],
      heure_rendezvous: ['', Validators.required],
      motif: ['', [Validators.required, Validators.minLength(10)]],
      statut: [RendezVousStatut.EN_ATTENTE, Validators.required]
    });
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  generateHeuresDisponibles(): void {
    // Génère les créneaux de 8h à 18h par intervalles de 30 minutes
    for (let h = 8; h <= 18; h++) {
      for (let m = 0; m < 60; m += 30) {
        if (h === 18 && m > 0) break;
        const heure = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        this.heuresDisponibles.push(heure);
      }
    }
  }

  loadPatients(): void {
    this.patientService.getAll().subscribe({
      next: (data: Patient[]) => {
        this.patients = data;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des patients:', error);
      }
    });
  }

  loadMedecins(): void {
    this.medecinService.getAll().subscribe({
      next: (data: Medecin[]) => {
        this.medecins = data;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des médecins:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.rendezVousForm.invalid) {
      this.markFormGroupTouched(this.rendezVousForm);
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.rendezVousForm.value;

    this.rendezVousService.create(formData).subscribe({
      next: () => {
        this.successMessage = 'Rendez-vous créé avec succès';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/rendez-vous']);
        }, 1500);
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors de la création du rendez-vous';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/rendez-vous']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.rendezVousForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getPatientLabel(patient: Patient): string {
    if (patient.user) {
      return `${patient.user.nom} ${patient.user.prenom} - ${patient.user.email}`;
    }
    return `Patient #${patient.id}`;
  }

  getMedecinLabel(medecin: Medecin): string {
    if (medecin.user) {
      const specialite = medecin.specialite?.nom || 'Généraliste';
      return `Dr. ${medecin.user.nom} ${medecin.user.prenom} - ${specialite}`;
    }
    return `Médecin #${medecin.id}`;
  }
}
