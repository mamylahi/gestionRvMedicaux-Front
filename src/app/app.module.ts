import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule, provideClientHydration} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import {AuthInterceptor} from './interceptors/auth.interceptor';
import {AddConsultationComponent} from './components/admin/consultation/add-consultation.component';
import {ConsultationComponent} from './components/admin/consultation/consultation.component';
import {DepartementComponent} from './components/admin/departement/departement.component';
import {MedecinComponent} from './components/admin/medecin/medecin.component';
import { NavbarComponent} from './components/navbar/navbar.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {UserComponent} from './components/admin/users/user.component';
import {MedecinCompteRenduComponent} from './components/medecin/compte-rendu/compte-rendu.component';
import {MedecinConsultationComponent} from './components/medecin/consultation/consultation.component';
import {MedecinRendezVousComponent} from './components/medecin/rendez-vous/rendez-vous.component';
import {MedecinPatientComponent} from './components/medecin/patient/patient.component';
import {PatientConsultationComponent} from './components/patient/consultation/consultation.component';
import {PatientDossierMedicalComponent} from './components/patient/dossier-medical/dossier-medical.component';
import {PatientPaiementsComponent} from './components/patient/paiement/paiement.component';
import {PatientRendezVousComponent} from './components/patient/rendez-vous/rendez-vous.component';
import {ProfileComponent} from './components/profile/profile.component';
import {RendezvousComponent} from './components/secretaire/rendez-vous/rendez-vous.component';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,





  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CommonModule,
    AddConsultationComponent,
    ConsultationComponent,
    DepartementComponent,
    MedecinComponent,
    NavbarComponent,
    DashboardComponent,
    UserComponent,
    MedecinCompteRenduComponent,
    MedecinConsultationComponent,
    MedecinRendezVousComponent,
    MedecinPatientComponent,
    PatientConsultationComponent,
    PatientDossierMedicalComponent,
    PatientPaiementsComponent,
    PatientRendezVousComponent,
    ProfileComponent,
    RendezvousComponent




  ],
  providers: [
    provideClientHydration(),
    { provide: LOCALE_ID, useValue: 'fr-FR' },

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
