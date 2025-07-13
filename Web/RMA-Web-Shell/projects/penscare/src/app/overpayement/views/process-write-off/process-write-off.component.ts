import { Component, OnInit } from '@angular/core';
import { WriteOffDataSource } from '../../lib/writeoff-dataSource';
import { writeOffType } from '../../lib/enums/write-off-type-enum';

@Component({
  selector: 'app-process-write-off',
  templateUrl: './process-write-off.component.html',
  styleUrls: ['./process-write-off.component.css'],
  providers: [WriteOffDataSource]
})
export class ProcessWriteOffComponent implements OnInit {

  type = writeOffType;

  constructor() { }

  ngOnInit(): void {
  }

  metaData = {
    displayColumns: [
      'checkBox',
      'ledgerId',
      'deceasedNames',
      'dateOfDeath',
      'lastPaymentDate',
      'normalMonthlyPension',
      'overpaymentAmount',
      'amountRecovered',
      'overpaymentBalanceAmount',
      'writeOffAmount',
      'action',
    ],
    columnsDef: {
      checkBox: {
        displayName: '',
        type: 'input',
        sortable: false,
      },
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
      action: {
        displayName: 'Action',
        type: 'action',
        sortable: false,
        menus: [
          { title: 'Process Write-Off', action: 'process', disable: false }
        ],
      },
    },
  }

}
