import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Departement } from '../models/departement.model';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepartementService {
  private URL = `${environment.apiUrl}/departements`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Departement[]>(this.URL);
  }

  getById(id: string) {
    return this.http.get<Departement>(`${this.URL}/${id}`);
  }

  create(data: any) {
    return this.http.post<Departement>(this.URL, data);
  }

    update(id: number, data: any) {
    return this.http.put<Departement>(`${this.URL}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<any>(`${this.URL}/${id}`);
  }
}
