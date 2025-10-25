import { RendezVous } from './rendezvous.model';
import {Paiement} from './paiement.model';

export class Consultation {
  id!: number;
  rendezvous_id!: number;
  rendezvous?: RendezVous;
  paiement_id!: number;
  paiement?: Paiement;
  date_consultation!: Date;
  created_at?: Date;
  updated_at?: Date;
}
