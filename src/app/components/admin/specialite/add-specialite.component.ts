import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import {Departement} from '../../../../../../../../../OneDrive/Desktop/gestionRvMedicaux-Front/gestionRvMedicaux-Front/gestionRvMedicaux-Front/src/app/models/departement.model';
import {SpecialiteService} from '../../../../../../../../../OneDrive/Desktop/gestionRvMedicaux-Front/gestionRvMedicaux-Front/gestionRvMedicaux-Front/src/app/services/specialite.service';
import {DepartementService} from '../../../../../../../../../OneDrive/Desktop/gestionRvMedicaux-Front/gestionRvMedicaux-Front/gestionRvMedicaux-Front/src/app/services/departement.service';
import {CommonModule} from '@angular/common';


@Component({
  selector: 'app-add-specialite',
  templateUrl: './add-specialite.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
})
export class AddSpecialiteComponent implements OnInit {
  specialiteForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  departements: Departement[] = [];

  constructor(
    private fb: FormBuilder,
    private specialiteService: SpecialiteService,
    private departementService: DepartementService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDepartements();
  }

  initForm(): void {
    this.specialiteForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      departement_id: ['', Validators.required]
    });
  }

  loadDepartements(): void {
    this.departementService.getAll().subscribe({
      next: (data: Departement[]) => {
        this.departements = data;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des départements:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.specialiteForm.invalid) {
      this.markFormGroupTouched(this.specialiteForm);
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.specialiteForm.value;

    this.specialiteService.create(formData).subscribe({
      next: () => {
        this.successMessage = 'Spécialité créée avec succès';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/specialites']);
        }, 1500);
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors de la création de la spécialité';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/specialites']);
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
    const field = this.specialiteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

}
