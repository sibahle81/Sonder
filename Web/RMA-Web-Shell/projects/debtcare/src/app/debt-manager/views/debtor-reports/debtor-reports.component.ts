import { KeyValue } from '@angular/common';
import { Component } from '@angular/core';
import { PreDefinedDateFilterEnum } from 'projects/shared-components-lib/src/lib/report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/date-range-filter/models/pre-defined-range-date-filter.enum';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';

@Component({
  selector: 'debtor-reports',
  templateUrl: './debtor-reports.component.html',
  styleUrls: ['./debtor-reports.component.css']
})

export class DebtorReportsComponent extends PermissionHelper {

  defaultDateRange = PreDefinedDateFilterEnum.ThisMonth;

  reports = [
    // { key: 'ADD YOUR REPORT NAME HERE', value: 'ADD YOUR REPORT URL HERE' }, //RMA.Reports.Common/Referrals/RMAReferralStatusChangeAuditReport
    { key: 'Referral SLA Report', value: 'RMA.Reports.Common/Referrals/RMAReferralStatusChangeAuditReport' },
  ];

  standardFiltersExpanded: boolean;
  advancedFiltersExpanded: boolean;

  selectedReport: any;
  triggerReset: boolean;

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

      const item = [...this.parameters];
      this.parameters = null;
      this.parameters = item;
    }
  }

  reset() {
    this.standardFiltersExpanded = false;
    this.advancedFiltersExpanded = false;
    
    this.triggerReset = !this.triggerReset;
  }
}
