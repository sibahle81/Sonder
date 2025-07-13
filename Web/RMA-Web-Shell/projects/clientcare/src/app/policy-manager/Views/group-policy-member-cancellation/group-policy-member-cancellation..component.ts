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
import { PolicyInsuredLifeService } from '../../shared/Services/policy-insured-life.service';
import { RolePlayerPolicy } from '../../shared/entities/role-player-policy';
import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';
import { GroupPolicyMemberCancellationDatasource } from './group-policy-member-cancellation.datasource';
import { RolePlayerPolicyService } from '../../shared/Services/role-player-policy.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

@Component({
  selector: 'group-policy-member-cancellation',
  templateUrl: './group-policy-member-cancellation.component.html',
  styleUrls: ['./group-policy-member-cancellation.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class GroupPolicyMemberCancellationComponent extends WizardDetailBaseComponent<Case> implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isLoading = true;
  policy: RolePlayerPolicy;
  dataSource: GroupPolicyMemberCancellationDatasource;
  memberColumns = ['isDelete', 'policyStatus' ,'policyNumber', 'memberName', 'idType', 'idNumber' ];
  filter: string = '';  
  isShown: boolean = true ;
  canCheck: boolean = true;
  policyStatus: number = 0;
  policyStatuses: Lookup[];

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly lookupService: LookupService,
    private readonly insuredLifeService: PolicyInsuredLifeService,
    private readonly roleplayerPolicy: RolePlayerPolicyService
 ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {
    this.dataSource = new GroupPolicyMemberCancellationDatasource(this.insuredLifeService);
    if (this.dataSource !== undefined)
      this.loadData(this.filter);
  }

  ngAfterViewInit(): void {
    
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData(this.filter))
      )
      .subscribe();
  }

  onLoadLookups(): void {}

  createForm(id: number): void {}

  populateForm(): void {
      
    
    const policy = this.model.mainMember.policies && this.model.mainMember.policies.length > 0 ? this.model.mainMember.policies[0] : null;
    if (!policy) { return; }
    this.policy = policy;
        
    this.roleplayerPolicy.getGroupPolicyStatus(policy.policyId).subscribe(
      result => { 
        if (result === PolicyStatusEnum.Active)
          this.isShown = true;
        else if (result === PolicyStatusEnum.RequestCancel)
          this.isShown = false;
          
      }
    );
    
    this.canCheck = this.context.wizard.canEdit;
    this.getPolicyStatuses();
    this.loadData(this.filter);
  }
 
  populateModel(): void {
    if (this.model)
    {
      
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  applyFilter(query: any) {
     let filterValue = query; 
     this.loadData(filterValue);
  }

  resetFilter() {
    let filterValue = '';
    this.loadData(filterValue);
        
  }

  policyStatusChanged($event: any) {
    this.policyStatus = $event.value;
  }

  private getPolicyStatuses(): void {
    this.lookupService.getPolicyStatuses().subscribe(
      data => { this.policyStatuses = data.sort(); 
        if (this.policyStatuses.length > 0 && this.policyStatuses.findIndex(wc => wc.name == 'All') == -1) {
          this.policyStatuses.unshift({ id: 0, name: 'All' } as Lookup);
          this.policyStatus = this.policyStatuses[0].id;
        }
      });
  }

  loadData(queryParameter: any) {
      if (this.dataSource === null || this.dataSource === undefined || this.policy === undefined || this.policy === null)
        return;
    
        this.dataSource.getData({
        status: this.policyStatus,  
        filter: queryParameter,
        query: this.policy.policyId,
        pageNumber: this.paginator.pageIndex + 1,
        pageSize: this.paginator.pageSize === undefined ? 25 : this.paginator.pageSize,
        orderBy: this.sort.active,
        sortDirection: this.sort.direction,
        showActive: true,
        readOnly: !this.canCheck
      });

      
  }

  isChecked(policyStatusId: number) {
    return policyStatusId === PolicyStatusEnum.RequestCancel; 
  }

  isCheckedAuth(policyStatusId: number)
  {
    if (policyStatusId === PolicyStatusEnum.RequestCancel && !this.canCheck)
      return true;
    else
      return false;
  }

  isAllChecked() {
    if (this.policy === undefined || this.policy === null )
      return false;
    else
      return this.policy.policyStatus === PolicyStatusEnum.RequestCancel;     
  }

  allChange($event: any) {
    const selected = $event.checked;
    const selectedPolicyId = this.policy.policyId;
    const status = selected ? PolicyStatusEnum.RequestCancel : PolicyStatusEnum.Active;
    this.roleplayerPolicy.cancelRequestGroupPolicyChild(selectedPolicyId, status).subscribe(
      result => { 
        if (result === PolicyStatusEnum.Active)
          this.isShown = true;
        else if (result === PolicyStatusEnum.RequestCancel)
          this.isShown = false;
          
      }
    );
  }

  tagChange($event: any, policyId: number) {

    const selected = $event.checked;
    const selectedPolicyId = policyId;
    const status = selected ? PolicyStatusEnum.RequestCancel : PolicyStatusEnum.Active;
    this.roleplayerPolicy.cancelRequestGroupPolicyChild(selectedPolicyId, status).subscribe(
      result => {
        
      }
    );
  }

  getPolicyStatus(policyStatusId: number): string {
    const statusText = PolicyStatusEnum[policyStatusId];
    return statusText.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }
}
