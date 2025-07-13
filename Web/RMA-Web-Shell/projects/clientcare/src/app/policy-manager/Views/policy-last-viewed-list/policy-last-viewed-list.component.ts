import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PolicyLastViewedListDataSource } from './policy-last-viewed-list.datasource';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';
import { Policy } from '../../shared/entities/policy';


@Component({
  templateUrl: './policy-last-viewed-list.component.html',
  selector: 'policy-last-viewed'
})
export class PolicyLastViewedListComponent extends ListComponent {
  get isLoading(): boolean { return this.privateDataSource.isLoading; }

  constructor(
    alertService: AlertService,
    router: Router,
    public readonly privateDataSource: PolicyLastViewedListDataSource) {
    super(alertService, router, privateDataSource, '/clientcare/policy-manager/view-policy', 'Policy', 'Policies');
    this.hideAddButton = true;
  }

  setupDisplayColumns(): void {
    this.columns = [
      { columnDefinition: 'policyNumber', header: 'Policy Number', cell: (row: Policy) => `${row.policyNumber}` },
      { columnDefinition: 'clientName', header: 'Client Name', cell: (row: Policy) => `${row.clientName}` },
      { columnDefinition: 'status', header: 'Status', cell: (row: Policy) => `${this.formatStatus(PolicyStatusEnum[row.policyStatus])}` }
    ];
  }

  onSelect(item: any): void {
    if (item.policyOwner.isNatural) {
      this.router.navigate(['clientcare/policy-manager/view-policy', item.policyId]);
    } else {
      this.router.navigate(['clientcare/policy-manager/view-policy-group', item.policyId]);
    }
  }

  formatStatus(statusText: string){
    return statusText.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }
}
