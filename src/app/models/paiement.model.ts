import { MoyenPaiement, StatutPaiement } from './enum';
import { Consultation } from './consultation.model';

export class Paiement {
  id!: number;
  consultation_id!: number;
  consultation?: Consultation;
  montant!: number;
  date_paiement!: Date;
  moyen_paiement!: MoyenPaiement;
  statut!: StatutPaiement;
  created_at?: Date;
  updated_at?: Date;
}
