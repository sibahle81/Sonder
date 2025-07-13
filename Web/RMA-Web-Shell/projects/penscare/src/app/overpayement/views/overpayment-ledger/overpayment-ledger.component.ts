import { Component, OnInit } from '@angular/core';
import { OverPaymentDataSource } from './overpayment-ledger-datasource';
import { Router } from '@angular/router';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { OutstandingOverpayment } from '../../models/overpayment';

@Component({
  selector: 'app-overpayment-ledger',
  templateUrl: './overpayment-ledger.component.html',
  styleUrls: ['./overpayment-ledger.component.css'],
  providers: [OverPaymentDataSource]
})
export class OverpaymentLedgerComponent implements OnInit {

  title = 'Find Overpayment Ledger';
  searchPlaceHolder = 'Search by Pension Case Number';
  creatingWizard: boolean;

  constructor(public readonly dataSource: OverPaymentDataSource,
              private wizardService: WizardService,
              private alertService: AlertService,
              private readonly router: Router) { }

  ngOnInit(): void {
  }

  onMenuItemClick(event) {
    console.log(event);
    if (event['menu']['action'] == 'start') {
      this.startWizard(event['item'])
    }
  }

  startWizard(data: OutstandingOverpayment) {
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.data = JSON.stringify(data);;
    startWizardRequest.type = 'overpayment-wizard';
    this.creatingWizard = true;
    this.wizardService.startWizard(startWizardRequest).subscribe((result) => {
      this.creatingWizard = false;
      this.alertService.success('Overpayment wizard started successfully');
      this.router.navigateByUrl(`/penscare/overpayment-wizard/continue/${result.id}`);
    });
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
      'overpaymentBalanceAmount',
      'action',
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
      action: {
        displayName: 'Action',
        type: 'action',
        sortable: false,
        menus: [
          { title: 'Initiate Overpayment', action: 'start', disable: false }
        ],
      },
    },
  }

}
