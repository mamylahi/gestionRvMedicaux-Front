import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Medecin } from '../models/medecin.model';
import { environment } from '../environments/environment';
import { Patient } from '../models/patient.model';
import { Paiement } from '../models/paiement.model';
import { Consultation } from '../models/consultation.model';
import { DossierMedical } from '../models/dossiermedical.model';
import { RendezVous } from '../models/rendezvous.model';
import { CompteRendu } from '../models/compterendu.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MedecinService {
  private URL = `${environment.apiUrl}/medecins`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<any>(this.URL);
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

  getMesRendezVous(): Observable<any> {
    return this.http.get<any>(`${this.URL}/mes-rendezvous`).pipe(
      map((response: any) => response.data?.rendezvous || [])
    );
  }

  getMesPatients(): Observable<Patient[]> {
    return this.http.get<any>(`${this.URL}/mes-patients`).pipe(
      map((response: any) => response.data?.patients || [])
    );
  }

  getMesConsultations(): Observable<Consultation[]> {
    return this.http.get<any>(`${this.URL}/mes-consultations`).pipe(
      map((response: any) => response.data?.consultations || [])
    );
  }

  getMesDossiersMedicaux(): Observable<DossierMedical[]> {
    return this.http.get<any>(`${this.URL}/mes-dossiers-medicaux`).pipe(
      map((response: any) => response.data?.dossiers_medicaux || [])
    );
  }

  getMesComptesRendus(): Observable<CompteRendu[]> {
    return this.http.get<any>(`${this.URL}/mes-comptes-rendus`).pipe(
      map((response: any) => response.data?.comptes_rendus || [])
    );
  }
}
