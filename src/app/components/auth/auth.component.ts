import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/enum';
import { CommonModule } from '@angular/common';

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

          this.router.navigate(['/dashboard']);
        } else {
          console.error('Structure de réponse invalide:', response);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur login:', error);

        // ✅ Gestion améliorée des erreurs
        if (error.error && error.error.message) {
          alert('Erreur: ' + error.error.message);
        } else {
          alert('Erreur de connexion');
        }
      }
    });
  }

  register(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    // Vérification de la confirmation du mot de passe
    if (this.registerForm.value.password !== this.registerForm.value.password_confirmation) {
      alert('Les mots de passe ne correspondent pas');
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
          this.router.navigate(['/medecins']);
        } else {
          console.error('Structure de réponse invalide:', response);
          alert('Inscription réussie mais structure de réponse invalide');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur register:', error);

        // ✅ Gestion améliorée des erreurs
        if (error.error && error.error.message) {
          alert('Erreur: ' + error.error.message);
        } else {
          alert('Erreur lors de l\'inscription');
        }
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
