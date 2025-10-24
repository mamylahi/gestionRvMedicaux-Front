import { RendezVousStatut } from './enum';
import { Patient } from './patient.model';
import { Medecin } from './medecin.model';

export class RendezVous {
  id!: number;
  patient_id!: number;
  patient?: Patient;
  medecin_id!: number;
  medecin?: Medecin;
  date_rendezvous!: Date;
  heure_rendezvous!: string;
  motif?: string;
  statut!: RendezVousStatut;
  created_at?: Date;
  updated_at?: Date;
}
