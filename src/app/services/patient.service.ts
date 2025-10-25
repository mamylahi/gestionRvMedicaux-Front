import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../environments/environment';
import { Patient } from '../models/patient.model';
import {Paiement} from '../models/paiement.model';
import {Consultation} from '../models/consultation.model';
import {DossierMedical} from '../models/dossiermedical.model';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private URL = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Patient[]>(this.URL);
  }

  getById(id: string) {
    return this.http.get<Patient>(`${this.URL}/${id}`);
  }

  update(id: string, data: any) {
    return this.http.put<Patient>(`${this.URL}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<any>(`${this.URL}/${id}`);
  }

  search(query: string) {
    return this.http.get<Patient[]>(`${this.URL}/search/query`, {
      params: { query }
    });
  }

  getDashboard(patientId: string) {
    return this.http.get<any>(`${this.URL}/${patientId}/dashboard`);
  }


  getMesRendezVous() {
    return this.http.get<any>(`${this.URL}/mes-rendezvous`).pipe(
      map((response: any) => response.data?.rendezvous || [])
    );
  }

  getMesPaiements() {
    return this.http.get<any>(`${this.URL}/mes-paiements`).pipe(
      map((response: any) => response.data?.paiements || [])
    );
  }

  getMesConsultations() {
    return this.http.get<any>(`${this.URL}/mes-consultations`).pipe(
      map((response: any) => response.data?.consultations || [])
    );
  }

  getMonDossierMedical() {
    return this.http.get<any>(`${this.URL}/mon-dossier-medical`);
  }
}
