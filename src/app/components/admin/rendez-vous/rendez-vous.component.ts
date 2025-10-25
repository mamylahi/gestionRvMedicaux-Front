import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RendezVous } from '../../../../../../../../../OneDrive/Desktop/gestionRvMedicaux-Front/gestionRvMedicaux-Front/gestionRvMedicaux-Front/src/app/models/rendezvous.model';
import { RendezVousStatut } from '../../../../../../../../../OneDrive/Desktop/gestionRvMedicaux-Front/gestionRvMedicaux-Front/gestionRvMedicaux-Front/src/app/models/enum';
import { RendezVousService } from '../../../../../../../../../OneDrive/Desktop/gestionRvMedicaux-Front/gestionRvMedicaux-Front/gestionRvMedicaux-Front/src/app/services/rendez-vous.service';
import { CommonModule } from '@angular/common';  // ✅ AJOUTEZ CECI
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-rendez-vous',
  templateUrl: './rendez-vous.component.html',
  standalone: true,
  imports: [
    CommonModule,  // ✅ AJOUTEZ CECI pour *ngIf, *ngFor, date pipe, etc.
    FormsModule,
  ]
})
export class RendezVousComponent implements OnInit {
  rendezVous: RendezVous[] = [];
  filteredRendezVous: RendezVous[] = [];
  searchTerm: string = '';
  selectedStatut: string = '';
  selectedDate: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  statuts = [
    { value: RendezVousStatut.EN_ATTENTE, label: 'En attente', color: 'warning' },
    { value: RendezVousStatut.CONFIRME, label: 'Confirmé', color: 'info' },
    { value: RendezVousStatut.TERMINE, label: 'Terminé', color: 'success' },
    { value: RendezVousStatut.ANNULE, label: 'Annulé', color: 'danger' }
  ];

  constructor(
    private rendezVousService: RendezVousService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRendezVous();
  }

  loadRendezVous(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.rendezVousService.getAll().subscribe({
      next: (data: RendezVous[]) => {
        this.rendezVous = data;
        this.filteredRendezVous = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des rendez-vous';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onSearch(): void {
    let filtered = this.rendezVous;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(rdv =>
        rdv.patient?.user?.nom?.toLowerCase().includes(term) ||
        rdv.patient?.user?.prenom?.toLowerCase().includes(term) ||
        rdv.medecin?.user?.nom?.toLowerCase().includes(term) ||
        rdv.motif?.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatut) {
      filtered = filtered.filter(rdv => rdv.statut === this.selectedStatut);
    }

    if (this.selectedDate) {
      filtered = filtered.filter(rdv => {
        const rdvDate = new Date(rdv.date_rendezvous).toISOString().split('T')[0];
        return rdvDate === this.selectedDate;
      });
    }

    this.filteredRendezVous = filtered;
  }

  onResetFilters(): void {
    this.searchTerm = '';
    this.selectedStatut = '';
    this.selectedDate = '';
    this.loadRendezVous();
  }

  onAdd(): void {
    this.router.navigate(['/rendez-vous/nouveau']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/rendez-vous/modifier', id]);
  }

  onDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      this.rendezVousService.delete(id).subscribe({
        next: () => {
          this.loadRendezVous();
        },
        error: (error: any) => {
          this.errorMessage = 'Erreur lors de la suppression';
          console.error('Erreur:', error);
        }
      });
    }
  }

  onView(id: number): void {
    this.router.navigate(['/rendez-vous/details', id]);
  }

  onUpdateStatut(id: number, statut: string): void {
    this.rendezVousService.updateStatut(id.toString(), statut).subscribe({
      next: () => {
        this.loadRendezVous();
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors de la mise à jour du statut';
        console.error('Erreur:', error);
      }
    });
  }

  getPatientName(rdv: RendezVous): string {
    if (rdv.patient?.user) {
      return `${rdv.patient.user.nom} ${rdv.patient.user.prenom}`;
    }
    return 'Patient inconnu';
  }

  getMedecinName(rdv: RendezVous): string {
    if (rdv.medecin?.user) {
      return `Dr. ${rdv.medecin.user.nom} ${rdv.medecin.user.prenom}`;
    }
    return 'Médecin inconnu';
  }

  getStatutBadgeClass(statut: string): string {
    const statutObj = this.statuts.find(s => s.value === statut);
    return statutObj ? `bg-${statutObj.color}` : 'bg-secondary';
  }

  getStatutLabel(statut: string): string {
    const statutObj = this.statuts.find(s => s.value === statut);
    return statutObj ? statutObj.label : statut;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    const rdvDate = new Date(date);
    return rdvDate.toDateString() === today.toDateString();
  }

  isPast(date: Date): boolean {
    const today = new Date();
    const rdvDate = new Date(date);
    today.setHours(0, 0, 0, 0);
    rdvDate.setHours(0, 0, 0, 0);
    return rdvDate < today;
  }

  getRendezVousToday(): number {
    return this.filteredRendezVous.filter(rdv => this.isToday(rdv.date_rendezvous)).length;
  }

  getRendezVousByStatut(statut: string): number {
    return this.filteredRendezVous.filter(rdv => rdv.statut === statut).length;
  }

  protected readonly RendezVousStatut = RendezVousStatut;
}
