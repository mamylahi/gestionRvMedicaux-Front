import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//
// // Components
 import { AuthComponent } from './components/auth/auth.component';
// import { DashboardComponent } from './components/dashboard/dashboard.component';
//
// // Administration
 import { DepartementComponent } from './components/departement/departement.component';
 import { SpecialiteComponent } from './components/specialite/specialite.component';

// // Personnel Médical
 import { MedecinComponent } from './components/medecin/medecin.component';
 import { SecretaireComponent } from './components/secretaire/secretaire.component';
 import { PatientComponent } from './components/patient/patient.component';


import { RendezVousComponent } from './components/rendez-vous/rendez-vous.component';
 import { ConsultationComponent } from './components/consultation/consultation.component';
 import { AddConsultationComponent } from './components/consultation/add-consultation.component';
 import { CompteRenduComponent } from './components/compte-rendu/compte-rendu.component';
 import { DisponibiliteComponent } from './components/disponibilite/disponibilite.component';
 import { DossierMedicalComponent } from './components/dossier-medical/dossier-medical.component';import { PaiementComponent } from './components/paiement/paiement.component';
 import {AddDepartementComponent} from './components/departement/add-departement.component';
 import {AddSpecialiteComponent} from './components/specialite/add-specialite.component';
 import {AddMedecinComponent} from './components/medecin/add-medecin.component';
 import {AddRendezVousComponent} from './components/rendez-vous/add-rendez-vous.component';
 import {AddCompteRenduComponent} from './components/compte-rendu/add-compte-rendu.component';
 import {AddDisponibiliteComponent} from './components/disponibilite/add-disponibilite.component';
 import {AddDossierMedicalComponent} from './components/dossier-medical/add-dossier-medical.component';
 import {AddPaiementComponent} from './components/paiement/add-paiement.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {UserComponent} from './components/users/user.component';

const routes: Routes = [
  // Public routes
  { path: '', component: AuthComponent },
  { path: 'login', component: AuthComponent },

  { path: 'users', component: UserComponent },

  // Dashboard
  // { path: 'dashboard', component: DashboardComponent },
  //
  // // Administration
  { path: 'departements', component: DepartementComponent },
  { path: 'departements/add', component: AddDepartementComponent },
  { path: 'departements/edit/:id', component: AddDepartementComponent },

  { path: 'dashboard', component: DashboardComponent },

   { path: 'specialites', component: SpecialiteComponent },
  // { path: 'specialites/add', component: AddSpecialiteComponent },
  // { path: 'specialites/edit/:id', component: AddSpecialiteComponent },
  //
  // // Personnel Médical
   { path: 'medecins', component: MedecinComponent },
   { path: 'medecins/edit/:id', component: AddMedecinComponent },

  { path: 'secretaires', component: SecretaireComponent },
  { path: 'secretaires/edit/:id', component: SecretaireComponent },

  { path: 'patients', component: PatientComponent },
  { path: 'patients/edit/:id', component: PatientComponent },

  // Gestion des Consultations
  { path: 'rendez-vous', component: RendezVousComponent },
  { path: 'rendez-vous/add', component: AddRendezVousComponent },
  { path: 'rendez-vous/edit/:id', component: AddRendezVousComponent },

  { path: 'consultations', component: ConsultationComponent },
  { path: 'consultations/add', component: AddConsultationComponent },
  { path: 'consultations/edit/:id', component: AddConsultationComponent },

  { path: 'compte-rendus', component: CompteRenduComponent },
  { path: 'compte-rendus/add', component: AddCompteRenduComponent },
  { path: 'compte-rendus/edit/:id', component: AddCompteRenduComponent },

  { path: 'disponibilites', component: DisponibiliteComponent },
  { path: 'disponibilites/add', component: AddDisponibiliteComponent },
  { path: 'disponibilites/edit/:id', component: AddDisponibiliteComponent },

  // Dossiers Médicaux
  { path: 'dossiers-medicaux', component: DossierMedicalComponent },
  { path: 'dossiers-medicaux/add', component: AddDossierMedicalComponent },
  { path: 'dossiers-medicaux/edit/:id', component: AddDossierMedicalComponent },

  { path: 'paiements', component: PaiementComponent },
  { path: 'paiements/add', component: AddPaiementComponent },
  { path: 'paiements/edit/:id', component: AddPaiementComponent },

  // 404 - Page not found
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
