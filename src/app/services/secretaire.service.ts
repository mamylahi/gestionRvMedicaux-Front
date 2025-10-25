import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Secretaire } from '../models/secretaire.model';
import {environment} from '../environments/environment';
import {RendezVous} from '../models/rendezvous.model';
import {Patient} from '../models/patient.model';
import {Consultation} from '../models/consultation.model';
import {DossierMedical} from '../models/dossiermedical.model';
import {Paiement} from '../models/paiement.model';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SecretaireService {
  private URL = `${environment.apiUrl}/secretaires`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Secretaire[]>(this.URL);
  }

  getById(id: string) {
    return this.http.get<Secretaire>(`${this.URL}/${id}`);
  }

  update(id: string, data: any) {
    return this.http.put<Secretaire>(`${this.URL}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<any>(`${this.URL}/${id}`);
  }

  getRendezVousAVenir() {
    return this.http.get<any>(`${this.URL}/mes-rendezvous`).pipe(
      map((response: any) => response.data?.rendezvous_a_venir || [])
    );
  }

  getPaiementsNonPayes() {
    return this.http.get<any>(`${this.URL}/paiements`).pipe(
      map((response: any) => response.data?.paiements_non_payes || [])
    );
  }

  getDossiersMedicaux() {
    return this.http.get<any>(`${this.URL}/dossier-medicaux`).pipe(
      map((response: any) => response.data?.dossiers_medicaux || [])
    );
  }
}
