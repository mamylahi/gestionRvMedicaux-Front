import { RendezVous } from './rendezvous.model';

export class Consultation {
  id!: number;
  rendezvous_id!: number;
  rendezvous?: RendezVous;
  date_consultation!: Date;
  created_at?: Date;
  updated_at?: Date;
}
