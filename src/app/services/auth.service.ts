import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../environments/environment';
import {User} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private URL = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  register(data: any) {
    return this.http.post<any>(`${this.URL}/register`, data);
  }

  login(data: { email: string, password: string }) {
    return this.http.post<any>(`${this.URL}/login`, data);
  }

  logout() {
    return this.http.post<any>(`${this.URL}/logout`, {});
  }

  getAuthenticatedUser() {
    return this.http.get<any>(`${this.URL}/me`);
  }

  getAllUsers() {
    return this.http.get<any>(`${environment.apiUrl}/users`);
  }

  getUserById(id: number) {
    return this.http.get<any>(`${environment.apiUrl}/users/${id}`);
  }

  updateUser(id: number, data: any) {
    return this.http.put<any>(`${environment.apiUrl}/users/${id}`, data);
  }

  deleteUser(id: number) {
    return this.http.delete<any>(`${environment.apiUrl}/users/${id}`);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // AJOUT: Méthode pour récupérer l'utilisateur depuis le localStorage
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  // AJOUT: Méthode pour sauvegarder l'utilisateur dans le localStorage
  setCurrentUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // AJOUT: Méthode pour effacer l'utilisateur du localStorage
  clearCurrentUser(): void {
    localStorage.removeItem('user');
  }

}
