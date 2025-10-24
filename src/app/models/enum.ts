// Rôles utilisateur
export enum UserRole {
  ADMIN = 'admin',
  MEDECIN = 'medecin',
  PATIENT = 'patient',
  SECRETAIRE = 'secretaire',
}

// Statuts rendez-vous
export enum RendezVousStatut {
  EN_ATTENTE = 'en_attente',
  CONFIRME = 'confirme',
  ANNULE = 'annule',
  TERMINE = 'termine'
}

// Groupes sanguins
export enum GroupeSanguin {
  O_NEGATIF = 'O-',
  O_POSITIF = 'O+',
  A_NEGATIF = 'A-',
  A_POSITIF = 'A+',
  B_NEGATIF = 'B-',
  B_POSITIF = 'B+',
  AB_NEGATIF = 'AB-',
  AB_POSITIF = 'AB+'
}

// Moyens de paiement
export enum MoyenPaiement {
  ESPECE = 'espece',
  CARTE = 'carte',
  MOBILE_MONEY = 'mobile_money'
}

// Statuts paiement
export enum StatutPaiement {
  EN_ATTENTE = 'en_attente',
  VALIDE = 'valide',
  ANNULE = 'annule'
}
