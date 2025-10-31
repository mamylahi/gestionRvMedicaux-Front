// patient.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { Patient } from '../../../models/patient.model';
import { PatientService } from '../../../services/patient.service';
import { AuthService } from '../../../services/auth.service';

// Déclaration pour SweetAlert2
declare var Swal: any;

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
  ]
})
export class PatientComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Modal
  showPatientModal: boolean = false;
  selectedPatient: Patient | null = null;
  isEditing: boolean = false;

  // Nouveau patient
  newPatient: any = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    password: '',
    password_confirmation: '',
    numero_patient: ''
  };

  constructor(
    private patientService: PatientService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.patientService.getAll().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.patients = Array.isArray(response.data) ? response.data : [response.data];
        } else if (Array.isArray(response)) {
          this.patients = response;
        } else {
          this.patients = [];
        }
        this.filteredPatients = [...this.patients];
        this.calculateTotalPages();
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des patients';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPatients = this.patients;
      this.currentPage = 1;
      this.calculateTotalPages();
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredPatients = this.patients.filter(p =>
      p.user?.nom?.toLowerCase().includes(term) ||
      p.user?.prenom?.toLowerCase().includes(term) ||
      p.user?.email?.toLowerCase().includes(term) ||
      p.numero_patient?.toLowerCase().includes(term) ||
      p.user?.telephone?.toLowerCase().includes(term)
    );
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  onResetFilters(): void {
    this.searchTerm = '';
    this.filteredPatients = [...this.patients];
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredPatients.length / this.itemsPerPage);
  }

  get paginatedPatients(): Patient[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPatients.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getDisplayedPages(): number[] {
    const pages = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onExport(): void {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Exporter les patients',
        text: 'Fonctionnalité d\'export en cours de développement',
        icon: 'info',
        confirmButtonColor: '#3B82F6',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl px-6 py-3 font-semibold'
        }
      });
    } else {
      alert('Fonctionnalité d\'export en cours de développement');
    }
    console.log('Export des patients', this.filteredPatients);
  }

  // Gestion du modal
  openAddPatientModal(): void {
    this.isEditing = false;
    this.selectedPatient = null;
    this.newPatient = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      password: '',
      password_confirmation: '',
      numero_patient: ''
    };
    this.showPatientModal = true;
  }

  openEditPatientModal(patient: Patient): void {
    this.isEditing = true;
    this.selectedPatient = patient;
    this.newPatient = {
      nom: patient.user?.nom || '',
      prenom: patient.user?.prenom || '',
      email: patient.user?.email || '',
      telephone: patient.user?.telephone || '',
      adresse: patient.user?.adresse || '',
      numero_patient: patient.numero_patient || '',
      password: '',
      password_confirmation: ''
    };
    this.showPatientModal = true;
  }

  closePatientModal(): void {
    this.showPatientModal = false;
    this.selectedPatient = null;
    this.isEditing = false;
  }

  savePatient(): void {
    if (this.isEditing && this.selectedPatient) {
      this.updatePatient();
    } else {
      this.createPatient();
    }
  }

  createPatient(): void {
    this.isLoading = true;
    const patientData = {
      ...this.newPatient,
      role: 'patient'
    };

    this.authService.register(patientData).subscribe({
      next: (response) => {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Succès !',
            text: 'Patient créé avec succès',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'rounded-2xl'
            }
          });
        } else {
          this.successMessage = 'Patient créé avec succès';
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.closePatientModal();
        this.loadPatients();
        this.isLoading = false;
      },
      error: (error) => {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Erreur',
            text: 'Une erreur est survenue lors de la création',
            icon: 'error',
            confirmButtonColor: '#3B82F6',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-xl px-6 py-3 font-semibold'
            }
          });
        } else {
          this.errorMessage = 'Erreur lors de la création du patient';
        }
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  updatePatient(): void {
    if (!this.selectedPatient) return;

    this.isLoading = true;
    const updateData: any = {
      nom: this.newPatient.nom,
      prenom: this.newPatient.prenom,
      email: this.newPatient.email,
      telephone: this.newPatient.telephone,
      adresse: this.newPatient.adresse,
      numero_patient: this.newPatient.numero_patient
    };

    if (this.newPatient.password && this.newPatient.password.trim()) {
      updateData.password = this.newPatient.password;
      updateData.password_confirmation = this.newPatient.password_confirmation;
    }

    this.patientService.update(this.selectedPatient.id.toString(), updateData).subscribe({
      next: (response) => {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Succès !',
            text: 'Patient modifié avec succès',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'rounded-2xl'
            }
          });
        } else {
          this.successMessage = 'Patient modifié avec succès';
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.closePatientModal();
        this.loadPatients();
        this.isLoading = false;
      },
      error: (error) => {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Erreur',
            text: 'Une erreur est survenue lors de la modification',
            icon: 'error',
            confirmButtonColor: '#3B82F6',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-xl px-6 py-3 font-semibold'
            }
          });
        } else {
          this.errorMessage = 'Erreur lors de la modification du patient';
        }
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onEdit(id: number): void {
    const patient = this.patients.find(p => p.id === id);
    if (patient) {
      this.openEditPatientModal(patient);
    }
  }

  onDelete(id: number): void {
    const patient = this.patients.find(p => p.id === id);
    const patientName = patient ? `${patient.user?.prenom} ${patient.user?.nom}` : 'ce patient';

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Confirmer la suppression',
        html: `Êtes-vous sûr de vouloir supprimer le patient <strong>${patientName}</strong> ?<br><small class="text-gray-500">Cette action est irréversible</small>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl px-6 py-3 font-semibold',
          cancelButton: 'rounded-xl px-6 py-3 font-semibold'
        }
      }).then((result: { isConfirmed: any; }) => {
        if (result.isConfirmed) {
          this.patientService.delete(id).subscribe({
            next: () => {
              Swal.fire({
                title: 'Supprimé !',
                text: 'Le patient a été supprimé avec succès',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                customClass: {
                  popup: 'rounded-2xl'
                }
              });
              this.loadPatients();
            },
            error: (error: any) => {
              Swal.fire({
                title: 'Erreur',
                text: 'Une erreur est survenue lors de la suppression',
                icon: 'error',
                confirmButtonColor: '#3B82F6',
                customClass: {
                  popup: 'rounded-2xl',
                  confirmButton: 'rounded-xl px-6 py-3 font-semibold'
                }
              });
              console.error('Erreur:', error);
            }
          });
        }
      });
    } else {
      if (confirm(`Êtes-vous sûr de vouloir supprimer ${patientName} ?`)) {
        this.patientService.delete(id).subscribe({
          next: () => {
            this.successMessage = 'Patient supprimé avec succès';
            this.loadPatients();
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error: any) => {
            this.errorMessage = 'Erreur lors de la suppression';
            console.error('Erreur:', error);
          }
        });
      }
    }
  }

  onView(id: number): void {
    this.router.navigate(['/patients/details', id]);
  }

  onViewDashboard(id: number): void {
    this.router.navigate(['/patients/dashboard', id]);
  }

  getInitials(patient: Patient): string {
    const nom = patient.user?.nom || '';
    const prenom = patient.user?.prenom || '';
    return (prenom.charAt(0) + nom.charAt(0)).toUpperCase() || 'PA';
  }

  getPatientName(patient: Patient): string {
    if (patient.user) {
      return `${patient.user.nom} ${patient.user.prenom}`;
    }
    return 'Patient inconnu';
  }

  getCreationDate(patient: Patient): string {
    return patient.created_at ?
      new Date(patient.created_at).toLocaleDateString('fr-FR') :
      'Date inconnue';
  }

  formatDateFr(date: Date | undefined, format: string): string {
    if (!date) {
      return format.includes('HH') ? '--:--' : 'Date inconnue';
    }

    try {
      return formatDate(date, format, 'fr-FR');
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return format.includes('HH') ? '--:--' : 'Date invalide';
    }
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected readonly Math = Math;
}
