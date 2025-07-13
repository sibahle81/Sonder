import { Component, Input, OnInit } from '@angular/core';
import { PensionLedger } from 'projects/shared-components-lib/src/lib/models/pension-ledger.model';

@Component({
  selector: 'app-pension-ledger-summary',
  templateUrl: './pension-ledger-summary.component.html',
  styleUrls: ['./pension-ledger-summary.component.css']
})
export class PensionLedgerSummaryComponent implements OnInit {
  @Input() pensionLedger: PensionLedger;
  constructor() { }

  ngOnInit(): void {
  }
}
