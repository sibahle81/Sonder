import { Router } from '@angular/router';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BonusPaymentsDataSource } from './bonus-payments-datasource';
import { AnnualIncreaseNotification } from '../../models/annual-increase-notification.model';

@Component({
  selector: 'bonus-payments-list',
  templateUrl: './bonus-payments-list.component.html',
  styleUrls: ['./bonus-payments-list.component.css'],
  providers: [BonusPaymentsDataSource]
})
export class BonusPaymentsList implements OnInit {

  @Output() changeLoading = new EventEmitter();
  creatingWizard: boolean;

  constructor(public readonly dataSource: BonusPaymentsDataSource,
              private wizardService: WizardService,
              private alertService: AlertService,
              private readonly router: Router) { }

  ngOnInit(): void {}

  refreshDateTable(event = undefined): void {

  }

  //table definition
  metaData = {
      displayColumns: [
        "effectiveDate",
        "legislativeValue",
        "status",
        "percentage",
        "amount",
        "createdDate"
      ],
      columnsDef: {
        effectiveDate: {
          displayName: "Effective Date",
          type: "date",
          sortable: true,
        },
        legislativeValue: {
          displayName: "Legislative Value",
          type: "text",
          sortable: false,
        },
        status: {
          displayName: "Status",
          type: "text",
          sortable: false,
        },
        percentage: {
          displayName: "Percentage",
          type: "percent",
          sortable: false,
        },
        amount: {
          displayName: "Flat Amount",
          type: "currency",
          sortable: false,
        },
        createdDate: {
          displayName: "Created Date",
          type: "date",
          sortable: true,
        }
      },
  };

  newApplication() {
    this.startWizard(this.createNotification());
  }

  createNotification(): AnnualIncreaseNotification {
    const annualIncreaseNotification = new AnnualIncreaseNotification();
    return annualIncreaseNotification;
  }

  startWizard(data: AnnualIncreaseNotification) {
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.data = JSON.stringify(data);;
    startWizardRequest.type = 'pensions-bonus-payment';
    startWizardRequest.linkedItemId = new Date().getFullYear();
    this.creatingWizard = true;
    this.wizardService.startWizard(startWizardRequest).subscribe((result) => {
      this.creatingWizard = false;
      this.alertService.success('Bonus payment wizard started successfully');
      this.router.navigateByUrl(`/penscare/pensions-bonus-payment/continue/${result.id}`);
    });
  }

}
