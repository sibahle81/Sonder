import { Component, Input, OnInit } from '@angular/core';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { PersonEventModel } from '../../entities/personEvent/personEvent.model';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { Claim } from '../../entities/funeral/claim.model';

@Component({
  selector: 'claim-invoice-container',
  templateUrl: './claim-invoice-container.component.html',
  styleUrls: ['./claim-invoice-container.component.css']
})
export class ClaimInvoiceContainerComponent implements OnInit {

  @Input() personEvent: PersonEventModel;
  @Input() claim: Claim;

  currentUserLoggedIn: User;
  claimInvoiceType: ClaimInvoiceTypeEnum;
  claimInvoices = [];
  isInvoices = false;

  constructor(
    private readonly authService: AuthService) { }

  ngOnInit(): void {
    this.currentUserLoggedIn = this.authService.getCurrentUser();
  }

  invoiceTypeChange($event: ClaimInvoiceTypeEnum) {
    this.personEvent = {...this.personEvent};
    this.claimInvoiceType = $event;
  }
}
