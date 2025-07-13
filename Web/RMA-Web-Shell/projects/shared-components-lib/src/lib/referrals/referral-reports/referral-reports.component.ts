import { KeyValue } from '@angular/common';
import { Component } from '@angular/core';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { Referral } from 'projects/shared-models-lib/src/lib/referrals/referral';
import { PreDefinedDateFilterEnum } from '../../report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/date-range-filter/models/pre-defined-range-date-filter.enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserTypeEnum } from 'projects/shared-models-lib/src/lib/enums/user-type-enum';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';

@Component({
  selector: 'referral-reports',
  templateUrl: './referral-reports.component.html',
  styleUrls: ['./referral-reports.component.css']
})

export class ReferralReportsComponent extends PermissionHelper {

  permission = 'View Referral Reports';

  defaultDateRange = PreDefinedDateFilterEnum.ThisMonth;

  reports = [
    { key: 'Referral SLA Report', value: 'RMA.Reports.Common/Referrals/RMAReferralStatusChangeAuditReport' },
    { key: 'Referral Performance Rating Report', value: 'RMA.Reports.Common/Referrals/RMAReferralPerformanceRatingReport' }
  ];

  standardFiltersExpanded: boolean;
  advancedFiltersExpanded: boolean;

  selectedReport: any;
  triggerReset: boolean;

  reportUrl: string;
  parameters: KeyValue<string, string>[];

  selectedReferral: Referral;
  selectedAssignedByUser: User;
  selectedAssignedToUser: User;
  selectedAssignedToRole: Role;

  userType = UserTypeEnum.Internal;

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

      const item = [...this.parameters];
      this.parameters = null;
      this.parameters = item;
    }
  }

  reset() {
    this.standardFiltersExpanded = false;
    this.advancedFiltersExpanded = false;

    this.selectedReferral = null;
    let parameter = [{ key: 'ReferralId', value: 'all' }];
    this.setParameters(parameter);

    this.selectedAssignedToUser = null;
    parameter = [{ key: 'AssignedToUserId', value: 'all' }];
    this.setParameters(parameter);

    this.selectedAssignedByUser = null;
    parameter = [{ key: 'AssignedByUserId', value: 'all' }];
    this.setParameters(parameter);

    this.triggerReset = !this.triggerReset;
  }

  setReferral($event: Referral) {
    this.advancedFiltersExpanded = false;
    this.selectedReferral = $event;
    const parameter = [{ key: 'ReferralId', value: $event ? $event.referralId.toString() : 'all' }]
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
