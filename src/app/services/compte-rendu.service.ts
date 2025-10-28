import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { CompteRendu } from '../models/compterendu.model';

@Injectable({
  providedIn: 'root'
})
export class CompteRenduService {
  private URL = `${environment.apiUrl}/compterendus`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les comptes rendus
   */
  getAll(): Observable<CompteRendu[]> {
    return this.http.get<CompteRendu[]>(this.URL);
  }

  /**
   * Récupérer un compte rendu par son ID
   */
  getById(id: string): Observable<CompteRendu> {
    return this.http.get<CompteRendu>(`${this.URL}/${id}`);
  }

  /**
   * Créer un nouveau compte rendu
   */
  create(data: any): Observable<CompteRendu> {
    return this.http.post<CompteRendu>(this.URL, data);
  }

  /**
   * Mettre à jour un compte rendu
   */
  update(id: string, data: any): Observable<CompteRendu> {
    return this.http.put<CompteRendu>(`${this.URL}/${id}`, data);
  }

  /**
   * Supprimer un compte rendu
   */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.URL}/${id}`);
  }

  /**
   * Récupérer le compte rendu d'une consultation spécifique
   */
  getByConsultation(consultationId: string): Observable<CompteRendu> {
    return this.http.get<CompteRendu>(`${this.URL}/consultation/${consultationId}/single`);
  }

  /**
   * Récupérer tous les comptes rendus d'un médecin
   */
  getByMedecin(medecinId: string): Observable<CompteRendu[]> {
    return this.http.get<CompteRendu[]>(`${this.URL}/medecin/${medecinId}/all`);
  }

  /**
   * Récupérer tous les comptes rendus d'un patient
   */
  getByPatient(patientId: string): Observable<CompteRendu[]> {
    return this.http.get<CompteRendu[]>(`${this.URL}/patient/${patientId}/all`);
  }

  /**
   * Télécharger un compte rendu en PDF
   * Si votre backend supporte cette fonctionnalité
   */
  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.URL}/${id}/pdf`, {
      responseType: 'blob'
    });
  }

  /**
   * Alternative: Générer un PDF côté client si le backend ne le supporte pas
   */
  generatePdfClient(compteRendu: CompteRendu): void {
    // Cette méthode nécessiterait une bibliothèque comme jsPDF
    // Exemple d'implémentation à adapter selon vos besoins
    console.log('Génération PDF pour:', compteRendu);
  }
}
