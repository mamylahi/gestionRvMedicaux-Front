import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DossierMedical } from '../models/dossiermedical.model';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DossierMedicalService {
  private URL = `${environment.apiUrl}/dossiermedicaux`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<DossierMedical[]>(this.URL);
  }

  getById(id: string) {
    return this.http.get<DossierMedical>(`${this.URL}/${id}`);
  }

  create(data: any) {
    return this.http.post<DossierMedical>(this.URL, data);
  }

  update(id: string, data: any) {
    return this.http.put<DossierMedical>(`${this.URL}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<any>(`${this.URL}/${id}`);
  }

  getByPatient(patientId: string) {
    return this.http.get<DossierMedical>(`${this.URL}/patient/${patientId}/single`);
  }
}
