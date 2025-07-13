import { AfterContentChecked, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { ActivatedRoute } from '@angular/router';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

import { ChildPolicyListDataSource } from '../../../shared/policy/policy-view/child-policy-list/child-policy-list.datasource';
import { UpgradeDowngradePolicyCase } from '../../shared/entities/upgrade-downgrade-policy-case';
import { PolicyService } from '../../shared/Services/policy.service';
import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { UntypedFormBuilder } from '@angular/forms';

@Component({
  selector: 'app-group-scheme-child-policies',
  templateUrl: './group-scheme-child-policies.component.html',
  styleUrls: ['./group-scheme-child-policies.component.css']
})
export class GroupSchemeChildPoliciesComponent extends WizardDetailBaseComponent<UpgradeDowngradePolicyCase> implements AfterContentChecked {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;

  policyId: number;
  currentQuery: any;
  selectAll: boolean = false;
  showDetail: boolean = false;
  dataSource: ChildPolicyListDataSource;
  displayedColumns: string[] = ['selected', 'policyNumber', 'policyStatus', 'memberName', 'idNumber', 'dateOfBirth', 'policyJoinDate'];

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly policyService: PolicyService,
    public readonly formBuilder: UntypedFormBuilder,    
    private readonly changeDetector: ChangeDetectorRef
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.dataSource = new ChildPolicyListDataSource(this.policyService);
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  private createDataSource() {
      if (!this.dataSource) { return; }
      this.policyId = this.model.policyId;
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);      
      this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
      this.currentQuery = this.policyId.toString();
      this.getData();
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  onLoadLookups(): void {}

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      selectAllPolicies: []
    })
  }

  populateForm(): void {
    this.createDataSource();
    this.form.patchValue({
      selectAllPolicies: this.model.selectAllPolicies
    });
    this.selectAll = this.model.selectAllPolicies;
  }

  populateModel(): void {
    const value = this.form.getRawValue();
    this.model.selectAllPolicies = value.selectAllPolicies;
    if (value.selectAllPolicies === true) {
      this.model.selectedPolicyIds = [];
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  getPolicyStatus(policyStatus: PolicyStatusEnum): string {
    return this.formatText(PolicyStatusEnum[policyStatus]);
  }

  private formatText(text: string): string {
    if (!text) { return ''; }
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  search(): void {
    this.currentQuery = `${this.policyId.toString()},${this.filter.nativeElement.value}`;
    this.getData();
  }

  resetSearch(): void {
    this.filter.nativeElement.value = '';
    this.search();
  }

  setSelectAllPolicies(event: any): void {
    this.selectAll = event.checked;
    if (this.selectAll) {
      this.model.selectedPolicyIds = [];
    }
  }

  policySelected(policyId: number): boolean {
    if (!this.model.selectedPolicyIds) {
      this.model.selectedPolicyIds = [];
    }
    if (this.selectAll === true) { return true; }
    const idx = this.model.selectedPolicyIds.findIndex(p => p === policyId);
    return idx >= 0;
  }

  selectPolicy(event: MatCheckboxChange, policyId: number): void {
    if (!this.model.selectedPolicyIds) {
      this.model.selectedPolicyIds = [];
    }
    const idx = this.model.selectedPolicyIds.findIndex(p => p === policyId);
    if (event.checked) {
      if (idx < 0) {
        this.model.selectedPolicyIds.push(policyId);
      }
    } else {
      if (idx >= 0) {
        this.model.selectedPolicyIds.splice(idx, 1);
      }
    }
  }
}
