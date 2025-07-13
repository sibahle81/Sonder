import { Component, Input, OnInit } from '@angular/core';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { PersonEventModel } from '../../entities/personEvent/personEvent.model';

@Component({
  selector: 'claim-payment-container',
  templateUrl: './claim-payment-container.component.html',
  styleUrls: ['./claim-payment-container.component.css']
})
export class ClaimPaymentContainerComponent implements OnInit {

  @Input() personEvent: PersonEventModel;
  
  currentUserLoggedIn: User;
  query = ClaimInvoiceTypeEnum[ClaimInvoiceTypeEnum.SundryInvoice];

  constructor(
    private readonly authService: AuthService) { }

  ngOnInit(): void {
    this.currentUserLoggedIn = this.authService.getCurrentUser();
  }

  invoiceTypeChange($event: ClaimInvoiceTypeEnum) {
    this.query = ClaimInvoiceTypeEnum[$event];
  }

}
