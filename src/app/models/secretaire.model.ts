import { User } from './user.model';

export class Secretaire {
  id!: number;
  numero_employe!: string;
  user_id!: number;
  user?: User;
  created_at?: Date;
  updated_at?: Date;
}
