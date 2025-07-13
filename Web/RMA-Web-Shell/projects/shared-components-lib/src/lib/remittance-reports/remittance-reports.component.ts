import { KeyValue } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PreDefinedDateFilterEnum } from '../report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/date-range-filter/models/pre-defined-range-date-filter.enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { ClaimSearchResult } from '../searches/claim-search/claim-search-result.model';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';

@Component({
  selector: 'remittance-reports',
  templateUrl: './remittance-reports.component.html',
  styleUrls: ['./remittance-reports.component.css']
})
export class RemittanceReportsComponent implements OnChanges {

  @Input() report: KeyValue<string, string>;
  @Input() parameters: KeyValue<string, string>[];

  selectedRolePlayer: RolePlayer;
  selectedPolicy: Policy;
  selectedClaim: ClaimSearchResult;

  defaultDateRange = PreDefinedDateFilterEnum.Last90Days;

  standardFiltersExpanded: boolean;
  advancedFiltersExpanded: boolean;

  selectedReport: any;
  triggerReset: boolean;

  reportUrl: string;

  originalParameters: KeyValue<string, string>[];
  currentUser: User;

  constructor(
    private readonly authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.originalParameters = JSON.parse(JSON.stringify(this.parameters));

    if (this.report) {
      this.reportSelected(this.report);
    }
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

    this.selectedRolePlayer = null;
    this.selectedPolicy = null;
    this.selectedClaim = null;

    if (this.originalParameters?.length > 0) {
      this.parameters = JSON.parse(JSON.stringify(this.originalParameters));
    } else {
      this.parameters = null;
    }

    this.triggerReset = !this.triggerReset;
  }

  setRolePlayer($event: RolePlayer) {
    this.selectedPolicy = null;
    this.selectedClaim = null;

    const keysToRemove = ['PolicyId', 'ClaimId'];
    this.parameters = this.parameters.filter(param => !keysToRemove.includes(param.key));

    this.advancedFiltersExpanded = false;
    this.selectedRolePlayer = $event;
    const parameter = [{ key: 'RolePlayerId', value: $event.rolePlayerId.toString() }]
    this.setParameters(parameter);
  }

  setPolicy($event: Policy) {
    this.selectedRolePlayer = null;
    this.selectedClaim = null;

    const keysToRemove = ['RolePlayerId', 'ClaimId'];
    this.parameters = this.parameters.filter(param => !keysToRemove.includes(param.key));

    this.advancedFiltersExpanded = false;
    this.selectedPolicy = $event;
    const parameter = [{ key: 'PolicyId', value: $event.policyId.toString() }]
    this.setParameters(parameter);
  }

  setClaim($event: ClaimSearchResult) {
    this.selectedRolePlayer = null;
    this.selectedPolicy = null;

    const keysToRemove = ['RolePlayerId', 'PolicyId'];
    this.parameters = this.parameters.filter(param => !keysToRemove.includes(param.key));

    this.advancedFiltersExpanded = false;
    this.selectedClaim = $event;
    const parameter = [{ key: 'ClaimId', value: $event.claimId.toString() }]
    this.setParameters(parameter);
  }
}