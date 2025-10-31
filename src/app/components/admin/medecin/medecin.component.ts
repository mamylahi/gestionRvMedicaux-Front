// medecin.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass, NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { SpecialiteService } from '../../../services/specialite.service';
import { MedecinService } from '../../../services/medecin.service';
import { AuthService } from '../../../services/auth.service';
import { Specialite } from '../../../models/specialite.model';
import { Medecin } from '../../../models/medecin.model';

// Déclaration pour SweetAlert2
declare var Swal: any;

@Component({
  selector: 'app-medecin',
  templateUrl: './medecin.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgFor,
    CommonModule,
  ]
})
export class MedecinComponent implements OnInit {
  medecins: Medecin[] = [];
  filteredMedecins: Medecin[] = [];
  specialites: Specialite[] = [];
  searchTerm: string = '';
  selectedSpecialiteId: string = '';
  filterDisponible: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Modal
  showMedecinModal: boolean = false;
  selectedMedecin: Medecin | null = null;
  isEditing: boolean = false;

  // Nouveau médecin
  newMedecin: any = {
    user_id: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    password: '',
    password_confirmation: '',
    specialite_id: '',
    numero_medecin: '',
    disponible: true
  };

  constructor(
    private medecinService: MedecinService,
    private specialiteService: SpecialiteService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSpecialites();
    this.loadMedecins();
  }

  loadSpecialites(): void {
    this.specialiteService.getAll().subscribe({
      next: (data: any) => {
        if (data && data.data) {
          this.specialites = Array.isArray(data.data) ? data.data : [data.data];
        } else if (Array.isArray(data)) {
          this.specialites = data;
        } else {
          this.specialites = [];
        }
        console.log('Spécialités chargées:', this.specialites);
      },
      error: (error) => {
        console.error('Erreur chargement spécialités:', error);
        this.specialites = [];
      }
    });
  }

  loadMedecins(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.medecinService.getAll().subscribe({
      next: (data: any) => {
        if (data && data.data) {
          this.medecins = Array.isArray(data.data) ? data.data : [data.data];
        } else if (Array.isArray(data)) {
          this.medecins = data;
        } else {
          this.medecins = [];
        }

        this.filteredMedecins = [...this.medecins];
        this.isLoading = false;
        console.log('Médecins chargés:', this.medecins);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des médecins';
        this.isLoading = false;
        this.medecins = [];
        this.filteredMedecins = [];
        console.error('Erreur:', error);
      }
    });
  }

