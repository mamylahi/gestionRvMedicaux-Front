import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass, NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Paiement} from '../../../models/paiement.model';
import {StatutPaiement} from '../../../models/enum';
import {PaiementService} from '../../../services/paiement.service';

@Component({
  selector: 'app-paiement',
  templateUrl: './paiement.component.html',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    NgFor,
    CommonModule,
    FormsModule
  ]
})
export class PaiementComponent implements OnInit {
  paiements: Paiement[] = [];
  statutEnum = StatutPaiement;

  // Variables pour les modales
  showModal = false;
  modalTitle = '';
  currentPaiement: Paiement = new Paiement();
  isEditMode = false;

  constructor(private paiementService: PaiementService) {}

  ngOnInit(): void {
    this.loadPaiements();
  }

  loadPaiements(): void {
    this.paiementService.getAll().subscribe({
      next: (data: any) => {
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
        this.paiements = [];
      }
    });
  }

  openAddModal(): void {
    this.modalTitle = 'Ajouter un paiement';
    this.currentPaiement = new Paiement();
    this.isEditMode = false;
    this.showModal = true;
  }

  openEditModal(paiement: Paiement): void {
    this.modalTitle = 'Modifier le paiement';
    this.currentPaiement = { ...paiement };
    this.isEditMode = true;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentPaiement = new Paiement();
  }

  savePaiement(): void {
    if (this.isEditMode) {
      // Modification
      this.paiementService.update(this.currentPaiement.id, this.currentPaiement).subscribe({
        next: () => {
          this.loadPaiements();
          this.closeModal();
        },
        error: (err) => console.error('Erreur de modification', err)
      });
    } else {
      // Ajout
      this.paiementService.create(this.currentPaiement).subscribe({
        next: () => {
          this.loadPaiements();
          this.closeModal();
        },
        error: (err) => console.error('Erreur de création', err)
      });
    }
  }

  deletePaiement(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce paiement ?')) {
      this.paiementService.delete(id).subscribe({
        next: () => this.loadPaiements(),
        error: (err) => console.error('Erreur de suppression', err)
      });
    }
  }

  // Helper pour obtenir les valeurs de l'énumération
  getStatutValues(): string[] {
    return Object.values(this.statutEnum);
  }

  // Ajoutez ces méthodes dans la classe PaiementComponent

  getValidatedCount(): number {
    return this.paiements.filter(p => p.statut === this.statutEnum.VALIDE).length;
  }

  getPendingCount(): number {
    return this.paiements.filter(p => p.statut === this.statutEnum.EN_ATTENTE).length;
  }
}
