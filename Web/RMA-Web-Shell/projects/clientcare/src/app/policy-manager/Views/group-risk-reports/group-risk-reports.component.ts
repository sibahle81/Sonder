import { Component } from '@angular/core';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { KeyValue } from '@angular/common';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'group-risk-reports',
  templateUrl: './group-risk-reports.component.html',
  styleUrls: ['./group-risk-reports.component.css']
})
export class GroupRiskReportsComponent extends PermissionHelper {

  permission = 'View Policy Reports';

  reports = [
    { key: 'Scheme Master Report', value: 'RMA.Reports.ClientCare.Policy/RMAGroupRiskSchemeMasterReport' },
    { key: 'Premiums Debtors Report', value: 'RMA.Reports.ClientCare.Policy/RMAGroupRiskPremiumsDebtorsReport' },
    { key: 'Premiums Analysis Report', value: 'RMA.Reports.ClientCare.Policy/RMAGroupRiskPremiumsAnalysisReport' },
    { key: 'Premiums Recon Report', value: 'RMA.Reports.ClientCare.Policy/RMAGroupRiskPremiumsReconReport' },
    { key: 'Claims Recon Report', value: 'RMA.Reports.ClientCare.Policy/RMAGroupRiskClaimsReconReport' },
    { key: 'Premiums Raised Report', value: 'RMA.Reports.ClientCare.Policy/RMAGroupRiskPremiumsRaisedReport' },
    { key: 'Premiums Receipts Report', value: 'RMA.Reports.ClientCare.Policy/RMAGroupRiskPremiumsReceiptsReport' }
  ];

  standardFiltersExpanded: boolean;
  advancedFiltersExpanded: boolean;

  selectedReport: any;
  triggerReset: boolean;

  selectedDebtor: RolePlayer;

  reportUrl: string;
  parameters: KeyValue<string, string>[];

  constructor(private readonly authService: AuthService,) {
    super();
  }

  reportSelected($event: any) {
    this.selectedReport = $event;
    this.reportUrl = this.selectedReport.value;
    this.reset();
  }

  setParameters($event: KeyValue<string, string>[]) {
    if (!this.parameters) {
      this.parameters = [];
      this.parameters = $event;
    } else {

      $event.forEach(parameter => {
        const index = this.parameters.findIndex(s => s.key == parameter.key);
        if (index > -1) {
          this.parameters[index] = parameter;
        } else {
          this.parameters.push(parameter);
        }
      });

      this.filterParameters();

      const item = [...this.parameters];
      this.parameters = null;
      this.parameters = item;
    }
  }

  filterParameters() {
    if (this.selectedReport.key == 'Premium Report') {
      const startDateindex = this.parameters.findIndex(s => s.key == 'StartDate');
      if (startDateindex > -1) {
        this.parameters.splice(startDateindex, 1);
      }
      const endDateindex = this.parameters.findIndex(s => s.key == 'EndDate');
      if (endDateindex > -1) {
        this.parameters.splice(endDateindex, 1);
      }
    }
  }

  reset() {
    this.standardFiltersExpanded = false;
    this.advancedFiltersExpanded = false;

    this.selectedDebtor = null;
    let parameters = [
      { key: 'EmployerId', value: '-1' },
      { key: 'UserId', value: this.authService.getCurrentUser().id.toString() },
      { key: 'PolicyId', value: '-1' },
    ];
    this.setParameters(parameters);

    this.triggerReset = !this.triggerReset;
  }

  setDebtor($event: RolePlayer) {
    this.advancedFiltersExpanded = false;
    this.selectedDebtor = $event;
    let parameters = [
      { key: 'EmployerId', value: $event.rolePlayerId.toString() },
      { key: 'UserId', value: this.authService.getCurrentUser().id.toString() },
      { key: 'PolicyId', value: '-1' },
    ];
    this.setParameters(parameters);
  }
}

