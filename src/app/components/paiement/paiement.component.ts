import { Component, OnInit } from '@angular/core';
import { PaiementService } from '../../services/paiement.service';
import { Paiement } from '../../models/paiement.model';
import { StatutPaiement } from '../../models/enum';
import { CurrencyPipe, DatePipe, NgClass, NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paiement',
  templateUrl: './paiement.component.html',
  standalone: true,
  imports: [
    NgClass,
    CurrencyPipe,
    DatePipe,
    NgFor,
    CommonModule
  ]
})
export class PaiementComponent implements OnInit {
  paiements: Paiement[] = []; // ✅ S'assurer que c'est toujours un tableau
  statutEnum = StatutPaiement;

  constructor(private paiementService: PaiementService) {}

  ngOnInit(): void {
    this.loadPaiements();
  }

  loadPaiements(): void {
    this.paiementService.getAll().subscribe({
      next: (data: any) => {
        // ✅ CORRECTION: S'assurer que c'est un tableau
        if (data && data.data) {
          this.paiements = Array.isArray(data.data) ? data.data : [data.data];
        } else if (Array.isArray(data)) {
          this.paiements = data;
        } else {
          this.paiements = [];
        }
        console.log('Paiements chargés:', this.paiements);
      },
      error: (err) => {
        console.error('Erreur de chargement des paiements', err);
        this.paiements = []; // ✅ S'assurer que c'est un tableau même en cas d'erreur
      }
    });
  }

  deletePaiement(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce paiement ?')) {
      this.paiementService.delete(id).subscribe({
        next: () => this.loadPaiements(),
        error: (err) => console.error('Erreur de suppression', err)
      });
    }
  }
}
