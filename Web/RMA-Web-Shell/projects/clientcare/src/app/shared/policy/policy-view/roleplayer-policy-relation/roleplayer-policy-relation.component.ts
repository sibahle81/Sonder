import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { RolePlayerPolicyRelationDataSource } from './roleplayer-policy-relation.datasource';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';

@Component({
  selector: 'roleplayer-policy-relation',
  templateUrl: './roleplayer-policy-relation.component.html',
  styleUrls: ['./roleplayer-policy-relation.component.css']
})

export class RolePlayerPolicyRelationComponent extends PermissionHelper implements OnChanges {
  @Input() rolePlayerId: number;
  @Input() policyId: number;
  @Input() rolePlayerType: RolePlayerTypeEnum

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  form: any;

  dataSource: RolePlayerPolicyRelationDataSource;
  currentQuery: any;

  today = new Date().getCorrectUCTDate();

  constructor(
    private readonly rolePlayerService: RolePlayerService,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.rolePlayerId && this.policyId && this.rolePlayerType) {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource = new RolePlayerPolicyRelationDataSource(this.rolePlayerService);
      this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
      this.currentQuery = this.policyId.toString();
      this.getData();
    }
  }

  getData() {
    this.dataSource.rolePlayerId = this.rolePlayerId;
    this.dataSource.policyId = this.policyId;
    this.dataSource.rolePlayerType = +this.rolePlayerType;
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
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

  getRolePlayerType(rolePlayerTypeEnum: RolePlayerTypeEnum): string {
    return this.formatText(RolePlayerTypeEnum[rolePlayerTypeEnum]);
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'displayName', show: true },
      { def: 'idNumber', show: true },
      { def: 'dateOfBirth', show: true },
      { def: 'age', show: true },
      { def: 'rolePlayerType', show: true },
      { def: 'email', show: true },
      { def: 'mobile', show: true },
      { def: 'allocation', show: this.rolePlayerType == RolePlayerTypeEnum.Beneficiary }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  reset() {
    this.getData();
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }
}

