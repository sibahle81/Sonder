import { Component, OnInit } from '@angular/core';
import { AccountSearchResult } from '../../../shared/models/account-search-result';

@Component({
  selector: 'app-adhoc-payment-audit',
  templateUrl: './adhoc-payment-audit.component.html'
})
export class AdhocPaymentAuditComponent implements OnInit {

  selectedFinPayeNumber: string;
  showReport = false;


  constructor() { }

  ngOnInit() {
  }

  onAccountSelected($event: AccountSearchResult) {
    this.showReport = true;
    this.selectedFinPayeNumber = $event.finPayeNumber;
  }

  onReset() {
    this.showReport = false;
    this.selectedFinPayeNumber = null;
  }
}
