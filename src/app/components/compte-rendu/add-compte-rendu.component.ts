import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { CompteRenduService } from '../../services/compte-rendu.service';
import { Router, ActivatedRoute } from '@angular/router';
import {CommonModule} from '@angular/common';


@Component({
  selector: 'app-add-compte-rendu',
  templateUrl: './add-compte-rendu.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
})
export class AddCompteRenduComponent implements OnInit {
  compteRenduForm!: FormGroup;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isEditMode: boolean = false;
  compteRenduId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private compteRenduService: CompteRenduService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.compteRenduId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.compteRenduId;

    if (this.isEditMode && this.compteRenduId) {
      this.loadCompteRendu(this.compteRenduId);
    }
  }

  initForm(): void {
    this.compteRenduForm = this.fb.group({
      consultation_id: ['', Validators.required],
      diagnostic: ['', [Validators.required, Validators.minLength(5)]],
      traitement: ['', [Validators.required, Validators.minLength(5)]],
      observation: [''],
      date_creation: [this.formatDate(new Date()), Validators.required]
    });
  }

  loadCompteRendu(id: string): void {
    this.compteRenduService.getById(id).subscribe({
      next: (data) => {
        this.compteRenduForm.patchValue({
          consultation_id: data.consultation_id,
          diagnostic: data.diagnostic,
          traitement: data.traitement,
          observation: data.observation,
          date_creation: this.formatDate(data.date_creation)
        });
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement du compte rendu';
        console.error('Erreur:', error);
      }
    });
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.compteRenduForm.invalid) {
      Object.keys(this.compteRenduForm.controls).forEach(key => {
        this.compteRenduForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.compteRenduForm.value;

    if (this.isEditMode && this.compteRenduId) {
      this.compteRenduService.update(this.compteRenduId, formData).subscribe({
        next: () => {
          this.successMessage = 'Compte rendu modifié avec succès';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigate(['/comptes-rendus']), 1500);
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la modification';
          this.isSubmitting = false;
          console.error('Erreur:', error);
        }
      });
    } else {
      this.compteRenduService.create(formData).subscribe({
        next: () => {
          this.successMessage = 'Compte rendu créé avec succès';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigate(['/comptes-rendus']), 1500);
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
    this.router.navigate(['/comptes-rendus']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.compteRenduForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.compteRenduForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (field?.hasError('minlength')) {
      return `Minimum ${field.errors?.['minlength'].requiredLength} caractères`;
    }
    return '';
  }
}
