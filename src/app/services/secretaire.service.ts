import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Secretaire } from '../models/secretaire.model';
import {environment} from '../environments/environment';

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
}
