
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsultationService } from '../../../services/consultation.service';
import { Consultation } from '../../../models/consultation.model';

@Component({
  selector: 'app-add-consultation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-consultation.component.html',
})
export class AddConsultationComponent implements OnInit {
  consultationForm!: FormGroup;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isEditMode: boolean = false;
  consultationId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private consultationService: ConsultationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.consultationId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.consultationId;

    if (this.isEditMode && this.consultationId) {
      this.loadConsultation(this.consultationId);
    }
  }

  initForm(): void {
    this.consultationForm = this.fb.group({
      rendezvous_id: ['', Validators.required],
      date_consultation: [this.formatDateTime(new Date()), Validators.required]
    });
  }

  loadConsultation(id: string): void {
    this.consultationService.getById(id).subscribe({
      next: (data) => {
        this.consultationForm.patchValue({
          rendezvous_id: data.rendezvous_id,
          date_consultation: this.formatDateTime(data.date_consultation)
        });
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement de la consultation';
        console.error('Erreur:', error);
      }
    });
  }

  formatDateTime(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onSubmit(): void {
    if (this.consultationForm.invalid) {
      Object.keys(this.consultationForm.controls).forEach(key => {
        this.consultationForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.consultationForm.value;

    if (this.isEditMode && this.consultationId) {
      this.consultationService.update(this.consultationId, formData).subscribe({
        next: () => {
          this.successMessage = 'Consultation modifiée avec succès';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigate(['/consultations']), 1500);
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la modification';
          this.isSubmitting = false;
          console.error('Erreur:', error);
        }
      });
    } else {
      this.consultationService.create(formData).subscribe({
        next: () => {
          this.successMessage = 'Consultation créée avec succès';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigate(['/consultations']), 1500);
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
    this.router.navigate(['/consultations']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.consultationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.consultationForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Ce champ est requis';
    }
    return '';
  }
}
