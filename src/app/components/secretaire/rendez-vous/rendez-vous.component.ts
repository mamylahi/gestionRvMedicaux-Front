import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { RendezVous } from '../../../models/rendezvous.model';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { PatientService } from '../../../services/patient.service';
import { MedecinService } from '../../../services/medecin.service';
import { Patient } from '../../../models/patient.model';
import { Medecin } from '../../../models/medecin.model';

declare var Swal: any;

@Component({
  selector: 'app-rendez-vous-calendar',
  standalone: true,
  templateUrl: './rendez-vous.component.html',
  imports: [CommonModule, FormsModule, FullCalendarModule]
})
export class CalendarRendezvousComponent implements OnInit {
  rendezvous: RendezVous[] = [];
  patients: Patient[] = [];
  medecins: Medecin[] = [];
  isLoading = false;

  // Modal states
  showModal = false;
  showDetailModal = false;
  editing = false;
  selectedRdv: RendezVous = new RendezVous();
  detailRdv: RendezVous | null = null;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: frLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    buttonText: {
      today: "Aujourd'hui",
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour'
    },
    events: [],
    eventClick: this.handleEventClick.bind(this),
    dateClick: this.handleDateClick.bind(this),
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    height: 'auto',
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
  };

  constructor(
    private rendezvousService: RendezVousService,
    private patientService: PatientService,
    private medecinService: MedecinService
  ) {}

  ngOnInit() {
    this.loadPatients();
    this.loadMedecins();
    this.getAllRendezVous();
  }

  getAllRendezVous() {
    this.isLoading = true;
    this.rendezvousService.getAll().subscribe({
      next: (data: RendezVous[]) => {
        console.log('🔵 Rendez-vous reçus de l\'API:', data);
        console.log('👥 Patients disponibles:', this.patients.length);
        console.log('👨‍⚕️ Médecins disponibles:', this.medecins.length);

        this.rendezvous = data;

        // Attendre que les patients et médecins soient chargés
        setTimeout(() => {
          this.updateCalendarEvents();
        }, 500);

        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('❌ Erreur lors du chargement des rendez-vous:', error);
        this.isLoading = false;
      }
    });
  }

  // Méthode pour formater la date correctement
  formatDate(date: any): string {
    if (!date) return '';

    // Si c'est une chaîne
    if (typeof date === 'string') {
      // Extraire seulement la partie date (avant l'espace ou le T)
      return date.split(' ')[0].split('T')[0];
    }

    // Si c'est un objet Date
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return '';
  }

  // Méthode pour formater l'heure correctement
  formatTime(time: any): string {
    if (!time) return '00:00';

    if (typeof time === 'string') {
      // Extraire seulement HH:MM des formats "HH:MM:SS" ou "HH:MM"
      const timeParts = time.split(':');
      if (timeParts.length >= 2) {
        return `${timeParts[0]}:${timeParts[1]}`;
      }
    }

    return time;
  }

  updateCalendarEvents() {
    console.log('🔄 Début de updateCalendarEvents');
    console.log('📊 Rendez-vous à traiter:', this.rendezvous);

    const events = this.rendezvous.map(rdv => {
      const color = this.getEventColor(rdv.statut);
      const patientName = this.getPatientName(rdv.patient_id);
      const medecinName = this.getMedecinName(rdv.medecin_id);

      // Utiliser les méthodes de formatage
      const dateStr = this.formatDate(rdv.date_rendezvous);
      const heureStr = this.formatTime(rdv.heure_rendezvous);

      const event = {
        id: rdv.id?.toString(),
        title: `${patientName} - ${medecinName}`,
        start: `${dateStr}T${heureStr}`,
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          rdv: rdv
        }
      };

      console.log('📅 Événement créé:', event);
      return event;
    });

    // Mettre à jour les événements de manière réactive
    this.calendarOptions = {
      ...this.calendarOptions,
      events: events
    };

    console.log('✅ Événements chargés sur le calendrier:', events);
    console.log('📝 Nombre de rendez-vous:', this.rendezvous.length);
  }

  getEventColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'en_attente': '#fbbf24', // yellow
      'confirme': '#10b981', // green
      'annule': '#ef4444', // red
      'termine': '#3b82f6' // blue
    };
    return colors[statut] || '#6b7280';
  }

  handleEventClick(clickInfo: EventClickArg) {
    const rdv = clickInfo.event.extendedProps['rdv'] as RendezVous;
    this.showDetailRdv(rdv);
  }

  handleDateClick(arg: any) {
    this.openAddModal(arg.dateStr);
  }

  showDetailRdv(rdv: RendezVous) {
    this.detailRdv = rdv;
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.detailRdv = null;
  }

  loadPatients() {
    this.patientService.getAll().subscribe({
      next: (data: any) => {
        this.patients = data.data || data || [];
        console.log('✅ Patients chargés:', this.patients.length);
      },
      error: (error: any) => {
        console.error('❌ Erreur lors du chargement des patients:', error);
      }
    });
  }

  loadMedecins() {
    this.medecinService.getAll().subscribe({
      next: (data: any) => {
        this.medecins = data.data || data || [];
        console.log('✅ Médecins chargés:', this.medecins.length);
      },
      error: (error: any) => {
        console.error('❌ Erreur lors du chargement des médecins:', error);
      }
    });
  }

  openAddModal(dateStr?: string) {
    this.editing = false;
    this.selectedRdv = new RendezVous();
    this.selectedRdv.statut = 'en_attente';

    if (dateStr) {
      this.selectedRdv.date_rendezvous = new Date(dateStr);
    } else {
      this.selectedRdv.date_rendezvous = new Date();
    }

    this.showModal = true;
  }

  openEditModal(rdv: RendezVous) {
    this.editing = true;
    this.selectedRdv = { ...rdv };
    this.closeDetailModal();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveRendezVous() {
    if (this.editing) {
      this.rendezvousService.update(this.selectedRdv.id, this.selectedRdv).subscribe({
        next: () => {
          Swal.fire({
            title: 'Mis à jour !',
            text: 'Le rendez-vous a été mis à jour avec succès',
            icon: 'success',
            confirmButtonColor: '#3b82f6',
            timer: 2000
          });
          this.getAllRendezVous();
          this.closeModal();
        },
        error: (error: any) => {
          Swal.fire({
            title: 'Erreur !',
            text: 'Erreur lors de la mise à jour',
            icon: 'error',
            confirmButtonColor: '#ef4444'
          });
        }
      });
    } else {
      this.rendezvousService.create(this.selectedRdv).subscribe({
        next: () => {
          Swal.fire({
            title: 'Créé !',
            text: 'Le rendez-vous a été créé avec succès',
            icon: 'success',
            confirmButtonColor: '#3b82f6',
            timer: 2000
          });
          this.getAllRendezVous();
          this.closeModal();
        },
        error: (error: any) => {
          Swal.fire({
            title: 'Erreur !',
            text: 'Erreur lors de la création',
            icon: 'error',
            confirmButtonColor: '#ef4444'
          });
        }
      });
    }
  }

  deleteRendezVous(id: number) {
    Swal.fire({
      title: 'Supprimer le rendez-vous ?',
      text: 'Cette action est irréversible',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.rendezvousService.delete(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Supprimé !',
              text: 'Le rendez-vous a été supprimé',
              icon: 'success',
              confirmButtonColor: '#3b82f6',
              timer: 2000
            });
            this.closeDetailModal();
            this.getAllRendezVous();
          },
          error: (error: any) => {
            Swal.fire({
              title: 'Erreur !',
              text: 'Erreur lors de la suppression',
              icon: 'error',
              confirmButtonColor: '#ef4444'
            });
          }
        });
      }
    });
  }

  // Méthodes utilitaires
  getPatientName(id: number): string {
    const patient = this.patients.find(p => p.id === id);
    if (patient?.user) {
      return `${patient.user.prenom} ${patient.user.nom}`;
    }
    return 'N/A';
  }

  getMedecinName(id: number): string {
    const medecin = this.medecins.find(m => m.id === id);
    if (medecin?.user) {
      return `Dr. ${medecin.user.nom}`;
    }
    return 'N/A';
  }

  getMedecinSpecialite(id: number): string {
    const medecin = this.medecins.find(m => m.id === id);
    return medecin?.specialite?.nom || 'Généraliste';
  }

  getPatientNumero(id: number): string {
    const patient = this.patients.find(p => p.id === id);
    return patient?.numero_patient || 'N/A';
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'en_attente': 'En attente',
      'confirme': 'Confirmé',
      'annule': 'Annulé',
      'termine': 'Terminé'
    };
    return labels[statut] || statut;
  }

  getPatientLabel(patient: Patient): string {
    if (patient.user) {
      return `${patient.user.nom} ${patient.user.prenom} (${patient.numero_patient || 'N/A'})`;
    }
    return `Patient #${patient.id}`;
  }

  getMedecinLabel(medecin: Medecin): string {
    if (medecin.user) {
      const specialite = medecin.specialite?.nom || 'Généraliste';
      return `Dr. ${medecin.user.nom} ${medecin.user.prenom} - ${specialite}`;
    }
    return `Médecin #${medecin.id}`;
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
