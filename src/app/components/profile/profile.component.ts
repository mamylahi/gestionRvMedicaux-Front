import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PatientService } from '../../services/patient.service';
import { MedecinService } from '../../services/medecin.service';
import { SecretaireService } from '../../services/secretaire.service';
import { UserRole } from '../../models/enum';
import { catchError, finalize, of } from 'rxjs';

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

    // ✅ Charger l'utilisateur depuis localStorage en premier (plus rapide)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
        console.log('User loaded from localStorage:', this.currentUser);

        // Charger les détails spécifiques au rôle
        this.loadRoleSpecificData();

        // Rafraîchir en arrière-plan (optionnel)
        this.refreshUserFromAPI();
      } catch (e) {
        console.error('Error parsing stored user:', e);
        this.loadUserFromAPI();
      }
    } else {
      this.loadUserFromAPI();
    }
  }

  private loadUserFromAPI(): void {
    this.authService.getAuthenticatedUser().pipe(
      catchError(error => {
        console.error('Error loading profile:', error);
        this.errorMessage = 'Erreur lors du chargement du profil';
        this.isLoading = false;
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        this.currentUser = response.data || response.user || response;
        console.log('User loaded from API:', this.currentUser);

        if (this.currentUser) {
          this.loadRoleSpecificData();
        } else {
          this.errorMessage = 'Utilisateur non authentifié';
          this.isLoading = false;
        }
      }
    });
  }

  private refreshUserFromAPI(): void {
    // Rafraîchir silencieusement en arrière-plan
    this.authService.getAuthenticatedUser().pipe(
      catchError(error => {
        console.error('Background refresh failed:', error);
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        const refreshedUser = response.data || response.user || response;
        if (refreshedUser) {
          this.currentUser = refreshedUser;
          localStorage.setItem('user', JSON.stringify(refreshedUser));
        }
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
    this.patientService.getAll().pipe(
      finalize(() => this.isLoading = false),
      catchError(error => {
        console.error('Error loading patient data:', error);
        return of({ data: [] });
      })
    ).subscribe(response => {
      console.log('Patients loaded:', response);

      let patients: any[] = this.extractDataArray(response);
      console.log('Patients array:', patients);

      this.userDetails = patients.find((p: any) =>
        p.user_id === this.currentUser.id || p.id === this.currentUser.id
      );

      console.log('User details found:', this.userDetails);
    });
  }

  loadMedecinData(): void {
    this.medecinService.getAll().pipe(
      finalize(() => this.isLoading = false),
      catchError(error => {
        console.error('Error loading medecin data:', error);
        return of({ data: [] });
      })
    ).subscribe(response => {
      console.log('Medecins loaded:', response);

      let medecins: any[] = this.extractDataArray(response);
      console.log('Medecins array:', medecins);

      this.userDetails = medecins.find((m: any) =>
        m.user_id === this.currentUser.id || m.id === this.currentUser.id
      );

      console.log('User details found:', this.userDetails);
    });
  }

  loadSecretaireData(): void {
    this.secretaireService.getAll().pipe(
      finalize(() => this.isLoading = false),
      catchError(error => {
        console.error('Error loading secretaire data:', error);
        return of({ data: [] });
      })
    ).subscribe(response => {
      console.log('Secretaires loaded:', response);

      let secretaires: any[] = this.extractDataArray(response);
      console.log('Secretaires array:', secretaires);

      this.userDetails = secretaires.find((s: any) =>
        s.user_id === this.currentUser.id || s.id === this.currentUser.id
      );

      console.log('User details found:', this.userDetails);
    });
  }

  // ✅ Fonction utilitaire pour extraire les données d'un tableau
  private extractDataArray(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    } else if (response?.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response?.patients && Array.isArray(response.patients)) {
      return response.patients;
    } else if (response?.medecins && Array.isArray(response.medecins)) {
      return response.medecins;
    } else if (response?.secretaires && Array.isArray(response.secretaires)) {
      return response.secretaires;
    }
    return [];
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
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Date invalide';
    }
  }

  getInitials(): string {
    const prenom = this.currentUser?.prenom || '';
    const nom = this.currentUser?.nom || '';
    const initials = (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
    return initials || '??';
  }
}
