import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../environments/environment';
import {CompteRendu} from '../models/compterendu.model';

@Injectable({
  providedIn: 'root'
})
export class CompteRenduService {
  private URL = `${environment.apiUrl}/compterendus`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<CompteRendu[]>(this.URL);
  }

  getById(id: string) {
    return this.http.get<CompteRendu>(`${this.URL}/${id}`);
  }

  create(data: any) {
    return this.http.post<CompteRendu>(this.URL, data);
  }

  update(id: string, data: any) {
    return this.http.put<CompteRendu>(`${this.URL}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<any>(`${this.URL}/${id}`);
  }

  getByConsultation(consultationId: string) {
    return this.http.get<CompteRendu>(`${this.URL}/consultation/${consultationId}/single`);
  }

  getByMedecin(medecinId: string) {
    return this.http.get<CompteRendu[]>(`${this.URL}/medecin/${medecinId}/all`);
  }

  getByPatient(patientId: string) {
    return this.http.get<CompteRendu[]>(`${this.URL}/patient/${patientId}/all`);
  }
}
