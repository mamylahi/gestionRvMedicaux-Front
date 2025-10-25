import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PaiementService } from '../../../../../../../../../OneDrive/Desktop/gestionRvMedicaux-Front/gestionRvMedicaux-Front/gestionRvMedicaux-Front/src/app/services/paiement.service';
import {Paiement} from '../../../../../../../../../OneDrive/Desktop/gestionRvMedicaux-Front/gestionRvMedicaux-Front/gestionRvMedicaux-Front/src/app/models/paiement.model';
import {StatutPaiement} from '../../../../../../../../../OneDrive/Desktop/gestionRvMedicaux-Front/gestionRvMedicaux-Front/gestionRvMedicaux-Front/src/app/models/enum';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'app-add-paiement',
  templateUrl: './add-paiement.component.html',
  imports: [
    FormsModule
  ],
})
export class AddPaiementComponent {
  paiement: Paiement = new Paiement();
  statutEnum = Object.values(StatutPaiement);

  constructor(
    private paiementService: PaiementService,
    private router: Router
  ) {}

  save(): void {
    this.paiementService.create(this.paiement).subscribe({
      next: () => this.router.navigate(['/paiements']),
      error: (err) => console.error('Erreur lors de la création du paiement', err)
    });
  }
}
