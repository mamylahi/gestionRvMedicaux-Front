import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/enum';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
})
export class AuthComponent implements OnInit {
  submitted = false;
  showLogin = true;
  isLoading = false;

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  registerForm: FormGroup = new FormGroup({
    nom: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    prenom: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(255)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password_confirmation: new FormControl('', [Validators.required]),
    telephone: new FormControl('', [Validators.maxLength(20)]),
    role: new FormControl(UserRole.PATIENT, [Validators.required]),
    adresse: new FormControl('', [Validators.maxLength(255)])
  });

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  switchMode(): void {
    this.showLogin = !this.showLogin;
    this.submitted = false;
  }

  login(): void {
    this.submitted = true;
    if (this.loginForm.invalid) return;

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;

        // ✅ CORRECTION: Accéder aux données via response.data
        if (response.data && response.data.access_token) {
          localStorage.setItem('access_token', response.data.access_token);
          localStorage.setItem('user', JSON.stringify(response.data.user));

          console.log('Connexion réussie:', response);
          console.log('Token stocké:', response.data.access_token);
          console.log('Utilisateur stocké:', response.data.user);

          // 🎉 Afficher la notification SweetAlert2 au centre
          Swal.fire({
            icon: 'success',
            title: 'Connexion réussie !',
            text: `Bienvenue ${response.data.user.prenom || response.data.user.nom || ''}`,
            confirmButtonText: 'Continuer',
            confirmButtonColor: '#3B82F6',
            timer: 3000,
            timerProgressBar: true,
            position: 'center',
            showClass: {
              popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutUp'
            }
          }).then(() => {
            this.router.navigate(['/dashboard']);
          });
        } else {
          console.error('Structure de réponse invalide:', response);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Structure de réponse invalide',
            confirmButtonColor: '#3B82F6',
            position: 'center'
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur login:', error);

        // ✅ Gestion améliorée des erreurs avec SweetAlert
        const errorMessage = error.error?.message || 'Erreur de connexion. Veuillez vérifier vos identifiants.';

        Swal.fire({
          icon: 'error',
          title: 'Échec de connexion',
          text: errorMessage,
          confirmButtonColor: '#3B82F6',
          confirmButtonText: 'Réessayer',
          position: 'center'
        });
      }
    });
  }

  register(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulaire incomplet',
        text: 'Veuillez remplir tous les champs requis correctement',
        confirmButtonColor: '#3B82F6',
        position: 'center'
      });
      return;
    }

    // Vérification de la confirmation du mot de passe
    if (this.registerForm.value.password !== this.registerForm.value.password_confirmation) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Les mots de passe ne correspondent pas',
        confirmButtonColor: '#3B82F6',
        position: 'center'
      });
      return;
    }

    this.isLoading = true;

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;

        // ✅ CORRECTION: Accéder aux données via response.data
        if (response.data && response.data.access_token) {
          localStorage.setItem('access_token', response.data.access_token);
          localStorage.setItem('user', JSON.stringify(response.data.user));

          console.log('Inscription réussie:', response);

          // 🎉 Afficher la notification SweetAlert2 au centre
          Swal.fire({
            icon: 'success',
            title: 'Inscription réussie !',
            text: `Bienvenue ${response.data.user.prenom || response.data.user.nom || ''}`,
            confirmButtonText: 'Continuer',
            confirmButtonColor: '#3B82F6',
            timer: 3000,
            timerProgressBar: true,
            position: 'center',
            showClass: {
              popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutUp'
            }
          }).then(() => {
            this.router.navigate(['/medecins']);
          });
        } else {
          console.error('Structure de réponse invalide:', response);
          Swal.fire({
            icon: 'warning',
            title: 'Attention',
            text: 'Inscription réussie mais structure de réponse invalide',
            confirmButtonColor: '#3B82F6',
            position: 'center'
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur register:', error);

        // ✅ Gestion améliorée des erreurs avec SweetAlert
        const errorMessage = error.error?.message || 'Erreur lors de l\'inscription';

        Swal.fire({
          icon: 'error',
          title: 'Échec de l\'inscription',
          text: errorMessage,
          confirmButtonColor: '#3B82F6',
          confirmButtonText: 'Réessayer',
          position: 'center'
        });
      }
    });
  }

  // Getters pour accéder facilement aux contrôles du formulaire login
  get loginEmail() { return this.loginForm.get('email'); }
  get loginPassword() { return this.loginForm.get('password'); }

  // Getters pour accéder facilement aux contrôles du formulaire register
  get registerNom() { return this.registerForm.get('nom'); }
  get registerPrenom() { return this.registerForm.get('prenom'); }
  get registerEmail() { return this.registerForm.get('email'); }
  get registerPassword() { return this.registerForm.get('password'); }
  get registerPasswordConfirmation() { return this.registerForm.get('password_confirmation'); }
  get registerRole() { return this.registerForm.get('role'); }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }
}
