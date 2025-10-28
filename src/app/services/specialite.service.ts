import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Specialite } from '../models/specialite.model';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpecialiteService {
  private URL = `${environment.apiUrl}/specialites`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Specialite[]>(this.URL);
  }

  getById(id: string) {
    return this.http.get<Specialite>(`${this.URL}/${id}`);
  }

  create(data: any) {
    return this.http.post<Specialite>(this.URL, data);
  }

  update(id: number, data: any) {
    return this.http.put<Specialite>(`${this.URL}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<any>(`${this.URL}/${id}`);
  }
}
