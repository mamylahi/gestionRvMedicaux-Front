import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { Disponibilite } from '../../../models/disponibilite.model';
import { Medecin } from '../../../models/medecin.model';
import { DisponibiliteService } from '../../../services/disponibilite.service';
import { MedecinService } from '../../../services/medecin.service';
declare var Swal: any;

@Component({
  selector: 'app-disponibilite',
  templateUrl: './disponibilite.component.html',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    CommonModule
  ]
})
export class DisponibiliteComponent implements OnInit {
  disponibilites: Disponibilite[] = [];
  filteredDisponibilites: Disponibilite[] = [];
  medecins: Medecin[] = [];
  searchTerm: string = '';
  selectedMedecinId: string = '';
  startDate: string = '';
  endDate: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private disponibiliteService: DisponibiliteService,
    private medecinService: MedecinService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMedecins();
    this.loadDisponibilites();
  }

  loadMedecins(): void {
    this.medecinService.getAll().subscribe({
      next: (data: any) => {
        this.medecins = data.data || data || [];
        console.log('Médecins chargés:', this.medecins);
      },
      error: (error) => {
        console.error('Erreur chargement médecins:', error);
        this.errorMessage = 'Erreur lors du chargement des médecins';
      }
    });
  }

  loadDisponibilites(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Utiliser getAllWithRelations pour charger les relations
    this.disponibiliteService.getAllWithRelations().subscribe({
      next: (data: any) => {
        const disponibilites = data.data || data || [];
        this.disponibilites = Array.isArray(disponibilites) ? disponibilites : [disponibilites];
        this.filteredDisponibilites = this.disponibilites;
        this.isLoading = false;
        console.log('Disponibilités chargées:', this.disponibilites);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des disponibilités';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onSearch(): void {
    let filtered = this.disponibilites;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(d => {
        const medecinName = this.getMedecinName(d).toLowerCase();
        return medecinName.includes(term);
      });
    }

    if (this.selectedMedecinId) {
      filtered = filtered.filter(d =>
        d.medecin_id?.toString() === this.selectedMedecinId
      );
    }

    this.filteredDisponibilites = filtered;
  }

  onFilterByMedecin(): void {
    if (!this.selectedMedecinId) {
      this.loadDisponibilites();
      return;
    }

    this.isLoading = true;
    this.disponibiliteService.getByMedecin(this.selectedMedecinId).subscribe({
      next: (data: any) => {
        const disponibilites = data.data || data || [];
        this.disponibilites = Array.isArray(disponibilites) ? disponibilites : [disponibilites];
        this.filteredDisponibilites = this.disponibilites;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du filtrage';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onFilterByDateRange(): void {
    if (!this.startDate || !this.endDate) {
      Swal.fire({
        title: 'Attention !',
        text: 'Veuillez sélectionner une plage de dates',
        icon: 'warning',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'px-6 py-3 rounded-xl font-semibold'
        }
      });
      return;
    }

    this.isLoading = true;
    this.disponibiliteService.getByDateRange(this.startDate, this.endDate).subscribe({
      next: (data: any) => {
        const disponibilites = data.data || data || [];
        this.disponibilites = Array.isArray(disponibilites) ? disponibilites : [disponibilites];
        this.filteredDisponibilites = this.disponibilites;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du filtrage par dates';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onResetFilters(): void {
    this.searchTerm = '';
    this.selectedMedecinId = '';
    this.startDate = '';
    this.endDate = '';
    this.errorMessage = '';
    this.loadDisponibilites();
  }

  onAdd(): void {
    this.router.navigate(['/disponibilites/add']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/disponibilites/modifier', id]);
  }

  onDelete(id: number): void {
    Swal.fire({
      title: 'Supprimer la disponibilité ?',
      html: `
        <p class="text-gray-600 mb-4">Cette action est irréversible.</p>
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p class="text-red-800 text-sm">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            La disponibilité sera définitivement supprimée.
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '<i class="fas fa-trash mr-2"></i> Oui, supprimer',
      cancelButtonText: 'Annuler',
      background: '#fff',
      backdrop: 'rgba(0,0,0,0.4)',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-6 py-3 rounded-xl font-semibold',
        cancelButton: 'px-6 py-3 rounded-xl font-semibold',
        htmlContainer: 'text-left'
      }
    }).then((result: { isConfirmed: any; }) => {
      if (result.isConfirmed) {
        this.disponibiliteService.delete(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Supprimé !',
              text: 'La disponibilité a été supprimée avec succès',
              icon: 'success',
              confirmButtonColor: '#3b82f6',
              confirmButtonText: 'OK',
              timer: 3000,
              customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'px-6 py-3 rounded-xl font-semibold'
              }
            });
            this.loadDisponibilites();
          },
          error: (error) => {
            Swal.fire({
              title: 'Erreur !',
              text: 'Erreur lors de la suppression de la disponibilité',
              icon: 'error',
              confirmButtonColor: '#ef4444',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'px-6 py-3 rounded-xl font-semibold'
              }
            });
            console.error('Erreur:', error);
          }
        });
      }
    });
  }

  onView(id: number): void {
    this.router.navigate(['/disponibilites/details', id]);
  }

  getMedecinName(disponibilite: Disponibilite): string {
    // Essayer d'abord avec la relation chargée
    if (disponibilite.medecin?.user) {
      const nom = disponibilite.medecin.user.nom || '';
      const prenom = disponibilite.medecin.user.prenom || '';
      return `Dr. ${nom} ${prenom}`.trim();
    }

    // Fallback: chercher dans la liste des médecins chargés
    const medecin = this.medecins.find(m => m.id === disponibilite.medecin_id);
    if (medecin?.user) {
      const nom = medecin.user.nom || '';
      const prenom = medecin.user.prenom || '';
      return `Dr. ${nom} ${prenom}`.trim();
    }

    console.log("Disponibilité sans médecin trouvé:", disponibilite);
    return 'Médecin inconnu';
  }

  getInitials(disponibilite: Disponibilite): string {
    const name = this.getMedecinName(disponibilite);
    if (name === 'Médecin inconnu') return '??';

    const parts = name.replace('Dr. ', '').trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  isExpired(dateDebut: Date | string): boolean {
    const date = new Date(dateDebut);
    const now = new Date();
    return date < now;
  }

  isActive(dateDebut: Date | string, dateFin: Date | string): boolean {
    const now = new Date();
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    return debut <= now && fin >= now;
  }
}
