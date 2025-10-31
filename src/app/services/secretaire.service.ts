// secretaire.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Secretaire } from '../models/secretaire.model';
import { environment } from '../environments/environment';
import { RendezVous } from '../models/rendezvous.model';
import { Paiement } from '../models/paiement.model';
import { DossierMedical } from '../models/dossiermedical.model';

@Injectable({
  providedIn: 'root'
})
export class SecretaireService {
  private URL = `${environment.apiUrl}/secretaires`;

  constructor(private http: HttpClient) { }

  /**
   * Récupérer tous les secrétaires
   */
  getAll(): Observable<Secretaire[]> {
    return this.http.get<Secretaire[]>(this.URL);
  }

  /**
   * Récupérer un secrétaire par ID
   */
  getById(id: string): Observable<Secretaire> {
    return this.http.get<Secretaire>(`${this.URL}/${id}`);
  }

  create(secretaireData: any): Observable<any> {
    // NE PAS envoyer user_id - le backend doit le créer automatiquement
    const payload = {
      nom: secretaireData.nom,
      prenom: secretaireData.prenom,
      email: secretaireData.email,
      telephone: secretaireData.telephone || null,
      adresse: secretaireData.adresse || null,
      numero_employe: secretaireData.numero_employe || null,
      password: secretaireData.password,
      password_confirmation: secretaireData.password_confirmation
      // PAS de role ici - doit être géré côté backend
    };

    return this.http.post<any>(this.URL, payload);
  }

  /**
   * Mettre à jour un secrétaire
   */
  update(id: string, secretaireData: any): Observable<Secretaire> {
    const payload: any = {
      nom: secretaireData.nom,
      prenom: secretaireData.prenom,
      email: secretaireData.email,
      telephone: secretaireData.telephone || null,
      adresse: secretaireData.adresse || null,
      numero_employe: secretaireData.numero_employe || null
    };

    // Ajouter le mot de passe seulement s'il est fourni
    if (secretaireData.password && secretaireData.password.trim()) {
      payload.password = secretaireData.password;
      payload.password_confirmation = secretaireData.password_confirmation;
    }

    return this.http.put<Secretaire>(`${this.URL}/${id}`, payload);
  }

  /**
   * Supprimer un secrétaire
   */
  deleteSecretaire(id: number): Observable<any> {
    return this.http.delete<any>(`${this.URL}/${id}`);
  }

  /**
   * Rechercher des secrétaires
   */
  search(query: string): Observable<Secretaire[]> {
    return this.http.get<Secretaire[]>(`${this.URL}/search/query`, {
      params: { query }
    });
  }

  /**
   * Récupérer le dashboard d'un secrétaire
   */
  getDashboard(secretaireId: string): Observable<any> {
    return this.http.get<any>(`${this.URL}/${secretaireId}/dashboard`);
  }

  /**
   * Récupérer les rendez-vous à venir
   */
  getRendezVousAVenir(): Observable<RendezVous[]> {
    return this.http.get<any>(`${this.URL}/mes-rendezvous`).pipe(
      map((response: any) => response.data?.rendezvous_a_venir || [])
    );
  }

  /**
   * Récupérer tous les rendez-vous du secrétaire
   */
  getMesRendezVous(): Observable<RendezVous[]> {
    return this.http.get<any>(`${this.URL}/mes-rendezvous`).pipe(
      map((response: any) => response.data?.rendezvous || [])
    );
  }

  /**
   * Récupérer les paiements non payés
   */
  getPaiementsNonPayes(): Observable<Paiement[]> {
    return this.http.get<any>(`${this.URL}/paiements`).pipe(
      map((response: any) => response.data?.paiements_non_payes || [])
    );
  }

  /**
   * Récupérer tous les paiements
   */
  getMesPaiements(): Observable<Paiement[]> {
    return this.http.get<any>(`${this.URL}/mes-paiements`).pipe(
      map((response: any) => response.data?.paiements || [])
    );
  }

  /**
   * Récupérer les dossiers médicaux
   */
  getDossiersMedicaux(): Observable<DossierMedical[]> {
    return this.http.get<any>(`${this.URL}/dossier-medicaux`).pipe(
      map((response: any) => response.data?.dossiers_medicaux || [])
    );
  }

  /**
   * Récupérer les consultations gérées
   */
  getMesConsultations(): Observable<any[]> {
    return this.http.get<any>(`${this.URL}/mes-consultations`).pipe(
      map((response: any) => response.data?.consultations || [])
    );
  }

  /**
   * Générer un numéro d'employé automatique (méthode utilitaire côté client)
   */
  generateNumeroEmploye(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `SEC-${year}${month}${random}`;
  }

  /**
   * Vérifier si un email existe déjà
   */
  checkEmailExists(email: string): Observable<any> {
    return this.http.get<any>(`${this.URL}/check-email`, {
      params: { email }
    });
  }

  /**
   * Vérifier si un numéro d'employé existe déjà
   */
  checkNumeroEmployeExists(numeroEmploye: string): Observable<any> {
    return this.http.get<any>(`${this.URL}/check-numero`, {
      params: { numero_employe: numeroEmploye }
    });
  }

  /**
   * Options HTTP (si vous avez besoin d'ajouter des headers personnalisés)
   */
  private getHttpOptions() {
    const token = localStorage.getItem('auth_token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }
}
