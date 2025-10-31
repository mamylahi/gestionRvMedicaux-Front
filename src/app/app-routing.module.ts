import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//
// // Components
 import { AuthComponent } from './components/auth/auth.component';
// import { DashboardComponent } from './components/dashboard/dashboard.component';
//
// // Administration
 import { DepartementComponent } from './components/admin/departement/departement.component';
 import { SpecialiteComponent } from './components/admin/specialite/specialite.component';

// // Personnel Médical
 import { MedecinComponent } from './components/admin/medecin/medecin.component';
 import { SecretaireComponent } from './components/admin/secretaire/secretaire.component';
 import { PatientComponent } from './components/admin/patient/patient.component';


import { RendezvousComponent } from './components/secretaire/rendez-vous/rendez-vous.component';
 import { ConsultationComponent } from './components/admin/consultation/consultation.component';
 import { AddConsultationComponent } from './components/admin/consultation/add-consultation.component';
 import { CompteRenduComponent } from './components/admin/compte-rendu/compte-rendu.component';
 import { DisponibiliteComponent } from './components/secretaire/disponibilite/disponibilite.component';
 import { DossierMedicalComponent } from './components/secretaire/dossier-medical/dossier-medical.component';import { PaiementComponent } from './components/secretaire/paiement/paiement.component';
 import {AddRendezVousComponent} from './components/secretaire/rendez-vous/add-rendez-vous.component';
 import {AddCompteRenduComponent} from './components/medecin/compte-rendu/add-compte-rendu.component';
 import {AddDisponibiliteComponent} from './components/secretaire/disponibilite/add-disponibilite.component';
 import {AddDossierMedicalComponent} from './components/secretaire/dossier-medical/add-dossier-medical.component';
 import {AddPaiementComponent} from './components/secretaire/paiement/add-paiement.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {UserComponent} from './components/admin/users/user.component';
import {MedecinCompteRenduComponent} from './components/medecin/compte-rendu/compte-rendu.component';
import {MedecinConsultationComponent} from './components/medecin/consultation/consultation.component';
import {MedecinDossierMedicalComponent} from './components/medecin/dossier-medical/dossier-medical.component';
import {MedecinRendezVousComponent} from './components/medecin/rendez-vous/rendez-vous.component';
import {MedecinPatientComponent} from './components/medecin/patient/patient.component';
import {PatientConsultationComponent} from './components/patient/consultation/consultation.component';
import {PatientDossierMedicalComponent} from './components/patient/dossier-medical/dossier-medical.component';
import {PatientPaiementsComponent} from './components/patient/paiement/paiement.component';
import {PatientRendezVousComponent} from './components/patient/rendez-vous/rendez-vous.component';
import {ProfileComponent} from './components/profile/profile.component';

const routes: Routes = [

  // Public routes
  { path: '', component: AuthComponent },
  { path: 'login', component: AuthComponent },
  { path: 'users', component: UserComponent },

   // Administration
  { path: 'departements', component: DepartementComponent },
  { path: 'dashboard', component: DashboardComponent },
   { path: 'specialites', component: SpecialiteComponent },


   // Personnel Médical
   { path: 'medecins', component: MedecinComponent },
  { path: 'secretaires', component: SecretaireComponent },
  { path: 'secretaires/edit/:id', component: SecretaireComponent },
  { path: 'patients', component: PatientComponent },
  { path: 'patients/edit/:id', component: PatientComponent },

  // Nouvelles routes pour les données du patient connecté
  { path: 'mes-pat-rendezvous', component: PatientRendezVousComponent },
  { path: 'mes-pat-paiements', component: PatientPaiementsComponent },
  { path: 'mes-pat-consultations', component: PatientConsultationComponent },
  { path: 'mon-pat-dossier-medical', component: PatientDossierMedicalComponent },

  // Nouvelles routes pour les données du medecin connecté
  { path: 'mes-rv', component: MedecinRendezVousComponent },
  { path: 'mes-med-patients', component: MedecinPatientComponent },
  { path: 'mes-med-consultations', component: MedecinConsultationComponent },
  { path: 'dossier-med-medicaux', component: MedecinDossierMedicalComponent },
  { path: 'compte-med-rendus', component: MedecinCompteRenduComponent },
  {path: 'medecin/compte-rendu/add', component: AddCompteRenduComponent, data: { title: 'Nouveau Compte Rendu' }},
  {path: 'medecin/compte-rendu/edit/:id', component: AddCompteRenduComponent, data: { title: 'Modifier Compte Rendu' }},

  // // Voir les détails d'un compte rendu (optionnel)
  // {
  //   path: 'medecin/comptes-rendus/:id',
  //   component: MedecinCompteRenduComponent, // ou un composant de détails dédié
  //   data: { title: 'Détails Compte Rendu' }
  // }



  // // Nouvelles routes pour les données du secretaire connecté
  // { path: 'mes-sec-rendezvous', component: SecretaireRendezVousComponent },
  // { path: 'rendez-vous/add', component: AddRendezVousComponent},
  // { path: 'rendez-vous/edit/:id', component: AddRendezVousComponent},
  // { path: 'sec-paiements', component: SecretairePaiementComponent },
  // { path: 'sec-dossier-medicaux', component: SecretaireDossierMedicalComponent },


  // Gestion des Consultations
  { path: 'rendez-vous', component: RendezvousComponent },
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


  { path: 'profile', component: ProfileComponent },

  // 404 - Page not found
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
