import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, merge } from 'rxjs';
import { GroupPolicyMembersDatasource } from '../../../policy-manager/views/group-policy-members/group-policy-members.datasource';
import { PolicyInsuredLifeService } from '../../../policy-manager/shared/Services/policy-insured-life.service';
import { InsuredLifeStatusEnum } from '../../../policy-manager/shared/enums/insured-life-status.enum';
import { GeneralAuditDialogComponent } from '../../../shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { PolicyItemTypeEnum } from '../../../policy-manager/shared/enums/policy-item-type.enum';
import { PolicyInsuredLife } from '../../../policy-manager/shared/entities/policy-insured-life';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'policy-member-widget',
  templateUrl: './policy-member-widget.component.html',
  styleUrls: ['./policy-member-widget.component.css']
})
export class PolicyMemberWidgetComponent implements OnInit, AfterViewInit {

  @Input() isChildPolicy = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  policyId: number;
  dataSource: GroupPolicyMembersDatasource;
  memberColumns = ['rolePlayerType', 'memberName', 'dob', 'dateOfDeath', 'age', 'startDate', 'insuredLifeStatus', 'actions'];

  redPolicyStatus = ['Cancelled', 'Expired', 'Lapsed', 'Legal', 'Not Taken Up'];
  amberPolicyStatus = ['Paused', 'Pending Cancelled', 'Pending Continuation', 'Pending First Premium', 'Pending Reinstatement', 'Pre Legal'];
  greenPolicyStatus = ['Active', 'Free Cover'];
  bluePolicyStatus = ['Transferred', 'Reinstated', 'Premium Waivered', 'Premium Waived', 'Pending Release', 'Released'];

  constructor(
    private readonly insuredLifeService: PolicyInsuredLifeService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.dataSource = new GroupPolicyMembersDatasource(this.insuredLifeService);
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.loadData();
          this.isLoading$.next(false);
        })
      ).subscribe();
  }

  loadMembers(policyId: number) {
    this.policyId = policyId;
    this.loadData();
    this.isLoading$.next(false);
  }

  loadData() {
    this.dataSource.isChildPolicy = this.isChildPolicy;
    this.dataSource.getData({
      query: this.policyId,
      pageNumber: this.paginator.pageIndex + 1,
      pageSize: this.paginator.pageSize,
      orderBy: 'RolePlayerTypeId',
      sortDirection: 'asc',
      showActive: true
    });
  }

  getInsuredLifeStatus(insuredLifeStatusId: number): string {
    const statusText = InsuredLifeStatusEnum[insuredLifeStatusId];
    return statusText.replace(/([A-Z])/g, ' $1').trim();
  }

  openAuditDialog(policyInsuredLife: PolicyInsuredLife) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '1024px',
      data: {
        serviceType: ServiceTypeEnum.PolicyManager,
        clientItemType: PolicyItemTypeEnum.InsuredLife,
        itemId: policyInsuredLife.rolePlayerId,
        heading: 'Insured Life Details Audit',
        propertiesToDisplay: ['StatedBenefitId', 'RolePlayerTypeId', 'InsuredLifeStatusId', 'StartDate', 'EndDate', 'InsuredLifeRemovalReasonId',
        'Skilltype', 'Earnings', 'Allowance', 'Premium', 'CoverAmount',
        'CreatedBy', 'CreatedDate', 'ModifiedBy', 'ModifiedDate']
      }
    });
  }
}
