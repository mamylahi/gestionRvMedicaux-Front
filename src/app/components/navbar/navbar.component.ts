import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',  // ✅ CORRECTION: Changé de app-sidebar à app-navbar
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  isMedecin: boolean = false;
  isSecretaire: boolean = false;
  isPatient: boolean = false;

  userName: string = '';
  userEmail: string = '';
  userRole: string = '';
  userRoleLabel: string = '';

  isCollapsed: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkAuthentication();
    this.getUserInfo();

    // ✅ AJOUT: Écouter les changements de route pour rafraîchir l'état
    this.router.events.subscribe(() => {
      this.checkAuthentication();
      if (this.isLoggedIn && !this.userName) {
        this.getUserInfo();
      }
    });
  }

  checkAuthentication() {
    this.isLoggedIn = this.authService.isAuthenticated();
  }

  getUserInfo() {
    if (!this.isLoggedIn) {
      this.authService.getAuthenticatedUser().subscribe({
        next: (user) => {
          console.log('User data received in navbar:', user);
          // ✅ CORRECTION: Gérer les cas où nom/prenom sont undefined
          this.userName = (user.data.nom && user.data.prenom)
            ? `${user.data.nom} ${user.data.prenom}`
            : (user.data.name || 'Utilisateur');
          this.userEmail = user.data.email || '';
          this.userRole = user.data.role;
          this.setUserRole(user.data.role);
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des informations utilisateur:', error);
          // ✅ AJOUT: En cas d'erreur, déconnecter l'utilisateur
          if (error.status === 401) {
            this.logout();
          }
        }
      });
    }else {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.userName = (currentUser.nom && currentUser.prenom)
          ? `${currentUser.nom} ${currentUser.prenom}`
          : (currentUser.nom || 'Utilisateur');
        this.userEmail = currentUser.email || '';
        this.userRole = currentUser.role;
        this.setUserRole(currentUser.role);
      }
    }
  }

  setUserRole(role: string) {
    this.isAdmin = role === 'admin';
    this.isMedecin = role === 'medecin';
    this.isSecretaire = role === 'secretaire';
    this.isPatient = role === 'patient';

    switch(role) {
      case 'admin':
        this.userRoleLabel = 'Administrateur';
        break;
      case 'medecin':
        this.userRoleLabel = 'Médecin';
        break;
      case 'secretaire':
        this.userRoleLabel = 'Secrétaire';
        break;
      case 'patient':
        this.userRoleLabel = 'Patient';
        break;
      default:
        this.userRoleLabel = 'Utilisateur';
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('access_token');
        this.isLoggedIn = false;
        this.userName = '';
        this.userRole = '';
        this.router.navigateByUrl('/login');
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
        // Même en cas d'erreur, nettoyer le localStorage
        localStorage.removeItem('access_token');
        this.isLoggedIn = false;
        this.userName = '';
        this.userRole = '';
        this.router.navigateByUrl('/login');
      }
    });
  }
}
