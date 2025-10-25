import { Component, OnInit } from '@angular/core';
import { RendezVous } from '../../../models/rendezvous.model';
import { MedecinService } from '../../../services/medecin.service';
import { RendezVousStatut } from '../../../models/enum';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rendez-vous',
  templateUrl: './rendez-vous.component.html',
  imports: [
    DatePipe,
    NgIf,
    NgForOf,
    CommonModule
  ],
})
export class MedecinRendezVousComponent implements OnInit {
  rendezVous: RendezVous[] = [];
  loading = false;
  errorMessage = '';

  constructor(private medecinService: MedecinService) { }

  ngOnInit(): void {
    this.loadMesRendezVous();
  }

  loadMesRendezVous(): void {
    this.loading = true;
    this.errorMessage = '';

    this.medecinService.getMesRendezVous().subscribe({
      next: (data: RendezVous[]) => {
        this.rendezVous = data;
        console.log(this.rendezVous);
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des rendez-vous';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  getStatutClass(statut: RendezVousStatut): string {
    switch(statut) {
      case RendezVousStatut.CONFIRME: return 'statut-confirme';
      case RendezVousStatut.EN_ATTENTE: return 'statut-attente';
      case RendezVousStatut.ANNULE: return 'statut-annule';
      case RendezVousStatut.TERMINE: return 'statut-termine';
      default: return 'statut-default';
    }
  }

  getStatutText(statut: RendezVousStatut): string {
    switch(statut) {
      case RendezVousStatut.CONFIRME: return 'Confirmé';
      case RendezVousStatut.EN_ATTENTE: return 'En attente';
      case RendezVousStatut.ANNULE: return 'Annulé';
      case RendezVousStatut.TERMINE: return 'Terminé';
      default: return statut;
    }
  }

  confirmerRendezVous(rendezVousId: number): void {
    console.log('Confirmation du rendez-vous:', rendezVousId);
  }

  annulerRendezVous(rendezVousId: number): void {
    console.log('Annulation du rendez-vous:', rendezVousId);
  }

  protected readonly RendezVousStatut = RendezVousStatut;
}
