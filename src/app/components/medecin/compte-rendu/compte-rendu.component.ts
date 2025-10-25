import { Component, OnInit } from '@angular/core';
import { CompteRendu } from '../../../models/compterendu.model';
import { MedecinService } from '../../../services/medecin.service';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-compte-rendu',
  templateUrl: './compte-rendu.component.html',
  imports: [
    DatePipe,
    CommonModule
  ]
})
export class MedecinCompteRenduComponent implements OnInit {
  comptesRendus: CompteRendu[] = [];
  loading = false;
  errorMessage = '';

  constructor(private medecinService: MedecinService) { }

  ngOnInit(): void {
    this.loadCompteRenduPatients();
  }

  loadCompteRenduPatients(): void {
    this.loading = true;
    this.errorMessage = '';

    this.medecinService.getMesComptesRendus().subscribe({
      next: (data: CompteRendu[]) => {
        this.comptesRendus = data;
        this.loading = false;
        console.log(this.comptesRendus);
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des comptes rendus';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  voirCompteRendu(compteRenduId: number): void {
    console.log('Voir compte rendu:', compteRenduId);
  }

  telechargerCompteRendu(compteRenduId: number): void {
    console.log('Télécharger compte rendu:', compteRenduId);
  }

  modifierCompteRendu(compteRenduId: number): void {
    console.log('Modifier compte rendu:', compteRenduId);
  }
}
