import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Disponibilite } from '../models/disponibilite.model';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DisponibiliteService {
  private URL = `${environment.apiUrl}/disponibilites`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Disponibilite[]>(this.URL);
  }

  getAllWithRelations() {
    return this.http.get<Disponibilite[]>(`${this.URL}?with=medecin.user`);
  }

  getById(id: string) {
    return this.http.get<Disponibilite>(`${this.URL}/${id}`);
  }

  create(data: any) {
    return this.http.post<Disponibilite>(this.URL, data);
  }

  update(id: string, data: any) {
    return this.http.put<Disponibilite>(`${this.URL}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<any>(`${this.URL}/${id}`);
  }

  getByMedecin(medecinId: string) {
    return this.http.get<Disponibilite[]>(`${this.URL}/medecin/${medecinId}/all`);
  }

  getByDateRange(startDate: string, endDate: string) {
    return this.http.get<Disponibilite[]>(`${this.URL}/range/search`, {
      params: { start_date: startDate, end_date: endDate }
    });
  }
}
