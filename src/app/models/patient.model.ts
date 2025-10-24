import { User } from './user.model';

export class Patient {
  id!: number;
  numero_patient!: string;
  user_id!: number;
  user?: User;
  created_at?: Date;
  updated_at?: Date;
}
