import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Paiement } from '../models/paiement.model';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  private URL = `${environment.apiUrl}/paiements`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<any>(this.URL);
  }

  getById(id: number) {
    return this.http.get<Paiement>(`${this.URL}/${id}`);
  }

  create(data: any) {
    return this.http.post<Paiement>(this.URL, data);
  }

  update(id: number, data: Paiement) {
    return this.http.put<Paiement>(`${this.URL}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<any>(`${this.URL}/${id}`);
  }

  getByConsultation(consultationId: string) {
    return this.http.get<Paiement>(`${this.URL}/consultation/${consultationId}/single`);
  }

  getByPatient(patientId: string) {
    return this.http.get<Paiement[]>(`${this.URL}/patient/${patientId}/all`);
  }

  updateStatut(id: string, statut: string) {
    return this.http.patch<Paiement>(`${this.URL}/${id}/statut`, { statut });
  }

  getAllWithRelations() {
    return this.http.get<Paiement[]>(`${this.URL}?with=consultation.rendezvous.patient.user`);
  }

  // AJOUT: Méthode pour récupérer les paiements du patient connecté
  getMesPaiements() {
    return this.http.get<Paiement[]>(`${this.URL}/mes-paiements`);
  }
}
