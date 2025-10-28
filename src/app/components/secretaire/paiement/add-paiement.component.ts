import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Paiement} from '../../../models/paiement.model';
import {StatutPaiement} from '../../../models/enum';
import {PaiementService} from '../../../services/paiement.service';


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
