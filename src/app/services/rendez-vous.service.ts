import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RendezVous } from '../models/rendezvous.model';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RendezVousService {
  private URL = `${environment.apiUrl}/rendezvous`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<RendezVous[]>(this.URL);
  }

  getById(id: string) {
    return this.http.get<RendezVous>(`${this.URL}/${id}`);
  }

  create(data: any) {
    return this.http.post<RendezVous>(this.URL, data);
  }

  update(id: string, data: any) {
    return this.http.put<RendezVous>(`${this.URL}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<any>(`${this.URL}/${id}`);
  }

  getByPatient(patientId: string) {
    return this.http.get<RendezVous[]>(`${this.URL}/patient/${patientId}/all`);
  }

  getByMedecin(medecinId: string) {
    return this.http.get<RendezVous[]>(`${this.URL}/medecin/${medecinId}/all`);
  }

  getByDate(date: string) {
    return this.http.get<RendezVous[]>(`${this.URL}/date/${date}/all`);
  }

  updateStatut(id: string, statut: string) {
    return this.http.patch<RendezVous>(`${this.URL}/${id}/statut`, { statut });
  }

  // AJOUT: Méthode pour récupérer les RendezVous du patient connecté
  getMesRendezVous() {
    return this.http.get<any[]>(`${environment.apiUrl}/mes-rendezvous`);
  }
}
