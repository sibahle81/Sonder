import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HomeDataSource } from './home-datasource';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { AnnualIncreaseNotification } from '../../models/annual-increase-notification.model';
import { Router } from '@angular/router';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import {GazetteService} from '../../../../../../shared-services-lib/src/lib/services/gazette/gazette.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [HomeDataSource]
})
export class HomeComponent implements OnInit {

  @Output() changeLoading = new EventEmitter();

  creatingWizard: boolean;

  constructor(public readonly dataSource: HomeDataSource,
              private wizardService: WizardService,
              private alertService: AlertService,
              private readonly router: Router,
              private readonly gazetteService: GazetteService ) { }

  ngOnInit(): void {}

  refreshDateTable(event = undefined): void {

  }

  //table definition
  metaData = {
      displayColumns: [
        "createdDate",
        "effectiveDate",
        "type",
        "status",
        "percentage",
        "amount",
        "modifiedBy",
      ],
      columnsDef: {
        createdDate: {
          displayName: "Year",
          type: "text",
          sortable: true,
        },
        effectiveDate: {
          displayName: "Effective Date",
          type: "date",
          sortable: false,
        },
        type: {
          displayName: "Type",
          type: "text",
          sortable: true,
        },
        status: {
          displayName: "Status",
          type: "text",
          sortable: true,
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
        modifiedBy: {
          displayName: "Completed By",
          type: "text",
          sortable: false,
        },
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
    startWizardRequest.data = JSON.stringify(data);
    startWizardRequest.type = 'pensions-annual-increase';
    this.creatingWizard = true;
    this.wizardService.startWizard(startWizardRequest).subscribe((result) => {
      this.creatingWizard = false;
      this.alertService.success('Annual Increase wizard started successfully');
      this.router.navigateByUrl(`/penscare/pensions-annual-increase/continue/${result.id}`);
    });
  }

}
