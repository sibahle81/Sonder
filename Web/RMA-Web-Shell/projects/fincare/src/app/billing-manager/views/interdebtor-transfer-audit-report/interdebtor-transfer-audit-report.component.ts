import { Component, OnInit } from '@angular/core';
import { AccountSearchResult } from '../../../shared/models/account-search-result';

@Component({
  selector: 'app-interdebtor-transfer-audit-report',
  templateUrl: './interdebtor-transfer-audit-report.component.html'
})
export class InterdebtorTransferAuditReportComponent implements OnInit {

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
