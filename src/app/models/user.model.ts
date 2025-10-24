import { UserRole } from './enum';

export class User {
  id!: number;
  nom!: string;
  prenom!: string;
  email!: string;
  adresse?: string;
  telephone?: string;
  email_verified_at?: Date;
  password!: string;
  role!: UserRole;
  remember_token?: string;
  created_at?: Date;
  updated_at?: Date;
}
