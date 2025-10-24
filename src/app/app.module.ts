import { NgModule } from '@angular/core';
import {BrowserModule, provideClientHydration} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import {AuthInterceptor} from './interceptors/auth.interceptor';
import {AddConsultationComponent} from './components/consultation/add-consultation.component';
import {ConsultationComponent} from './components/consultation/consultation.component';
import {DepartementComponent} from './components/departement/departement.component';
import {AddDepartementComponent} from './components/departement/add-departement.component';
import {MedecinComponent} from './components/medecin/medecin.component';
import { NavbarComponent} from './components/navbar/navbar.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {UserComponent} from './components/users/user.component';

@NgModule({
  declarations: [
    AppComponent,





  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AddConsultationComponent,
    ConsultationComponent,
    DepartementComponent,
    AddDepartementComponent,
    MedecinComponent,
    NavbarComponent,
    DashboardComponent,
    UserComponent


  ],
  providers: [
    provideClientHydration(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
