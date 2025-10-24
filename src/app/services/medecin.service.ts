import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Medecin } from '../models/medecin.model';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedecinService {
  private URL = `${environment.apiUrl}/medecins`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<any>(this.URL); // ✅ Retourner any pour gérer la structure
  }

  getBySpecialite(specialiteId: string) {
    return this.http.get<any>(`${this.URL}/specialite/${specialiteId}`);
  }

  getDisponibles() {
    return this.http.get<any>(`${this.URL}/disponibles/all`);
  }

  getById(id: string) {
    return this.http.get<Medecin>(`${this.URL}/${id}`);
  }

  update(id: string, data: any) {
    return this.http.put<Medecin>(`${this.URL}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<any>(`${this.URL}/${id}`);
  }


  getDashboard(medecinId: string) {
    return this.http.get<any>(`${this.URL}/${medecinId}/dashboard`);
  }
}
