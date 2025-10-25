import { Component, OnInit } from '@angular/core';
import { PaiementService } from '../../../services/paiement.service';
import { AuthService } from '../../../services/auth.service'; //
import { Paiement } from '../../../models/paiement.model';
import { StatutPaiement } from '../../../models/enum';
import { CurrencyPipe, DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; //  pour la recherche
import { Router } from '@angular/router';
import {SecretaireService} from '../../../services/secretaire.service'; //  pour la navigation

@Component({
  selector: 'app-paiement',
  templateUrl: './paiement.component.html',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule
  ]
})
export class SecretairePaiementComponent implements OnInit {
  paiements: Paiement[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(
    private secretaireService: SecretaireService) {}

  ngOnInit(): void {
    this.loadPaiements();
  }

  loadPaiements(): void {
    this.loading = true;
    this.error = '';

    this.secretaireService.getPaiementsNonPayes().subscribe({
      next: (data) => {
        this.paiements = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des paiements';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  getMoyenPaiementIcon(moyen: string): string {
    switch (moyen) {
      case 'CARTE': return '💳';
      case 'ESPECES': return '💰';
      case 'CHEQUE': return '📄';
      case 'VIREMENT': return '🏦';
      default: return '💵';
    }
  }

  payerPaiement(paiement: Paiement): void {
    // Implémentez la logique de paiement ici
    console.log('Paiement à traiter:', paiement);
    alert(`Paiement de ${paiement.montant}€ en cours de traitement...`);
  }

  getTotalMontant(): number {
    return this.paiements.reduce((total, paiement) => total + paiement.montant, 0);
  }
}
