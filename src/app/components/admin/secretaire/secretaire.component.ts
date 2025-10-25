import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SecretaireService } from '../../../../../../../../../OneDrive/Desktop/gestionRvMedicaux-Front/gestionRvMedicaux-Front/gestionRvMedicaux-Front/src/app/services/secretaire.service';
import { Secretaire } from '../../../../../../../../../OneDrive/Desktop/gestionRvMedicaux-Front/gestionRvMedicaux-Front/gestionRvMedicaux-Front/src/app/models/secretaire.model';

@Component({
  selector: 'app-secretaire',
  templateUrl: './secretaire.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class SecretaireComponent implements OnInit {
  secretaires: Secretaire[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(private secretaireService: SecretaireService) {}

  ngOnInit(): void {
    this.loadSecretaires();
  }

  loadSecretaires(): void {
    this.loading = true;
    this.secretaireService.getAll().subscribe({
      next: (response: any) => {
        // Gérer la réponse selon la structure de votre API
        this.secretaires = Array.isArray(response) ? response : (response.data || []);
        this.loading = false;
        console.log('Secretaires loaded:', this.secretaires);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des secrétaires:', error);
        this.error = 'Erreur lors du chargement des secrétaires';
        this.loading = false;
      }
    });
  }

  getInitials(secretaire: Secretaire): string {
    const nom = secretaire.user?.nom || '';
    const prenom = secretaire.user?.prenom || '';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  getFullName(secretaire: Secretaire): string {
    return `${secretaire.user?.prenom || ''} ${secretaire.user?.nom || ''}`.trim();
  }

  getEmail(secretaire: Secretaire): string {
    return secretaire.user?.email || 'Email non disponible';
  }

  getTelephone(secretaire: Secretaire): string {
    return secretaire.user?.telephone || 'Non renseigné';
  }

  getAdresse(secretaire: Secretaire): string {
    return secretaire.user?.adresse || 'Adresse non renseignée';
  }

  getStatusColor(disponible: boolean): string {
    return disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getStatusText(disponible: boolean): string {
    return disponible ? 'Disponible' : 'Indisponible';
  }

  getCreatedDate(secretaire: Secretaire): string {
    if (secretaire.created_at) {
      return new Date(secretaire.created_at).toLocaleDateString('fr-FR', {
        month: '2-digit',
        year: 'numeric'
      });
    }
    return 'Date inconnue';
  }
}
