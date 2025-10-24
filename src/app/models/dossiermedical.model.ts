import { GroupeSanguin } from './enum';
import { Patient } from './patient.model';

export class DossierMedical {
  id!: number;
  patient_id!: number;
  patient?: Patient;
  groupe_sanguin?: GroupeSanguin;
  date_creation!: Date;
  created_at?: Date;
  updated_at?: Date;
}
