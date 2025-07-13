import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PolicyGroupMember } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy-group-member';
import { InsuredLifeStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/insured-life-status.enum';
import { PolicyItemTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-item-type.enum';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { PolicyInsuredLivesDataSource } from './policy-insured-lives.datasource';

@Component({
  selector: 'policy-insured-lives',
  templateUrl: './policy-insured-lives.component.html',
  styleUrls: ['./policy-insured-lives.component.css']
})
export class PolicyInsuredLivesComponent implements OnChanges {

  @Input() policyId: number;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  form: any;
  dataSource: PolicyInsuredLivesDataSource;
  currentQuery: any;

  selectedPolicyGroupMember: PolicyGroupMember;
  showDetail: boolean;

  requiredAuditPermission = 'View Audits';
  hasAuditPermission = false;

  today = new Date().getCorrectUCTDate();

  constructor(
    private readonly policyService: PolicyService,
    public dialog: MatDialog
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.policyId) {
      this.hasAuditPermission = userUtility.hasPermission(this.requiredAuditPermission);
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource = new PolicyInsuredLivesDataSource(this.policyService);
      this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
      this.currentQuery = this.policyId.toString();
      this.getData();
    }
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  viewDetails(policyGroupMember: PolicyGroupMember) {
    this.selectedPolicyGroupMember = policyGroupMember;
    this.showDetail = true;
  }

  closeDetails() {
    this.showDetail = false;
    this.reset();
  }

  reset() {
    this.selectedPolicyGroupMember = null;
    this.getData();
  }

  getInsuredLifeStatus(insuredLifeStatus: InsuredLifeStatusEnum): string {
    return this.formatText(InsuredLifeStatusEnum[insuredLifeStatus]);
  }

  getRolePlayerType(rolePlayerTypeEnum: RolePlayerTypeEnum): string {
    return this.formatText(RolePlayerTypeEnum[rolePlayerTypeEnum]);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  formatMoney(value: string): string {
    return value && value.length > 0 ? value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") : '-';
  }

  getAge(dob: Date, dod: Date): number {
    const birthday = new Date(dob);

    if (dod) {
      const deathday = new Date(dod);
      const timeDiff = Math.abs(deathday.getTime() - birthday.getTime());
      return Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25);
    } else {
      const timeDiff = Math.abs(Date.now() - birthday.getTime());
      return Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25);
    }
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'memberName', show: true },
      { def: 'rolePlayerType', show: true },
      { def: 'idNumber', show: true },
      { def: 'dateOfBirth', show: true },
      { def: 'dateOfDeath', show: true },
      { def: 'policyJoinDate', show: true },
      { def: 'joinAge', show: true },
      { def: 'currentAge', show: true },
      { def: 'insuredLifeStatus', show: true },
      { def: 'premium', show: true },
      { def: 'coverAmount', show: true },
      { def: 'actions', show: true }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  openAuditDialog($event: PolicyGroupMember) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.PolicyManager,
        clientItemType: PolicyItemTypeEnum.InsuredLife,
        itemId: $event.rolePlayerId,
        heading: 'Insured Life Details Audit',
        propertiesToDisplay: ['StatedBenefitId', 'RolePlayerTypeId', 'InsuredLifeStatusId', 'StartDate', 'EndDate', 'InsuredLifeRemovalReasonId',
          'Skilltype', 'Earnings', 'Allowance', 'Premium', 'CoverAmount']
      }
    });
  }
}
