import { KeyValue } from '@angular/common';
import { Component } from '@angular/core';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { RolePlayer } from '../../shared/entities/roleplayer';

@Component({
  selector: 'policy-reports',
  templateUrl: './policy-reports.component.html',
  styleUrls: ['./policy-reports.component.css']
})
export class PolicyReportsComponent extends PermissionHelper {

  permission = 'View Policy Reports';

  reports = [
    { key: 'Premium Report', value: 'RMA.Reports.ClientCare/RMAMemberPremiumReport' },
    { key: 'Letter of Good Standing Report', value: 'RMA.Reports.ClientCare/RMALOGSReport' },
    { key: 'Cancellations Report', value: 'RMA.Reports.ClientCare/RMACancellationsReport' },
    { key: 'Reinstatement Report', value: 'RMA.Reports.ClientCare/RMAReinstateReport' }
  ];

  standardFiltersExpanded: boolean;
  advancedFiltersExpanded: boolean;

  selectedReport: any;
  triggerReset: boolean;

  selectedDebtor: RolePlayer;

  reportUrl: string;
  parameters: KeyValue<string, string>[];

  constructor() {
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
    } else {
      const index = this.parameters.findIndex(s => s.key == 'Year');
      if (index > -1) {
        this.parameters.splice(index, 1);
      }
    }
  }

  reset() {
    this.standardFiltersExpanded = false;
    this.advancedFiltersExpanded = false;

    this.selectedDebtor = null;
    let parameter = [{ key: 'RolePlayerId', value: 'all' }];
    this.setParameters(parameter);

    this.triggerReset = !this.triggerReset;
  }

  setDebtor($event: RolePlayer) {
    this.advancedFiltersExpanded = false;
    this.selectedDebtor = $event;
    const parameter = [{ key: 'RolePlayerId', value: $event.rolePlayerId.toString() }]
    this.setParameters(parameter);
  }
}
