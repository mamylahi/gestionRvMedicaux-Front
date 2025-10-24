import { Departement } from './departement.model';

export class Specialite {
  id!: number;
  nom!: string;
  departement_id!: number;
  departement?: Departement;
  created_at?: Date;
  updated_at?: Date;
}
