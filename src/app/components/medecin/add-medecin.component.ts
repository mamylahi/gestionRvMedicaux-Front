import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {Specialite} from '../../models/specialite.model';
import {MedecinService} from '../../services/medecin.service';
import {SpecialiteService} from '../../services/specialite.service';
import {CommonModule, NgClass} from '@angular/common';


@Component({
  selector: 'app-add-medecin',
  templateUrl: './add-medecin.component.html',
  standalone: true,
  imports: [
    NgClass,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class AddMedecinComponent implements OnInit {
  medecinForm!: FormGroup;
  specialites: Specialite[] = [];
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isEditMode: boolean = false;
  medecinId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private medecinService: MedecinService,
    private specialiteService: SpecialiteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSpecialites();

    this.medecinId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.medecinId;

    if (this.isEditMode && this.medecinId) {
      this.loadMedecin(this.medecinId);
    }
  }

  initForm(): void {
    this.medecinForm = this.fb.group({
      specialite_id: ['', Validators.required],
      disponible: [true]
    });
  }

  loadSpecialites(): void {
    this.specialiteService.getAll().subscribe({
      next: (data) => {
        this.specialites = data;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des spécialités';
        console.error('Erreur:', error);
      }
    });
  }

  loadMedecin(id: string): void {
    this.medecinService.getById(id).subscribe({
      next: (data) => {
        this.medecinForm.patchValue({
          specialite_id: data.specialite_id,
          disponible: data.disponible
        });
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement du médecin';
        console.error('Erreur:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.medecinForm.invalid) {
      Object.keys(this.medecinForm.controls).forEach(key => {
        this.medecinForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.medecinForm.value;

    if (this.isEditMode && this.medecinId) {
      this.medecinService.update(this.medecinId, formData).subscribe({
        next: () => {
          this.successMessage = 'Médecin modifié avec succès';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigate(['/medecins']), 1500);
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la modification';
          this.isSubmitting = false;
          console.error('Erreur:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/medecins']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.medecinForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.medecinForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Ce champ est requis';
    }
    return '';
  }
}
