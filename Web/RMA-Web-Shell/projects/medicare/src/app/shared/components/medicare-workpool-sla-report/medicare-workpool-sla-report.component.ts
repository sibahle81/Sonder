import { KeyValue } from '@angular/common';
import { Component } from '@angular/core';
import { PreDefinedDateFilterEnum } from 'projects/shared-components-lib/src/lib/report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/date-range-filter/models/pre-defined-range-date-filter.enum';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';

import { UserTypeEnum } from 'projects/shared-models-lib/src/lib/enums/user-type-enum';

import { Role } from 'projects/shared-models-lib/src/lib/security/role';
import { User } from 'projects/shared-models-lib/src/lib/security/user';

@Component({
  selector: 'medicare-workpool-sla-report',
  templateUrl: './medicare-workpool-sla-report.component.html',
  styleUrls: ['./medicare-workpool-sla-report.component.css']
})
export class MedicareWorkpoolSlaReportComponent {

  permission = 'View Workpool Reports';

  defaultDateRange = PreDefinedDateFilterEnum.ThisMonth;

  reports = [
    { key: 'SLA Report', value: 'RMA.Reports.Medicare/RMAWorkpoolSlaReport' }
  ];

  standardFiltersExpanded: boolean;
  advancedFiltersExpanded: boolean;

  selectedReport: any;
  triggerReset: boolean;

  reportUrl: string;
  parameters: KeyValue<string, string>[];

  selectedWizard: Wizard;
  selectedAssignedByUser: User;
  selectedAssignedToUser: User;
  selectedAssignedToRole: Role;

  userType = UserTypeEnum.Internal;

  constructor() {
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

      const item = [...this.parameters];
      this.parameters = null;
      this.parameters = item;
    }
  }

  reset() {
    this.standardFiltersExpanded = false;
    this.advancedFiltersExpanded = false;
    let parameter = [{ key: '', value: '' }];  

    this.selectedAssignedToUser = null;
    parameter = [{ key: 'AssignedToUserId', value: 'all' }];
    this.setParameters(parameter);

    this.selectedAssignedByUser = null;
    parameter = [{ key: 'AssignedByUserId', value: 'all' }];
    this.setParameters(parameter);

    this.triggerReset = !this.triggerReset;
  }

  setWizard($event: Wizard) {
    this.advancedFiltersExpanded = false;
    this.selectedWizard = $event;
    const parameter = [{ key: 'WizardId', value: $event ? $event.id.toString() : 'all' }]
    this.setParameters(parameter);
  }

  setAssignedByUser($event: User[]) {
    this.advancedFiltersExpanded = false;
    this.selectedAssignedByUser = $event[0];
    const parameter = [{ key: 'AssignedByUserId', value: $event[0] ? $event[0].id.toString() : 'all' }]
    this.setParameters(parameter);
  }

  setAssignedToUser($event: User[]) {
    this.advancedFiltersExpanded = false;
    this.selectedAssignedToUser = $event[0];
    const parameter = [{ key: 'AssignedToUserId', value: $event[0] ? $event[0].id.toString() : 'all' }]
    this.setParameters(parameter);
  }

  setAssignedToRole($event: Role) {
    this.advancedFiltersExpanded = false;
    this.selectedAssignedToRole = $event;
    const parameter = [{ key: 'AssignedToRoleId', value: $event ? $event.id.toString() : 'all' }]
    this.setParameters(parameter);
  }
}
