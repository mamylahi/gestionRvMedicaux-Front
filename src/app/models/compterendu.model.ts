import { Consultation } from './consultation.model';

export class CompteRendu {
  id!: number;
  consultation_id!: number;
  consultation?: Consultation;
  traitement!: string;
  diagnostic!: string;
  observation?: string;
  date_creation!: Date;
  created_at?: Date;
  updated_at?: Date;
}
