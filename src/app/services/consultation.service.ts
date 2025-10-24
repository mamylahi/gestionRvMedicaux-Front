import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Consultation } from '../models/consultation.model';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private URL = `${environment.apiUrl}/consultations`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Consultation[]>(this.URL);
  }

  getById(id: string) {
    return this.http.get<Consultation>(`${this.URL}/${id}`);
  }

  create(data: any) {
    return this.http.post<Consultation>(this.URL, data);
  }

  update(id: string, data: any) {
    return this.http.put<Consultation>(`${this.URL}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<any>(`${this.URL}/${id}`);
  }

  getByRendezVous(rendezVousId: string) {
    return this.http.get<Consultation>(`${this.URL}/rendezvous/${rendezVousId}/single`);
  }

  getByMedecin(medecinId: string) {
    return this.http.get<Consultation[]>(`${this.URL}/medecin/${medecinId}/all`);
  }

  getByPatient(patientId: string) {
    return this.http.get<Consultation[]>(`${this.URL}/patient/${patientId}/all`);
  }
}
