import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RendezVous } from '../../../models/rendezvous.model';
import { RendezVousStatut } from '../../../models/enum';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { MedecinService } from '../../../services/medecin.service'; // ✅ AJOUT
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../services/patient.service';
import {SecretaireService} from '../../../services/secretaire.service';

@Component({
  selector: 'app-rendez-vous',
  templateUrl: './rendez-vous.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ]
})
export class SecretaireRendezVousComponent implements OnInit {
  rendezVous: RendezVous[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(
    private secretaireService: SecretaireService,) {}

  ngOnInit(): void {
    this.loadRendezVous();
  }

  loadRendezVous(): void {
    this.loading = true;
    this.error = '';

    this.secretaireService.getRendezVousAVenir().subscribe({
      next: (data) => {
        this.rendezVous = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des rendez-vous';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'CONFIRME': return 'statut-confirme';
      case 'ANNULE': return 'statut-annule';
      case 'EN_ATTENTE': return 'statut-attente';
      default: return 'statut-default';
    }
  }
}
