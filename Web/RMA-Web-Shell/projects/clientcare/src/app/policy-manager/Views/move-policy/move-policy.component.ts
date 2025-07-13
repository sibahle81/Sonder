import { Component, ViewChild, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormControl } from '@angular/forms';
import { RepresentativeService } from '../../../broker-manager/services/representative.service';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RolePlayerPolicy } from '../../shared/entities/role-player-policy';
import { Brokerage } from '../../../broker-manager/models/brokerage';
import { Representative } from '../../../broker-manager/models/representative';
import { RolePlayerPolicyService } from '../../shared/Services/role-player-policy.service';
import { MovePoliciesCase } from '../../shared/entities/move-policies-case';
import { PolicyBrokerMoveRequest } from '../../shared/entities/policy-broker-move-request';
import { MoveBrokerPolicyDataSource } from './move-policy.datasource';
import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';
import { DatePickerDateFormat, MatDatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';

import 'src/app/shared/extensions/date.extensions';

@Component({
  selector: 'app-move-policy',
  templateUrl: './move-policy.component.html',
  styleUrls: ['./move-policy.component.css'],
  providers: [
    {
      provide: DateAdapter, useClass: MatDatePickerDateFormat
    },
    {
      provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat
    }
  ]
})
export class MovePolicyComponent extends WizardDetailBaseComponent<MovePoliciesCase> implements OnInit {

  form: UntypedFormGroup;
  displayedPolicyColumns = ['select', 'policyNumber', 'policyType', 'status'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  destinationBrokeragesloading = false;
  policiesLoading = false;
  fromBrokerages: Brokerage[] = [];
  destinationBrokerages: Brokerage[] = [];
  destinationRepresentatives: Representative[] = [];
  sourceBrokerage: Brokerage;
  sourceRepresentative: Representative;
  destinationBrokerage: Brokerage;
  destinationRepresentative: Representative;
  selectedPolicies: RolePlayerPolicy[] = [];
  results: RolePlayerPolicy[] = [];
  hasSourceJuristicRepresentative = false;
  hasDestinationJuristicRepresentative = false;
  sourceJuristicRepresentative: Representative;
  destinationJuristicRepresentative: Representative;
  searchingReps = false;
  isBrokerageLoading = false;
  isJuristicRepLoading = false;
  noRepsFound = false;
  displayedRepColumns = ['code', 'name', 'idNumber', 'actions'];
  minDate: Date;
  selectedRepCanClaimPolicies = true;

  effectiveDaysBack = 61;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly representativeService: RepresentativeService,
    private readonly policyService: RolePlayerPolicyService,
    public readonly dataSource: MoveBrokerPolicyDataSource) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    this.dataSource.setControls(this.paginator, this.sort);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - this.effectiveDaysBack);
    this.createForm(0);
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      id: [id],
      sourceBrokerage: [null],
      sourceRepresentative: [null],
      destinationRepresentative: [null],
      destinationBrokerage: [null],
      sourceJuristicRepresentative: [null],
      destinationJuristicRepresentative: [null],
      filter: [null, [Validators.minLength(3)]],
      effectiveDate: [null, Validators.required]
    });
  }

  onLoadLookups(): void {
  }

  get showRepresentatives(): boolean {
    return !this.destinationRepresentative && this.destinationRepresentatives.length > 0;
  }

  getSelectedPolicies(): RolePlayerPolicy[] {
    if (this.results) {
      return this.results.filter(d => d.selected === true);
    } else {
      return [];
    }
  }

  populateModel(): void {
    this.model.representative = this.destinationRepresentative;
    this.model.brokerage = this.destinationBrokerage;
    this.model.juristicRepresentative = this.destinationJuristicRepresentative;
    this.model.policyMovement.destinationBrokerage = this.destinationBrokerage;
    this.model.policyMovement.destinationRep = this.destinationRepresentative;
    this.selectedPolicies = this.getSelectedPolicies();
    this.model.policyMovement.policies = this.selectedPolicies;
    this.model.policyMovement.effectiveDate = this.form.get('effectiveDate').value;
  }

  populateForm(): void {
    if (this.model) {
      this.sourceJuristicRepresentative = this.model.juristicRepresentative;
      this.hasSourceJuristicRepresentative = this.model.juristicRepresentative ? true : false;
      this.sourceBrokerage = this.model.policyMovement.sourceBrokerage;
      this.sourceRepresentative = this.model.policyMovement.sourceRep;
      this.destinationBrokerage = this.model.policyMovement.destinationBrokerage;
      this.destinationRepresentative = this.model.policyMovement.destinationRep;

      if ((this.sourceBrokerage || this.sourceJuristicRepresentative) && this.sourceRepresentative) {
        this.selectedPolicies = [];
        if (this.model.policyMovement.policies) {
          for (let i = this.model.policyMovement.policies.length - 1; i >= 0; i--) {
            if (this.model.policyMovement.policies[i].productOption) {
              this.selectedPolicies.push(this.model.policyMovement.policies[i]);
            }
          }
        }

        this.getPolicies();
      }
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.model.policyMovement.sourceRep) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('Field "sourceRepresentative" is required');
    }

    if (!this.model.policyMovement.destinationRep) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('Field "destinationRepresentative" is required');
    }

    if (!this.model.policyMovement.effectiveDate || !this.minDate) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('Field "effective date" is required');
    } else {
      const effectiveDate = new Date(this.model.policyMovement.effectiveDate);
      if (effectiveDate.getTime() < this.minDate.getTime()) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push('Field "effective date" must be greater than ' + Date.dateFormat(this.minDate));
      }
    }

    if (this.model.policyMovement.destinationRep && this.model.policyMovement.sourceRep) {
      if (this.model.policyMovement.destinationRep.id === this.model.policyMovement.sourceRep.id) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push('The destination representative must not be the same as the source representative');
      }
    }

    if (this.model.policyMovement.policies && this.model.policyMovement.policies.filter(p => p.selected).length === 0) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('Please select policies to move');
    }

    return validationResult;
  }


  addPolicy(event: any, policy: RolePlayerPolicy) {
    if (event.checked) {
      policy.selected = true;
      if (this.destinationRepresentative) {
        this.checkRepAllowedToSellProducts();
      }
    } else {
      policy.selected = false;
    }
    this.results.filter(x => x.policyId === policy.policyId).forEach(d => { d.selected = policy.selected; });
    this.dataSource.dataChange.next(this.results);
  }

  getPolicies() {
    this.policiesLoading = true;
    this.policyService.getPoliciesForRepresentative(this.sourceRepresentative.id.toString()).subscribe({
      next: results => {
        this.results = results.filter(p => p.policyStatus !== PolicyStatusEnum.PendingCancelled);
        if (this.selectedPolicies) {
          this.selectedPolicies.forEach(d => {
            this.results.filter(x => x.policyId === d.policyId).forEach(y => {
              y.selected = d.selected;
            });
          });
        }
        if (this.isDisabled) {
          this.results = this.results.filter(y => y.selected);
        }
        this.dataSource.getData(this.results);
        this.patchFormValues();
        this.policiesLoading = false;
      }
    });
  }

  patchFormValues() {
    this.form.patchValue({
      sourceRepresentative: `${this.sourceRepresentative.code}: ${this.sourceRepresentative.firstName} ${this.sourceRepresentative.surnameOrCompanyName}`
    });

    if (this.destinationRepresentative) {
      this.form.patchValue({
        destinationRepresentative: `${this.destinationRepresentative.code}: ${this.destinationRepresentative.firstName} ${this.destinationRepresentative.surnameOrCompanyName}`
      });
    }

    if (this.sourceBrokerage) {
      this.form.patchValue({
        sourceBrokerage: this.sourceBrokerage.name
      });
    }

    if (this.sourceJuristicRepresentative) {
      this.form.patchValue({
        sourceJuristicRepresentative: `${this.sourceJuristicRepresentative.code}: ${this.sourceJuristicRepresentative.firstName} ${this.sourceJuristicRepresentative.surnameOrCompanyName}`
      });
    }

    if (this.destinationBrokerage) {
      this.form.patchValue({
        destinationBrokerage: this.destinationBrokerage.name
      });
      if (this.destinationRepresentative) {
        this.getJuristicRepresentative(this.destinationBrokerage.id);
      }
    }

    if (this.destinationJuristicRepresentative) {
      this.form.patchValue({
        destinationJuristicRepresentative: `${this.destinationJuristicRepresentative.code}: ${this.destinationJuristicRepresentative.firstName} ${this.destinationJuristicRepresentative.surnameOrCompanyName}`
      });
    }

    const minDate = new Date(2000, 1, 1);
    let movementDate = new Date(this.model.policyMovement.effectiveDate);
    if (!movementDate || movementDate.getTime() < minDate.getTime()) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      movementDate = today;
    }
    this.form.patchValue({
      effectiveDate: movementDate
    });

  }

  getPolicyStatusDesc(id: number): string {
    const status = PolicyStatusEnum[id];
    return status;
  }

  findRepresentative(event: any): void {
    if (event instanceof KeyboardEvent && event.key !== 'Enter') {
      return;
    }

    if (this.form.get('filter').value) {
      const query = this.form.get('filter').value;
      if (query.length < 3 || query === '') {
        this.form.get('filter').setErrors({ minlength: true });
        this.form.get('filter').markAsTouched();
        this.form.get('filter').updateValueAndValidity();
        return;
      }

      this.searchingReps = true;
      this.resetRepresentativeSearch();

      this.representativeService.searchNaturalRepresentatives(query).subscribe(data => {
        this.noRepsFound = !(data.length > 0);
        this.noRepsFound ? this.destinationRepresentatives = [] : this.destinationRepresentatives = data;
        this.searchingReps = false;
      });
    }
  }

  resetRepresentativeSearch() {
    this.form.patchValue({
      destinationRepresentative: null,
      destinationJuristicRepresentative: null,
      destinationBrokerage: null
    });

    this.destinationRepresentative = null;
    this.destinationJuristicRepresentative = null;
    this.destinationBrokerage = null;
    this.noRepsFound = false;
  }

  selectRepresentative(rep: Representative): void {
    this.destinationRepresentative = rep;
    this.selectedRepCanClaimPolicies = true;
    this.form.patchValue({
      destinationRepresentative: `${rep.code}: ${rep.firstName} ${rep.surnameOrCompanyName}`
    });

    this.checkRepAllowedToSellProducts();
  }

  checkRepAllowedToSellProducts() {
    const productIds: number[] = [];
    this.selectedPolicies = this.getSelectedPolicies();
    if (this.selectedPolicies && this.selectedPolicies.length > 0) {
      this.selectedPolicies.forEach(policy => {
        if (productIds.filter(x => x === policy.productOption.productId).length === 0) {
          productIds.push(policy.productOption.productId);
        }
      });
    }
    const policyMoveRequest = new PolicyBrokerMoveRequest();
    policyMoveRequest.productIds = productIds;
    policyMoveRequest.sourceRepresentativeId = this.destinationBrokerage.id;

    this.representativeService.isRepAllowedToSellProducts(policyMoveRequest).subscribe(allowed => {
      this.selectedRepCanClaimPolicies = allowed;
      if (allowed) {
        this.getBrokerageForRepresentative();

        this.form.get('destinationRepresentative').setErrors(null);
        this.form.get('destinationRepresentative').markAsTouched();
        this.form.get('destinationRepresentative').updateValueAndValidity();
      } else {
        this.destinationRepresentative = null;
        this.destinationJuristicRepresentative = null;
        this.destinationBrokerage = null;
      }
    });
  }

  getBrokerageForRepresentative() {
    this.isBrokerageLoading = true;
    this.form.patchValue({
      destinationRepresentative: `${this.destinationRepresentative.code}: ${this.destinationRepresentative.firstName} ${this.destinationRepresentative.surnameOrCompanyName}`
    });
    this.representativeService.GetBrokeragesForRepresentative(this.destinationRepresentative.id).subscribe(data => {
      if (data.filter(b => b.id === this.destinationRepresentative.activeBrokerage.brokerageId).length > 0) {
        this.destinationBrokerage = data.filter(b => b.id === this.destinationRepresentative.activeBrokerage.brokerageId)[0];
        this.form.patchValue({ destinationBrokerage: this.destinationBrokerage.name });
        this.getJuristicRepresentative(this.destinationBrokerage.id);
      }
    });
    this.isBrokerageLoading = false;
  }

  getJuristicRepresentative(brokerageId: number): void {
    if (this.destinationRepresentative.activeBrokerage && this.destinationRepresentative.activeBrokerage.brokerageId === brokerageId && this.destinationRepresentative.activeBrokerage.juristicRepId && this.destinationRepresentative.activeBrokerage.juristicRepId > 0) {
      this.representativeService.getRepresentative(this.destinationRepresentative.activeBrokerage.juristicRepId).subscribe(data => {
        this.form.patchValue({
          destinationJuristicRepresentative: `${data.code}: ${data.firstName} ${data.surnameOrCompanyName}`
        });
        this.destinationJuristicRepresentative = data;
        this.hasDestinationJuristicRepresentative = true;
      });
    } else {
      this.destinationJuristicRepresentative = null;
      this.hasDestinationJuristicRepresentative = false;
    }
  }

  onSelectAll(checked: boolean) {
    this.results.forEach(policy => {
      policy.selected = checked;
    });
    this.dataSource.dataChange.next(this.results);
  }
}
