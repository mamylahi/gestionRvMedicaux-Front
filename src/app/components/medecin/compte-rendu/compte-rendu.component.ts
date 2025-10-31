import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CompteRendu } from '../../../models/compterendu.model';
import { MedecinService } from '../../../services/medecin.service';
import { CompteRenduService } from '../../../services/compte-rendu.service';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import {AddCompteRenduComponent} from './add-compte-rendu.component';

@Component({
  selector: 'app-compte-rendu',
  templateUrl: './compte-rendu.component.html',
  imports: [DatePipe, CommonModule, AddCompteRenduComponent]
})
export class MedecinCompteRenduComponent implements OnInit {
  comptesRendus: CompteRendu[] = [];
  loading = false;
  errorMessage = '';
  showModal = false;
  isEditMode = false;
  selectedCompteRenduId: number | null = null;
  consultations: any[] = [];

  constructor(
    private medecinService: MedecinService,
    private compteRenduService: CompteRenduService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCompteRenduPatients();
    this.loadConsultations();
  }

  loadCompteRenduPatients(): void {
    this.loading = true;
    this.errorMessage = '';

    this.medecinService.getMesComptesRendus().subscribe({
      next: (data: CompteRendu[]) => {
        this.comptesRendus = data;
        this.loading = false;
        console.log('Comptes rendus chargés:', this.comptesRendus);
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des comptes rendus';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  loadConsultations(): void {
    this.medecinService.getMesConsultations().subscribe({
      next: (data: any[]) => {
        // Récupérer toutes les consultations sans filtrage
        this.consultations = data;
        console.log('Toutes les consultations chargées:', this.consultations);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des consultations:', error);
      }
    });
  }

  ajouterCompteRendu(): void {
    this.isEditMode = false;
    this.selectedCompteRenduId = null;
    this.showModal = true;
  }

  voirCompteRendu(compteRenduId: number): void {
    this.router.navigate(['/medecin/comptes-rendus', compteRenduId]);
  }

  modifierCompteRendu(compteRenduId: number): void {
    this.isEditMode = true;
    this.selectedCompteRenduId = compteRenduId;
    this.showModal = true;
  }

  telechargerCompteRendu(compteRenduId: number): void {
    this.compteRenduService.downloadPdf(compteRenduId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `compte-rendu-${compteRenduId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement:', error);
        this.errorMessage = 'Erreur lors du téléchargement du PDF';
      }
    });
  }

  supprimerCompteRendu(compteRenduId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte rendu ?')) {
      this.compteRenduService.delete(compteRenduId).subscribe({
        next: () => {
          this.loadCompteRenduPatients();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.errorMessage = 'Erreur lors de la suppression du compte rendu';
        }
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCompteRenduId = null;
    this.isEditMode = false;
  }

  onModalSuccess(): void {
    this.closeModal();
    this.loadCompteRenduPatients();
    this.loadConsultations();
  }
}
