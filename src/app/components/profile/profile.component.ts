import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PatientService } from '../../services/patient.service';
import { MedecinService } from '../../services/medecin.service';
import { SecretaireService } from '../../services/secretaire.service';
import { UserRole } from '../../models/enum';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: any = null;
  userDetails: any = null;
  isLoading = true;
  errorMessage = '';
  UserRole = UserRole;

  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private medecinService: MedecinService,
    private secretaireService: SecretaireService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getAuthenticatedUser().subscribe({
      next: (response) => {
        console.log('Authenticated user response:', response);
        // La réponse peut avoir différentes structures
        this.currentUser = response.data || response.user || response;

        console.log('Current user after extraction:', this.currentUser);

        if (this.currentUser) {
          this.loadRoleSpecificData();
        } else {
          this.errorMessage = 'Utilisateur non authentifié';
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement du profil';
        this.isLoading = false;
        console.error('Error loading profile:', error);
      }
    });
  }

  loadRoleSpecificData(): void {
    const role = this.currentUser?.role;

    switch (role) {
      case UserRole.PATIENT:
        this.loadPatientData();
        break;
      case UserRole.MEDECIN:
        this.loadMedecinData();
        break;
      case UserRole.SECRETAIRE:
        this.loadSecretaireData();
        break;
      case UserRole.ADMIN:
        this.isLoading = false;
        break;
      default:
        this.isLoading = false;
    }
  }

  loadPatientData(): void {
    // Option 1: Si vous avez une méthode getById
    // this.patientService.getById(this.currentUser.id).subscribe({...})

    // Option 2: Récupérer tous et filtrer
    this.patientService.getAll().subscribe({
      next: (patients) => {
        console.log('Patients loaded:', patients);
        this.userDetails = patients.find((p: any) =>
          p.user_id === this.currentUser.id || p.id === this.currentUser.id
        );
        console.log('User details found:', this.userDetails);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading patient data:', error);
        this.isLoading = false;
      }
    });
  }

  loadMedecinData(): void {
    this.medecinService.getAll().subscribe({
      next: (response) => {
        console.log('Medecins loaded:', response);
        const medecins = response.data || response;
        this.userDetails = medecins.find((m: any) =>
          m.user_id === this.currentUser.id || m.id === this.currentUser.id
        );
        console.log('User details found:', this.userDetails);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading medecin data:', error);
        this.isLoading = false;
      }
    });
  }

  loadSecretaireData(): void {
    this.secretaireService.getAll().subscribe({
      next: (secretaires) => {
        console.log('Secretaires loaded:', secretaires);
        this.userDetails = secretaires.find((s: any) =>
          s.user_id === this.currentUser.id || s.id === this.currentUser.id
        );
        console.log('User details found:', this.userDetails);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading secretaire data:', error);
        this.isLoading = false;
      }
    });
  }

  getRoleLabel(): string {
    switch (this.currentUser?.role) {
      case UserRole.ADMIN: return 'Administrateur';
      case UserRole.MEDECIN: return 'Médecin';
      case UserRole.PATIENT: return 'Patient';
      case UserRole.SECRETAIRE: return 'Secrétaire';
      default: return 'Utilisateur';
    }
  }

  getRoleColor(): string {
    switch (this.currentUser?.role) {
      case UserRole.ADMIN: return 'bg-purple-100 text-purple-800';
      case UserRole.MEDECIN: return 'bg-blue-100 text-blue-800';
      case UserRole.PATIENT: return 'bg-green-100 text-green-800';
      case UserRole.SECRETAIRE: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getInitials(): string {
    const prenom = this.currentUser?.prenom || '';
    const nom = this.currentUser?.nom || '';
    return (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
  }
}
