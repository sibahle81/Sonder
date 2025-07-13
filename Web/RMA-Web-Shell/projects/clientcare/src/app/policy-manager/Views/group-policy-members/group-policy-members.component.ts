import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';

import { Case } from '../../shared/entities/case';
import { GroupPolicyMembersDatasource } from './group-policy-members.datasource';
import { PolicyInsuredLifeService } from '../../shared/Services/policy-insured-life.service';

import { RolePlayerPolicy } from '../../shared/entities/role-player-policy';
import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';

@Component({
  selector: 'group-policy-members',
  templateUrl: './group-policy-members.component.html',
  styleUrls: ['./group-policy-members.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class GroupPolicyMembersComponent extends WizardDetailBaseComponent<Case> implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  isLoading = true;
  policy: RolePlayerPolicy;
  dataSource: GroupPolicyMembersDatasource;
  memberColumns = ['policyNumber', 'memberName', 'idType', 'idNumber', 'rolePlayerType', 'memberStatus','policyStatus', 'startDate', 'endDate'];

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly lookupService: LookupService,
    private readonly insuredLifeService: PolicyInsuredLifeService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {
    this.dataSource = new GroupPolicyMembersDatasource(this.insuredLifeService);
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();
  }

  onLoadLookups(): void {}

  createForm(id: number): void {}

  populateForm(): void {
    const policy = this.model.mainMember.policies && this.model.mainMember.policies.length > 0 ? this.model.mainMember.policies[0] : null;
    if (!policy) { return; }
    this.policy = policy;
    this.loadData();
  }

  populateModel(): void {}

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  loadData() {
    this.dataSource.getData({
      query: this.policy.policyId,
      pageNumber: this.paginator.pageIndex + 1,
      pageSize: this.paginator.pageSize,
      orderBy: 'RolePlayerTypeId',
      sortDirection: 'asc',
      showActive: true
    });
  }

  getPolicyStatus(policyStatusId: number): string {
    const statusText = PolicyStatusEnum[policyStatusId];
    return statusText.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }
}
