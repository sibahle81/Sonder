import { Component, OnInit } from '@angular/core';
import { OverPaymentHistoryDataSource } from './overpayment-history-datasource';

@Component({
  selector: 'app-overpayment-history',
  templateUrl: './overpayment-history.component.html',
  styleUrls: ['./overpayment-history.component.css'],
  providers: [OverPaymentHistoryDataSource]
})
export class OverpaymentHistoryComponent implements OnInit {
  title = 'Find Overpayment Ledger';
  searchPlaceHolder = 'Search by Pension Case Number';

  constructor(public readonly dataSource: OverPaymentHistoryDataSource) { }

  ngOnInit(): void {}

  metaData = {
    displayColumns: [
      'ledgerId',
      'deceasedNames',
      'dateOfDeath',
      'lastPaymentDate',
      'normalMonthlyPension',
      'overpaymentAmount',
      'amountRecovered',
      'overpaymentBalanceAmount',
      'writeOffAmount',
      'status',
    ],
    columnsDef: {
      ledgerId: {
        displayName: 'LedgerID',
        type: 'text',
        sortable: true,
      },
      deceasedNames: {
        displayName: 'Deceased Name',
        type: 'text',
        sortable: false,
      },
      dateOfDeath: {
        displayName: 'Date of Death',
        type: 'text',
        sortable: false,
      },
      lastPaymentDate: {
        displayName: 'Last Payment Date',
        type: 'text',
        sortable: false,
      },
      normalMonthlyPension: {
        displayName: 'NMP',
        type: 'currency',
        sortable: false,
      },
      overpaymentAmount: {
        displayName: 'Overpayment Amount',
        type: 'currency',
        sortable: true,
      },
      amountRecovered: {
        displayName: 'Amount Recovered',
        type: 'currency',
        sortable: false,
      },
      overpaymentBalanceAmount: {
        displayName: 'Overpayment Balance',
        type: 'currency',
        sortable: false,
      },
      writeOffAmount: {
        displayName: 'Write-Off Amount',
        type: 'currency',
        sortable: true,
      },
      status: {
        displayName: 'Status',
        type: 'text',
        sortable: false,
      },
    },
  }
}