  onSearch(): void {
    let filtered = this.medecins;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.user?.nom?.toLowerCase().includes(term) ||
        m.user?.prenom?.toLowerCase().includes(term) ||
        m.numero_medecin?.toLowerCase().includes(term) ||
        m.specialite?.nom?.toLowerCase().includes(term)
      );
    }

    if (this.selectedSpecialiteId) {
      filtered = filtered.filter(m =>
        m.specialite_id?.toString() === this.selectedSpecialiteId
      );
    }

    if (this.filterDisponible !== '') {
      const disponible = this.filterDisponible === 'true';
      filtered = filtered.filter(m => m.disponible === disponible);
    }

    this.filteredMedecins = filtered;
  }

  onFilterBySpecialite(): void {
    if (!this.selectedSpecialiteId) {
      this.loadMedecins();
      return;
    }

    this.isLoading = true;
    this.medecinService.getBySpecialite(this.selectedSpecialiteId).subscribe({
      next: (data: any) => {
        if (data && data.data) {
          this.medecins = Array.isArray(data.data) ? data.data : [data.data];
        } else if (Array.isArray(data)) {
          this.medecins = data;
        } else {
          this.medecins = [];
        }
        this.filteredMedecins = [...this.medecins];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du filtrage';
        this.isLoading = false;
        this.medecins = [];
        this.filteredMedecins = [];
        console.error('Erreur:', error);
      }
    });
  }

  onFilterDisponibles(): void {
    this.isLoading = true;
    this.medecinService.getDisponibles().subscribe({
      next: (data: any) => {
        if (data && data.data) {
          this.medecins = Array.isArray(data.data) ? data.data : [data.data];
        } else if (Array.isArray(data)) {
          this.medecins = data;
        } else {
          this.medecins = [];
        }
        this.filteredMedecins = [...this.medecins];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du filtrage';
        this.isLoading = false;
        this.medecins = [];
        this.filteredMedecins = [];
        console.error('Erreur:', error);
      }
    });
  }

  onResetFilters(): void {
    this.searchTerm = '';
    this.selectedSpecialiteId = '';
    this.filterDisponible = '';
    this.loadMedecins();
  }

  // Gestion du modal
  openAddMedecinModal(): void {
    this.isEditing = false;
    this.selectedMedecin = null;
    this.newMedecin = {
      user_id: '',
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      password: '',
      password_confirmation: '',
      specialite_id: '',
      numero_medecin: '',
      disponible: true
    };
    this.showMedecinModal = true;
  }

  openEditMedecinModal(medecin: Medecin): void {
    this.isEditing = true;
    this.selectedMedecin = medecin;

    console.log('📋 Médecin sélectionné:', medecin);
    console.log('👤 User ID:', medecin.user_id);
    console.log('🏥 Specialite ID:', medecin.specialite_id);

    this.newMedecin = {
      user_id: medecin.user_id || medecin.user?.id,
      nom: medecin.user?.nom || '',
      prenom: medecin.user?.prenom || '',
      email: medecin.user?.email || '',
      telephone: medecin.user?.telephone || '',
      adresse: medecin.user?.adresse || '',
      specialite_id: medecin.specialite_id || '',
      numero_medecin: medecin.numero_medecin || '',
      disponible: medecin.disponible,
      password: '',
      password_confirmation: ''
    };

    console.log('📤 newMedecin préparé:', this.newMedecin);

    this.showMedecinModal = true;
  }

  closeMedecinModal(): void {
    this.showMedecinModal = false;
    this.selectedMedecin = null;
    this.isEditing = false;
  }

  saveMedecin(): void {
    if (this.isEditing && this.selectedMedecin) {
      this.updateMedecin();
    } else {
      this.createMedecin();
    }
  }

  createMedecin(): void {
    this.isLoading = true;
    const medecinData = {
      ...this.newMedecin,
      role: 'medecin'
    };

    this.authService.register(medecinData).subscribe({
      next: (response) => {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Succès !',
            text: 'Médecin créé avec succès',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'rounded-2xl'
            }
          });
        } else {
          this.successMessage = 'Médecin créé avec succès';
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.closeMedecinModal();
        this.loadMedecins();
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
          this.errorMessage = 'Erreur lors de la création du médecin';
        }
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  updateMedecin(): void {
    if (!this.selectedMedecin) {
      console.error('❌ Aucun médecin sélectionné');
      return;
    }

    this.isLoading = true;

    const userId = this.newMedecin.user_id ||
      this.selectedMedecin.user_id ||
      this.selectedMedecin.user?.id;

    if (!userId) {
      this.errorMessage = 'Erreur: ID utilisateur introuvable';
      this.isLoading = false;
      console.error('❌ User ID manquant:', this.selectedMedecin);
      return;
    }

    if (!this.newMedecin.specialite_id) {
      this.errorMessage = 'Erreur: Veuillez sélectionner une spécialité';
      this.isLoading = false;
      console.error('❌ Specialite ID manquant');
      return;
    }

    const updateData: any = {
      user_id: userId,
      nom: this.newMedecin.nom,
      prenom: this.newMedecin.prenom,
      email: this.newMedecin.email,
      telephone: this.newMedecin.telephone,
      adresse: this.newMedecin.adresse,
      specialite_id: parseInt(this.newMedecin.specialite_id),
      numero_medecin: this.newMedecin.numero_medecin,
      disponible: this.newMedecin.disponible
    };

    if (this.newMedecin.password && this.newMedecin.password.trim()) {
      updateData.password = this.newMedecin.password;
      updateData.password_confirmation = this.newMedecin.password_confirmation;
    }

    console.log('==========================================');
    console.log('📤 DONNÉES ENVOYÉES AU BACKEND');
    console.log('==========================================');
    console.log('updateData:', updateData);
    console.log('------------------------------------------');
    console.log('user_id:', updateData.user_id, '(type:', typeof updateData.user_id + ')');
    console.log('specialite_id:', updateData.specialite_id, '(type:', typeof updateData.specialite_id + ')');
    console.log('numero_medecin:', updateData.numero_medecin);
    console.log('disponible:', updateData.disponible);
    console.log('==========================================');

    this.medecinService.update(this.selectedMedecin.id.toString(), updateData).subscribe({
      next: (response) => {
        console.log('✅ Réponse du serveur:', response);

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Succès !',
            text: 'Médecin modifié avec succès',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'rounded-2xl'
            }
          });
        } else {
          this.successMessage = 'Médecin modifié avec succès';
          setTimeout(() => this.successMessage = '', 3000);
        }

        this.closeMedecinModal();
        this.loadMedecins();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('==========================================');
        console.error('❌ ERREUR LORS DE LA MISE À JOUR');
        console.error('==========================================');
        console.error('Status:', error.status);
        console.error('Error object:', error);
        console.error('Error body:', error.error);

        let errorMsg = 'Erreur lors de la modification du médecin';

        if (error.error?.errors) {
          console.error('Erreurs de validation:', error.error.errors);
          const erreurs = Object.entries(error.error.errors)
            .map(([champ, messages]: [string, any]) => `${champ}: ${messages.join(', ')}`)
            .join('\n');
          errorMsg = erreurs;
        } else if (error.error?.message) {
          console.error('Message d\'erreur:', error.error.message);
          errorMsg = error.error.message;
        }

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Erreur',
            text: errorMsg,
            icon: 'error',
            confirmButtonColor: '#3B82F6',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-xl px-6 py-3 font-semibold'
            }
          });
        } else {
          this.errorMessage = errorMsg;
        }

        console.error('==========================================');
        this.isLoading = false;
      }
    });
  }

  onEdit(id: number): void {
    const medecin = this.medecins.find(m => m.id === id);
    if (medecin) {
      this.openEditMedecinModal(medecin);
    }
  }

  onDelete(id: number): void {
    const medecin = this.medecins.find(m => m.id === id);
    const medecinName = medecin ? this.getMedecinName(medecin) : 'ce médecin';

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Confirmer la suppression',
        html: `Êtes-vous sûr de vouloir supprimer <strong>${medecinName}</strong> ?<br><small class="text-gray-500">Cette action est irréversible</small>`,
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
          this.medecinService.delete(id).subscribe({
            next: () => {
              Swal.fire({
                title: 'Supprimé !',
                text: 'Le médecin a été supprimé avec succès',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                customClass: {
                  popup: 'rounded-2xl'
                }
              });
              this.loadMedecins();
            },
            error: (error) => {
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
      if (confirm(`Êtes-vous sûr de vouloir supprimer ${medecinName} ?`)) {
        this.medecinService.delete(id).subscribe({
          next: () => {
            this.successMessage = 'Médecin supprimé avec succès';
            this.loadMedecins();
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error) => {
            this.errorMessage = 'Erreur lors de la suppression';
            console.error('Erreur:', error);
          }
        });
      }
    }
  }

  onView(id: number): void {
    this.router.navigate(['/medecins/details', id]);
  }

  onViewDashboard(id: number): void {
    this.router.navigate(['/medecins/dashboard', id]);
  }

  getMedecinName(medecin: Medecin): string {
    if (medecin.user) {
      return `${medecin.user.nom} ${medecin.user.prenom}`;
    }
    return 'Médecin inconnu';
  }

  getSpecialiteName(medecin: Medecin): string {
    return medecin.specialite?.nom || 'Non spécifiée';
  }

  getSpecialiteNom(specialiteId: number | string): string {
    const specialite = this.specialites.find(s => s.id == specialiteId);
    return specialite ? specialite.nom : '';
  }

  getAvailableMedecinsCount(): number {
    return this.medecins.filter(m => m.disponible).length;
  }

  getUnavailableMedecinsCount(): number {
    return this.medecins.filter(m => !m.disponible).length;
  }
}
