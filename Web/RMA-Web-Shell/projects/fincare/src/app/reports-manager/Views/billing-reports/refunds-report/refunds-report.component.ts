import { KeyValue } from '@angular/common';
import { Component } from '@angular/core';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { PreDefinedDateFilterEnum } from 'projects/shared-components-lib/src/lib/report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/date-range-filter/models/pre-defined-range-date-filter.enum';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';

@Component({
  selector: 'app-refunds-report',
  templateUrl: './refunds-report.component.html'
})
export class RefundsReportComponent extends PermissionHelper {

  permission = 'View Refund Report';
  selectedPolicy: Policy;
  selectedDebtor: RolePlayer;

  defaultDateRange = PreDefinedDateFilterEnum.ThisMonth;

  standardFiltersExpanded: boolean;
  advancedFiltersExpanded: boolean;

  selectedReport: any;
  triggerReset: boolean;
  reportUrl: string = 'RMA.Reports.FinCare/RMARefundReport';
  parameters: KeyValue<string, string>[];
  refundStatus: { id: number, name: string }[] = [];

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

    this.selectedDebtor = null;
    let parameter = [{ key: 'Debtor', value: 'all' }];
    this.setParameters(parameter);

    this.selectedPolicy = null;
    parameter = [{ key: 'PolicyId', value: 'all' }];
    this.setParameters(parameter);

    this.triggerReset = !this.triggerReset;
  }

  setPolicy($event: Policy) {
    this.selectedPolicy = $event;
    const parameter = [{ key: 'PolicyId', value: $event.policyId.toString() }]
    this.setParameters(parameter);
  }

  setDebtor($event: RolePlayer) {
    this.selectedDebtor = $event;
    const parameter = [{ key: 'Debtor', value: $event.rolePlayerId.toString() }]
    this.setParameters(parameter);
  }
}
