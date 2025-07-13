import { Component, OnInit } from '@angular/core';
import { WriteOffDataSource } from '../../lib/writeoff-dataSource';
import { writeOffType } from '../../lib/enums/write-off-type-enum';

@Component({
  selector: 'app-write-off',
  templateUrl: './write-off.component.html',
  styleUrls: ['./write-off.component.css'],
  providers: [WriteOffDataSource]
})
export class WriteOffComponent implements OnInit {

  type = writeOffType;

  constructor() { }

  ngOnInit(): void {
  }

  metaData = {
    displayColumns: [
      'ledgerId',
      'deceasedNames',
      'dateOfDeath',
      'lastPaymentDate',
      'normalMonthlyPension',
      'overpaymentAmount',
      'amountRecovered',
      'writeOffAmount',
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
      writeOffAmount: {
        displayName: 'Write-Off Amount',
        type: 'currency',
        sortable: true,
      },
    },
  }

}
