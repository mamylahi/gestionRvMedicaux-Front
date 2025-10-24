// src/app/services/statistique.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../environments/environment';

export interface StatistiquesAdmin {
  general: {
    total_patients: number;
    total_medecins: number;
    total_departements: number;
    total_specialites: number;
    medecins_disponibles: number;
    patients_ce_mois: number;
  };
  rendezvous: {
    total: number;
    aujourdhui: number;
    ce_mois: number;
    par_statut: { [key: string]: number };
    en_attente: number;
    confirmes: number;
    annules: number;
    termines: number;
    prochains_7_jours: number;
  };
  consultations: {
    total: number;
    ce_mois: number;
    cette_annee: number;
    aujourdhui: number;
    par_mois: { [key: string]: number };
  };
  financier: {
    revenu_total: number;
    revenu_ce_mois: number;
    revenu_cette_annee: number;
    revenu_aujourdhui: number;
    paiements_en_attente: number;
    montant_en_attente: number;
    par_moyen_paiement: { [key: string]: number };
    revenu_par_mois: { [key: string]: number };
  };
  medecins: {
    total: number;
    disponibles: number;
    indisponibles: number;
    par_specialite: { [key: string]: number };
    top_medecins: any[];
  };
  patients: {
    total: number;
    nouveaux_ce_mois: number;
    nouveaux_cette_annee: number;
    avec_dossier_medical: number;
    sans_dossier_medical: number;
    patients_actifs: number;
  };
  departements: {
    total: number;
    avec_specialites: number;
    specialites_par_departement: { [key: string]: number };
    medecins_par_departement: { [key: string]: number };
  };
}

@Injectable({
  providedIn: 'root'
})
export class StatistiqueService {
  private apiUrl = `${environment.apiUrl}/statistiques`;

  constructor(private http: HttpClient) { }

  getStatistiquesAdmin(): Observable<{success: boolean, data: StatistiquesAdmin}> {
    return this.http.get<{success: boolean, data: StatistiquesAdmin}>(`${this.apiUrl}/admin`);
  }

  getStatistiquesGenerales(): Observable<{success: boolean, data: any}> {
    return this.http.get<{success: boolean, data: any}>(`${this.apiUrl}/generales`);
  }

  getStatistiquesRendezVous(): Observable<{success: boolean, data: any}> {
    return this.http.get<{success: boolean, data: any}>(`${this.apiUrl}/rendezvous`);
  }

  getStatistiquesFinancieres(): Observable<{success: boolean, data: any}> {
    return this.http.get<{success: boolean, data: any}>(`${this.apiUrl}/financieres`);
  }

  getStatistiquesConsultations(): Observable<{success: boolean, data: any}> {
    return this.http.get<{success: boolean, data: any}>(`${this.apiUrl}/consultations`);
  }

  getStatistiquesMedecins(): Observable<{success: boolean, data: any}> {
    return this.http.get<{success: boolean, data: any}>(`${this.apiUrl}/medecins`);
  }

  getStatistiquesPatients(): Observable<{success: boolean, data: any}> {
    return this.http.get<{success: boolean, data: any}>(`${this.apiUrl}/patients`);
  }

  getStatistiquesDepartements(): Observable<{success: boolean, data: any}> {
    return this.http.get<{success: boolean, data: any}>(`${this.apiUrl}/departements`);
  }
}
