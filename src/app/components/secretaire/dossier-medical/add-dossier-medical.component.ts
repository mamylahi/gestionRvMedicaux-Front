import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {CommonModule, NgClass} from '@angular/common';
import {Patient} from '../../../models/patient.model';
import {DossierMedicalService} from '../../../services/dossier-medical.service';
import {PatientService} from '../../../services/patient.service';


@Component({
  selector: 'app-add-dossier-medical',
  templateUrl: './add-dossier-medical.component.html',
  standalone: true,
  imports: [
    NgClass,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class AddDossierMedicalComponent implements OnInit {
  dossierForm!: FormGroup;
  patients: Patient[] = [];
  patientsDisponibles: Patient[] = [];
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isEditMode: boolean = false;
  dossierId: string | null = null;

  groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  constructor(
    private fb: FormBuilder,
    private dossierMedicalService: DossierMedicalService,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPatients();

    this.dossierId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.dossierId;

    if (this.isEditMode && this.dossierId) {
      this.loadDossier(this.dossierId);
    }
  }

  initForm(): void {
    this.dossierForm = this.fb.group({
      patient_id: ['', Validators.required],
      groupe_sanguin: [''],
      date_creation: ['', Validators.required]
    });
  }

  loadPatients(): void {
    this.patientService.getAll().subscribe({
      next: (data) => {
        this.patients = data;
        this.filterPatientsDisponibles();
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des patients';
        console.error('Erreur:', error);
      }
    });
  }

  filterPatientsDisponibles(): void {
    // En mode création, filtrer les patients qui n'ont pas encore de dossier
    if (!this.isEditMode) {
      this.dossierMedicalService.getAll().subscribe({
        next: (dossiers) => {
          const patientIdsAvecDossier = dossiers.map(d => d.patient_id);
          this.patientsDisponibles = this.patients.filter(
            p => !patientIdsAvecDossier.includes(p.id)
          );
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.patientsDisponibles = this.patients;
        }
      });
    } else {
      this.patientsDisponibles = this.patients;
    }
  }

  loadDossier(id: string): void {
    this.dossierMedicalService.getById(id).subscribe({
      next: (data) => {
        this.dossierForm.patchValue({
          patient_id: data.patient_id,
          groupe_sanguin: data.groupe_sanguin || '',
          date_creation: this.formatDateForInput(data.date_creation)
        });

        // En mode édition, désactiver le champ patient
        this.dossierForm.get('patient_id')?.disable();
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement du dossier médical';
        console.error('Erreur:', error);
      }
    });
  }

  formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.dossierForm.invalid) {
      Object.keys(this.dossierForm.controls).forEach(key => {
        this.dossierForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // En mode édition, réactiver le champ patient pour l'inclure dans les données
    if (this.isEditMode) {
      this.dossierForm.get('patient_id')?.enable();
    }

    const formData = this.dossierForm.value;

    if (this.isEditMode && this.dossierId) {
      this.dossierMedicalService.update(this.dossierId, formData).subscribe({
        next: () => {
          this.successMessage = 'Dossier médical modifié avec succès';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigate(['/dossiers-medicaux']), 1500);
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la modification';
          this.isSubmitting = false;
          this.dossierForm.get('patient_id')?.disable();
          console.error('Erreur:', error);
        }
      });
    } else {
      this.dossierMedicalService.create(formData).subscribe({
        next: () => {
          this.successMessage = 'Dossier médical créé avec succès';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigate(['/dossiers-medicaux']), 1500);
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la création';
          this.isSubmitting = false;
          console.error('Erreur:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/dossiers-medicaux']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.dossierForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.dossierForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Ce champ est requis';
    }
    return '';
  }

  getPatientInfo(patientId: number): string {
    const patient = this.patients.find(p => p.id === patientId);
    if (patient) {
      return `${patient?.user?.nom} ${patient?.user?.prenom} - ${patient.numero_patient}`;
    }
    return '';
  }

  getGroupeSanguinBadgeClass(groupe: string): string {
    const classes: { [key: string]: string } = {
      'A+': 'bg-danger',
      'A-': 'bg-warning',
      'B+': 'bg-info',
      'B-': 'bg-primary',
      'AB+': 'bg-success',
      'AB-': 'bg-dark',
      'O+': 'bg-danger',
      'O-': 'bg-warning'
    };
    return classes[groupe] || 'bg-secondary';
  }
}
