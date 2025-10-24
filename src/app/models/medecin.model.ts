import { User } from './user.model';
import { Specialite } from './specialite.model';

export class Medecin {
  id!: number;
  numero_medecin!: string;
  disponible!: boolean;
  user_id!: number;
  user?: User;
  specialite_id!: number;
  specialite?: Specialite;
  created_at?: Date;
  updated_at?: Date;
}
