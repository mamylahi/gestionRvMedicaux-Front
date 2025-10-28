import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {Medecin} from '../../../models/medecin.model';
import {DisponibiliteService} from '../../../services/disponibilite.service';
import {MedecinService} from '../../../services/medecin.service';


@Component({
  selector: 'app-add-disponibilite',
  templateUrl: './add-disponibilite.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ]
})
export class AddDisponibiliteComponent implements OnInit {
  disponibiliteForm!: FormGroup;
  medecins: Medecin[] = [];
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isEditMode: boolean = false;
  disponibiliteId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private disponibiliteService: DisponibiliteService,
    private medecinService: MedecinService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadMedecins();

    this.disponibiliteId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.disponibiliteId;

    if (this.isEditMode && this.disponibiliteId) {
      this.loadDisponibilite(this.disponibiliteId);
    }
  }

  initForm(): void {
    this.disponibiliteForm = this.fb.group({
      medecin_id: ['', Validators.required],
      date_debut: ['', Validators.required],
      date_fin: ['', Validators.required],
      recurrent: [false]
    }, { validators: this.dateRangeValidator });
  }

  dateRangeValidator(form: FormGroup) {
    const dateDebut = form.get('date_debut')?.value;
    const dateFin = form.get('date_fin')?.value;

    if (dateDebut && dateFin) {
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);

      if (debut > fin) {
        return { dateRangeInvalid: true };
      }
    }
    return null;
  }

  loadMedecins(): void {
    this.medecinService.getAll().subscribe({
      next: (data) => {
        this.medecins = data;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des médecins';
        console.error('Erreur:', error);
      }
    });
  }

  loadDisponibilite(id: string): void {
    this.disponibiliteService.getById(id).subscribe({
      next: (data) => {
        this.disponibiliteForm.patchValue({
          medecin_id: data.medecin_id,
          date_debut: this.formatDateForInput(data.date_debut),
          date_fin: this.formatDateForInput(data.date_fin),
          recurrent: data.recurrent
        });
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement de la disponibilité';
        console.error('Erreur:', error);
      }
    });
  }

  formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onSubmit(): void {
    if (this.disponibiliteForm.invalid) {
      Object.keys(this.disponibiliteForm.controls).forEach(key => {
        this.disponibiliteForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.disponibiliteForm.value;

    if (this.isEditMode && this.disponibiliteId) {
      this.disponibiliteService.update(this.disponibiliteId, formData).subscribe({
        next: () => {
          this.successMessage = 'Disponibilité modifiée avec succès';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigate(['/disponibilites']), 1500);
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la modification';
          this.isSubmitting = false;
          console.error('Erreur:', error);
        }
      });
    } else {
      this.disponibiliteService.create(formData).subscribe({
        next: () => {
          this.successMessage = 'Disponibilité créée avec succès';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigate(['/disponibilites']), 1500);
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
    this.router.navigate(['/disponibilites']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.disponibiliteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.disponibiliteForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Ce champ est requis';
    }
    return '';
  }

  hasDateRangeError(): boolean {
    return !!(this.disponibiliteForm.hasError('dateRangeInvalid') &&
      (this.disponibiliteForm.get('date_debut')?.touched ||
        this.disponibiliteForm.get('date_fin')?.touched));
  }
}
