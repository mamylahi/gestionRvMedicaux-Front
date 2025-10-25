import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StatistiqueService, StatistiquesAdmin } from '../../services/statistique.service';
import { MedecinService } from '../../services/medecin.service';
import { PatientService } from '../../services/patient.service';
import { RendezVousService } from '../../services/rendez-vous.service';
import { ConsultationService } from '../../services/consultation.service';
import { PaiementService } from '../../services/paiement.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class DashboardComponent implements OnInit {
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  isMedecin: boolean = false;
  isSecretaire: boolean = false;
  isPatient: boolean = false;
  userName: string = '';
  userRole: string = '';

  dashboardData: any = {};
  statistiquesAdmin?: StatistiquesAdmin;
  loading: boolean = true;

  constructor(
    private authService: AuthService,
    private statistiqueService: StatistiqueService,
    private medecinService: MedecinService,
    private patientService: PatientService,
    private rendezVousService: RendezVousService,
    private consultationService: ConsultationService,
    private paiementService: PaiementService
  ) {}

  ngOnInit() {
    this.checkAuthentication();
    this.getUserInfo();
  }

  checkAuthentication() {
    this.isLoggedIn = this.authService.isAuthenticated();
    console.log('Is Logged In:', this.isLoggedIn);
  }

  getUserInfo() {
    if (this.isLoggedIn) {
      this.authService.getAuthenticatedUser().subscribe({
        next: (user) => {
          console.log('User data received in dashboard:', user);
          this.userName = (user.data.nom && user.data.prenom)
            ? `${user.data.nom} ${user.data.prenom}`
            : (user.data.name || 'Utilisateur');
          this.userRole = user.data.role;
          this.setUserRole(user.data.role);
          this.loadDashboardData(user);
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des informations utilisateur:', error);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  setUserRole(role: string) {
    this.isAdmin = role === 'admin';
    this.isMedecin = role === 'medecin';
    this.isSecretaire = role === 'secretaire';
    this.isPatient = role === 'patient';
    console.log('User Role Set:', { isAdmin: this.isAdmin, isMedecin: this.isMedecin, isSecretaire: this.isSecretaire, isPatient: this.isPatient });
  }

  loadDashboardData(user: any) {
    console.log('Loading dashboard data for role:', user.data.role);

    if (this.isAdmin) {
      this.loadAdminDashboard();
    } else if (this.isMedecin) {
      this.loadMedecinDashboard(user.data.id || user.id);
    } else if (this.isSecretaire) {
      this.loadSecretaireDashboard();
    } else if (this.isPatient) {
      this.loadPatientDashboard(user.data.id || user.id);
    } else {
      this.loading = false;
    }
  }

  loadAdminDashboard() {
    console.log('Loading admin dashboard with statistics...');

    this.statistiqueService.getStatistiquesAdmin().subscribe({
      next: (response) => {
        console.log('Admin statistics loaded:', response);

        if (response.success && response.data) {
          this.statistiquesAdmin = response.data;
          this.dashboardData = {
            totalUsers: response.data.general.total_medecins + response.data.general.total_patients,
            totalMedecins: response.data.general.total_medecins,
            totalPatients: response.data.general.total_patients,
            totalRendezVous: response.data.rendezvous.total,
            medecinsDisponibles: response.data.general.medecins_disponibles,
            rdvAujourdhui: response.data.rendezvous.aujourdhui,
            rdvEnAttente: response.data.rendezvous.en_attente,
            revenuTotal: response.data.financier.revenu_total,
            revenuCeMois: response.data.financier.revenu_ce_mois,
            consultationsCeMois: response.data.consultations.ce_mois,
            nouveauxPatients: response.data.patients.nouveaux_ce_mois,
            rdvConfirmes: response.data.rendezvous.confirmes,
            rdvAnnules: response.data.rendezvous.annules,
            rdvTermines: response.data.rendezvous.termines
          };
        } else {
          this.setDefaultAdminData();
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading admin statistics:', error);
        this.setDefaultAdminData();
        this.loading = false;
      }
    });
  }

  private setDefaultAdminData() {
    this.dashboardData = {
      totalUsers: 0,
      totalMedecins: 0,
      totalPatients: 0,
      totalRendezVous: 0,
      medecinsDisponibles: 0,
      rdvAujourdhui: 0,
      rdvEnAttente: 0,
      revenuTotal: 0,
      revenuCeMois: 0,
      consultationsCeMois: 0,
      nouveauxPatients: 0,
      rdvConfirmes: 0,
      rdvAnnules: 0,
      rdvTermines: 0
    };
  }

  loadMedecinDashboard(medecinId: string) {
    console.log('Loading medecin dashboard for ID:', medecinId);

    forkJoin({
      rendezVous: this.rendezVousService.getByMedecin(medecinId).pipe(catchError(() => of([] as any))),
      consultations: this.consultationService.getByMedecin(medecinId).pipe(catchError(() => of([] as any))),
      patients: this.rendezVousService.getByMedecin(medecinId).pipe(catchError(() => of([] as any)))
    }).subscribe({
      next: (data: any) => {
        console.log('Medecin dashboard data:', data);

        const today = new Date().toDateString();
        const rendezVousData: any = data.rendezVous || [];
        const consultationsData: any = data.consultations || [];
        const patientsData: any = data.patients || [];

        const rendezVousArray = Array.isArray(rendezVousData) ? rendezVousData : (rendezVousData.data || []);
        const consultationsArray = Array.isArray(consultationsData) ? consultationsData : (consultationsData.data || []);
        const patientsArray = Array.isArray(patientsData) ? patientsData : (patientsData.data || []);

        const rdvAujourdhui = rendezVousArray.filter((rv: any) =>
          new Date(rv.date_rendezvous || rv.date).toDateString() === today
        );

        const rdvEnAttente = rendezVousArray.filter((rv: any) =>
          rv.statut === 'en_attente' || rv.statut === 'confirmé'
        );

        const prochainRdv = rendezVousArray
          .filter((rv: any) => new Date(rv.date_rendezvous || rv.date) >= new Date())
          .sort((a: any, b: any) => new Date(a.date_rendezvous || a.date).getTime() - new Date(b.date_rendezvous || b.date).getTime())[0];

        this.dashboardData = {
          rdvAujourdhui: rdvAujourdhui.length,
          totalPatients: patientsArray.length,
          totalConsultations: consultationsArray.length,
          rdvEnAttente: rdvEnAttente.length,
          prochainRendezVous: prochainRdv || null
        };

        console.log('Medecin dashboard data processed:', this.dashboardData);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement dashboard médecin:', error);
        this.dashboardData = {
          rdvAujourdhui: 0,
          totalPatients: 0,
          totalConsultations: 0,
          rdvEnAttente: 0,
          prochainRendezVous: null
        };
        this.loading = false;
      }
    });
  }

  loadSecretaireDashboard() {
    console.log('Loading secretaire dashboard...');

    forkJoin({
      rendezVous: this.rendezVousService.getAll().pipe(catchError(() => of([] as any))),
      paiements: this.paiementService.getAll().pipe(catchError(() => of([] as any)))
    }).subscribe({
      next: (data: any) => {
        console.log('Secretaire data loaded:', data);

        const today = new Date().toDateString();
        const rendezVousData: any = data.rendezVous || [];
        const paiementsData: any = data.paiements || [];

        const rendezVousArray = Array.isArray(rendezVousData) ? rendezVousData : (rendezVousData.data || []);
        const paiementsArray = Array.isArray(paiementsData) ? paiementsData : (paiementsData.data || []);

        const rdvAujourdhui = rendezVousArray.filter((rv: any) =>
          new Date(rv.date_rendezvous || rv.date).toDateString() === today
        );

        const paiementsEnAttente = paiementsArray.filter((p: any) =>
          p.statut === 'en_attente' || p.statut === 'pending'
        );

        this.dashboardData = {
          totalRendezVous: rendezVousArray.length,
          rendezVousAujourdhui: rdvAujourdhui.length,
          paiementsEnAttente: paiementsEnAttente.length,
          totalPaiements: paiementsArray.length
        };

        console.log('Secretaire dashboard data:', this.dashboardData);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement dashboard secrétaire:', error);
        this.dashboardData = {
          totalRendezVous: 0,
          rendezVousAujourdhui: 0,
          paiementsEnAttente: 0,
          totalPaiements: 0
        };
        this.loading = false;
      }
    });
  }

  loadPatientDashboard(patientId: string) {
    console.log('Loading patient dashboard for ID:', patientId);

    // Utilisez le service PatientService au lieu des services individuels
    forkJoin({
      dashboard: this.patientService.getDashboard(patientId).pipe(catchError(() => of({ data: { statistiques: {}, prochain_rendez_vous: null } }))),
      rendezVous: this.patientService.getMesRendezVous().pipe(catchError(() => of([]))),
      consultations: this.patientService.getMesConsultations().pipe(catchError(() => of([]))),
      paiements: this.patientService.getMesPaiements().pipe(catchError(() => of([])))
    }).subscribe({
      next: (data: any) => {
        console.log('Patient dashboard data:', data);

        const dashboardData = data.dashboard?.data || {};
        const statistiques = dashboardData.statistiques || {};

        this.dashboardData = {
          mesRendezVous: statistiques.mes_rendez_vous || data.rendezVous.length || 0,
          mesConsultations: statistiques.mes_consultations || data.consultations.length || 0,
          ordonnances: statistiques.ordonnances || 0,
          mesPaiements: statistiques.mes_paiements || data.paiements.length || 0,
          prochainRendezVous: dashboardData.prochain_rendez_vous || null
        };

        console.log('Patient dashboard data processed:', this.dashboardData);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement dashboard patient:', error);
        this.dashboardData = {
          mesRendezVous: 0,
          mesConsultations: 0,
          ordonnances: 0,
          mesPaiements: 0,
          prochainRendezVous: null
        };
        this.loading = false;
      }
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }
}
