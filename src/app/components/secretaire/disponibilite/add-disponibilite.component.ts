import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Medecin } from '../../../models/medecin.model';
import { DisponibiliteService } from '../../../services/disponibilite.service';
import { MedecinService } from '../../../services/medecin.service';

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

  /**
   * Validateur personnalisé pour vérifier que la date de fin est après la date de début
   */
  dateRangeValidator(form: FormGroup): { [key: string]: boolean } | null {
    const dateDebut = form.get('date_debut')?.value;
    const dateFin = form.get('date_fin')?.value;

    if (dateDebut && dateFin) {
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);

      if (debut >= fin) {
        return { dateRangeInvalid: true };
      }
    }
    return null;
  }

  loadMedecins(): void {
    this.medecinService.getAll().subscribe({
      next: (data: any) => {
        // Gérer différents formats de réponse
        this.medecins = data.data || data || [];
        console.log('Médecins chargés:', this.medecins);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des médecins';
        console.error('Erreur:', error);
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  loadDisponibilite(id: string): void {
    this.disponibiliteService.getById(id).subscribe({
      next: (data: any) => {
        // Gérer différents formats de réponse
        const disponibilite = data.data || data;

        this.disponibiliteForm.patchValue({
          medecin_id: disponibilite.medecin_id,
          date_debut: this.formatDateForInput(disponibilite.date_debut),
          date_fin: this.formatDateForInput(disponibilite.date_fin),
          recurrent: disponibilite.recurrent || false
        });

        console.log('Disponibilité chargée:', disponibilite);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement de la disponibilité';
        console.error('Erreur:', error);
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  /**
   * Formate une date pour l'input datetime-local
   * Format requis: YYYY-MM-DDTHH:mm
   */
  formatDateForInput(date: Date | string): string {
    const d = new Date(date);

    if (isNaN(d.getTime())) {
      console.error('Date invalide:', date);
      return '';
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onSubmit(): void {
    // Marquer tous les champs comme touchés pour afficher les erreurs
    if (this.disponibiliteForm.invalid) {
      Object.keys(this.disponibiliteForm.controls).forEach(key => {
        this.disponibiliteForm.get(key)?.markAsTouched();
      });

      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.disponibiliteForm.value;

    // Convertir les dates au format ISO pour l'API
    const payload = {
      ...formData,
      date_debut: new Date(formData.date_debut).toISOString(),
      date_fin: new Date(formData.date_fin).toISOString()
    };

    if (this.isEditMode && this.disponibiliteId) {
      // Mode modification
      this.disponibiliteService.update(this.disponibiliteId, payload).subscribe({
        next: () => {
          this.successMessage = 'Disponibilité modifiée avec succès';
          this.isSubmitting = false;
          console.log('Disponibilité modifiée avec succès');
          setTimeout(() => this.router.navigate(['/disponibilites']), 1500);
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la modification de la disponibilité';
          this.isSubmitting = false;
          console.error('Erreur:', error);

          // Afficher un message d'erreur plus détaillé si disponible
          if (error.error?.message) {
            this.errorMessage = error.error.message;
          }

          setTimeout(() => this.errorMessage = '', 5000);
        }
      });
    } else {
      // Mode création
      this.disponibiliteService.create(payload).subscribe({
        next: () => {
          this.successMessage = 'Disponibilité créée avec succès';
          this.isSubmitting = false;
          console.log('Disponibilité créée avec succès');
          setTimeout(() => this.router.navigate(['/disponibilites']), 1500);
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la création de la disponibilité';
          this.isSubmitting = false;
          console.error('Erreur:', error);

          // Afficher un message d'erreur plus détaillé si disponible
          if (error.error?.message) {
            this.errorMessage = error.error.message;
          }

          setTimeout(() => this.errorMessage = '', 5000);
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
    return !!(
      this.disponibiliteForm.hasError('dateRangeInvalid') &&
      (this.disponibiliteForm.get('date_debut')?.touched ||
        this.disponibiliteForm.get('date_fin')?.touched)
    );
  }
}
