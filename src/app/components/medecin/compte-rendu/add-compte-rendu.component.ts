import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompteRenduService } from '../../../services/compte-rendu.service';
import { CommonModule } from '@angular/common';

interface Consultation {
  id: number;
  rendezvous_id?: number;
  rendezvous?: {
    id?: number;
    patient?: {
      id?: number;
      user?: {
        id?: number;
        prenom: string;
        nom: string;
      }
    };
    date_heure?: string;
    date_rendezvous?: string;
  };
  date_consultation?: Date;
  motif?: string;
  statut?: string;
  compte_rendu?: any;
  paiement_id?: number;
  paiement?: any;
  created_at?: Date;
  updated_at?: Date;
}

@Component({
  selector: 'app-add-compte-rendu',
  templateUrl: './add-compte-rendu.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class AddCompteRenduComponent implements OnInit {
  @Input() isEditMode = false;
  @Input() compteRenduId: number | null = null;
  @Input() consultations: Consultation[] = [];
  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  compteRenduForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  selectedConsultation: Consultation | null = null;

  constructor(
    private fb: FormBuilder,
    private compteRenduService: CompteRenduService
  ) {}

  ngOnInit(): void {
    this.initForm();

    if (this.isEditMode && this.compteRenduId) {
      this.loadCompteRendu(this.compteRenduId.toString());
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

  onConsultationChange(consultationId: string): void {
    this.selectedConsultation = this.consultations.find(
      c => c.id === parseInt(consultationId)
    ) || null;
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
        this.onConsultationChange(data.consultation_id.toString());
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

    const formData = {
      ...this.compteRenduForm.value,
      consultation_id: parseInt(this.compteRenduForm.value.consultation_id)
    };

    if (this.isEditMode && this.compteRenduId) {
      this.compteRenduService.update(this.compteRenduId.toString(), formData).subscribe({
        next: (response) => {
          this.successMessage = 'Compte rendu modifié avec succès';
          this.isSubmitting = false;
          setTimeout(() => this.onSuccess.emit(), 1000);
        },
        error: (error) => {
          this.errorMessage = this.getBackendErrorMessage(error);
          this.isSubmitting = false;
        }
      });
    } else {
      this.compteRenduService.create(formData).subscribe({
        next: (response) => {
          this.successMessage = 'Compte rendu créé avec succès';
          this.isSubmitting = false;
          setTimeout(() => this.onSuccess.emit(), 1000);
        },
        error: (error) => {
          this.errorMessage = this.getBackendErrorMessage(error);
          this.isSubmitting = false;
        }
      });
    }
  }

  handleCancel(): void {
    this.onCancel.emit();
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
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }
    return '';
  }

  getBackendErrorMessage(error: any): string {
    if (error.error?.message) return error.error.message;
    if (error.error?.error) return error.error.error;
    if (error.status === 404) return 'Consultation non trouvée';
    if (error.status === 409) return 'Un compte rendu existe déjà pour cette consultation';
    if (error.status === 400) return 'Données invalides. Veuillez vérifier le formulaire';
    if (error.status === 401) return 'Non autorisé. Veuillez vous reconnecter';
    return 'Erreur lors de l\'opération. Veuillez réessayer';
  }
}
