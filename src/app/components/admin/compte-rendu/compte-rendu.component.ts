import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CommonModule} from '@angular/common';
import {CompteRendu} from '../../../models/compterendu.model';
import {CompteRenduService} from '../../../services/compte-rendu.service';


@Component({
  selector: 'app-compte-rendu',
  templateUrl: './compte-rendu.component.html',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  providers: [ConfirmationService, MessageService]
})
export class CompteRenduComponent implements OnInit {
  comptesRendus: CompteRendu[] = [];
  filteredComptesRendus: CompteRendu[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private compteRenduService: CompteRenduService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadComptesRendus();
  }

  loadComptesRendus(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.compteRenduService.getAll().subscribe({
      next: (data) => {
        this.comptesRendus = data;
        this.filteredComptesRendus = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des comptes rendus';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredComptesRendus = this.comptesRendus;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredComptesRendus = this.comptesRendus.filter(cr =>
      cr.diagnostic?.toLowerCase().includes(term) ||
      cr.traitement?.toLowerCase().includes(term) ||
      cr.observation?.toLowerCase().includes(term)
    );
  }

  onAdd(): void {
    this.router.navigate(['/comptes-rendus/nouveau']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/comptes-rendus/modifier', id]);
  }

  onDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte rendu ?')) {
      this.compteRenduService.delete(id).subscribe({
        next: () => {
          this.loadComptesRendus();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression';
          console.error('Erreur:', error);
        }
      });
    }
  }

  onView(id: number): void {
    this.router.navigate(['/comptes-rendus/details', id]);
  }
}
