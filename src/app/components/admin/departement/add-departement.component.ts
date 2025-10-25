import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {DepartementService} from '../../../../../../../../../OneDrive/Desktop/gestionRvMedicaux-Front/gestionRvMedicaux-Front/gestionRvMedicaux-Front/src/app/services/departement.service';
import {CommonModule} from '@angular/common';


@Component({
  selector: 'app-add-departement',
  templateUrl: './add-departement.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ]
})
export class AddDepartementComponent implements OnInit {
  departementForm!: FormGroup;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isEditMode: boolean = false;
  departementId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private departementService: DepartementService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.departementId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.departementId;

    if (this.isEditMode && this.departementId) {
      this.loadDepartement(this.departementId);
    }
  }

  initForm(): void {
    this.departementForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)]
    });
  }

  loadDepartement(id: string): void {
    this.departementService.getById(id).subscribe({
      next: (data) => {
        this.departementForm.patchValue({
          nom: data.nom,
          description: data.description
        });
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement du département';
        console.error('Erreur:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.departementForm.invalid) {
      Object.keys(this.departementForm.controls).forEach(key => {
        this.departementForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.departementForm.value;

    if (this.isEditMode && this.departementId) {
      this.departementService.update(this.departementId, formData).subscribe({
        next: () => {
          this.successMessage = 'Département modifié avec succès';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigate(['/departements']), 1500);
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la modification';
          this.isSubmitting = false;
          console.error('Erreur:', error);
        }
      });
    } else {
      this.departementService.create(formData).subscribe({
        next: () => {
          this.successMessage = 'Département créé avec succès';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigate(['/departements']), 1500);
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
    this.router.navigate(['/departements']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.departementForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.departementForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (field?.hasError('minlength')) {
      return `Minimum ${field.errors?.['minlength'].requiredLength} caractères`;
    }
    if (field?.hasError('maxlength')) {
      return `Maximum ${field.errors?.['maxlength'].requiredLength} caractères`;
    }
    return '';
  }
}

