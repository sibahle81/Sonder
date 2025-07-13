import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { GroupPolicySchemeService } from '../group-policy-scheme-selection/group-policy-scheme.service';
import { PolicyChildDataSource } from './child-policy-selection.datasource';
import { MoveSchemeCase } from '../../shared/entities/move-scheme-case';
import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';
import { UntypedFormBuilder } from '@angular/forms';

@Component({
  selector: 'app-child-policy-selection',
  templateUrl: './child-policy-selection.component.html',
  styleUrls: ['./child-policy-selection.component.css']
})
export class ChildPolicySelectionComponent extends WizardDetailBaseComponent<MoveSchemeCase> implements OnInit, AfterViewInit, AfterContentChecked {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['isSelected', 'policyNumber', 'policyOwner', 'policyStatus', 'policyInceptionDate'];
  datasource: PolicyChildDataSource;
  selectingAll = false;
  policiesLoaded = 0;

  get awaitingApproval(): boolean {
    if (this.isReadonly) { return true; }
    if (this.isDisabled) { return true; }
    return false;
  }

  get isLoading(): boolean {
    if (!this.datasource) { return false; }
    return this.datasource.isLoading;
  }

  get policiesLoading(): boolean {
    if (this.isLoading) { return true; }
    if (!this.datasource) { return true; }
    return false;
  }

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly alertService: AlertService,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly schemeService: GroupPolicySchemeService,
    private readonly formBuilder: UntypedFormBuilder
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {
    if (!this.datasource) {
      this.datasource = new PolicyChildDataSource(this.schemeService);
    }
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.datasource.rowCount$.subscribe(count => this.paginator.length = count);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();
  }

  loadData() {
    if (!this.datasource) {
      this.datasource = new PolicyChildDataSource(this.schemeService);
    }
    this.datasource.getData(
      this.paginator.pageIndex + 1,
      this.paginator.pageSize ? this.paginator.pageSize : 5,
      'PolicyNumber',
      'asc',
      this.model.sourcePolicyId
    );
    this.form.patchValue({ search: '' });
    this.datasource.search = '';
  }

  onLoadLookups(): void { }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      search: ['']
    });
  }

  populateForm(): void {
    this.loadData();
  }

  populateModel(): void { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  selectPolicy(event: any, policyId: number) {
    const idx = this.model.policyIds.findIndex(p => p === policyId);
    if (event.checked) {
      if (idx < 0) {
        this.model.policyIds.push(policyId);
      }
    } else {
      if (idx >= 0) {
        this.model.policyIds.splice(idx, 1);
      }
    }
  }

  isSelected(policyId: number) {
    if (!this.model.policyIds) {
      this.model.policyIds = [];
    }
    const idx = this.model.policyIds.findIndex(p => p === policyId);
    return idx >= 0;
  }

  getPolicyStatus(policyStatusId: number): string {
    return PolicyStatusEnum[policyStatusId];
  }

  setPolicyFilter(): void {
    if (this.awaitingApproval) { return; }
    this.datasource.search = this.form.get('search').value;
    this.loadData();
  }

  onSelectAll(checked: boolean): void {
    this.selectingAll = true;
    if (checked) {
      this.schemeService.getChildPolicyIds(this.model.sourcePolicyId).subscribe({
        next: (data: number[]) => {
          this.model.policyIds = data;
        },
        error: (response: HttpErrorResponse) => {
          const message = this.getErrorMessage(response);
          this.alertService.error(message);
          this.selectingAll = false;
        },
        complete: () => {
          this.selectingAll = false;
        }
      });
    } else {
      this.model.policyIds = [];
      this.selectingAll = false;
    }
  }

  private getErrorMessage(response: HttpErrorResponse): string {
    if (response.error && response.error.Error) {
      return response.error.Error;
    } else {
      return response.message;
    }
  }
}
