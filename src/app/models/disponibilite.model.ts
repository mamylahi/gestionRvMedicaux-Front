import { Medecin } from './medecin.model';

export class Disponibilite {
  id!: number;
  medecin_id!: number;
  medecin?: Medecin;
  date_debut!: Date;
  date_fin!: Date;
  recurrent!: boolean;
  created_at?: Date;
  updated_at?: Date;
}
