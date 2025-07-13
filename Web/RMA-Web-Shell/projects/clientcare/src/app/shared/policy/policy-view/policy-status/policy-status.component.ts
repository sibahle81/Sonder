import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PolicyGroupMember } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy-group-member';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { PolicyStatusDataSource } from './policy-status.datasource';
import { RefreshService } from '../../../refresh-service/refresh-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'policy-status',
  templateUrl: './policy-status.component.html',
  styleUrls: ['./policy-status.component.css']
})
export class PolicyStatusComponent implements OnChanges, OnDestroy {

  @Input() policyId: number;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  refreshSubscription: Subscription;

  form: any;
  dataSource: PolicyStatusDataSource;
  currentQuery: any;

  selectedPolicyGroupMember: PolicyGroupMember;
  showDetail: boolean;

  constructor(
    private readonly policyService: PolicyService,
    public dialog: MatDialog,
    private readonly refreshService: RefreshService
  ) {
    this.refreshSubscription = this.refreshService.getRefreshPolicyCommand().subscribe
      (refresh => {
        if (this.policyId) {
          this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
          this.dataSource = new PolicyStatusDataSource(this.policyService);
          this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
          this.currentQuery = this.policyId.toString();
          this.getData();
        }
      });
  }

  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.policyId) {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource = new PolicyStatusDataSource(this.policyService);
      this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
      this.currentQuery = this.policyId.toString();
      this.getData();
    }
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  reset() {
    this.selectedPolicyGroupMember = null;
  }

  getPolicyStatus(policyStatusEnum: PolicyStatusEnum): string {
    return this.formatText(PolicyStatusEnum[policyStatusEnum]);
  }

  formatText(text: string): string {
    if (!text) { return 'N/A' }
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'policyStatus', show: true },
      { def: 'reason', show: true },
      { def: 'effectiveFrom', show: true },
      { def: 'requestedBy', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize > 10 },
      { def: 'requestedByConverted', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10 },
      { def: 'effectiveTo', show: true },
      { def: 'requestedDate', show: true },
    ];

    return columnDefinitions.filter((cd) => cd.show).map((cd) => cd.def);
  }
}
