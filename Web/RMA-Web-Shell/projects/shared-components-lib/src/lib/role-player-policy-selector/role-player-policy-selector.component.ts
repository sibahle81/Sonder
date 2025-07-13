import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { CategoryInsuredEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/categoryInsuredEnum';
import { RolePlayerPolicyDeclarationDetail } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-declaration-detail';

@Component({
  selector: 'role-player-policy-selector',
  templateUrl: './role-player-policy-selector.component.html',
  styleUrls: ['./role-player-policy-selector.component.css']
})
export class RolePlayerPolicySelectorComponent implements OnInit, OnChanges {

  @Input() rolePlayerId: number; // required

  @Input() isWizard: boolean; // optional force wizard behavior
  @Input() isReadOnly: boolean; // optional forced readonly

  @Input() selectedPolicies: Policy[] = []; // optional: to pre-select policies that have been collected outside of this component

  // The below inputs were added to support claims module where we need to return policies that had valid cover at the time of the event for the skilled/unskilled employee
  @Input() eventDate: Date; // optional -- select policy cover and SOI at event date (subject of insurance)
  @Input() categoryInsured: CategoryInsuredEnum; // optional -- to select policy SOI (subject of insurance)

  @Output() selectedPoliciesEmit: EventEmitter<Policy[]> = new EventEmitter();
  @Output() selectedSubjectsOfInsuranceEmit: EventEmitter<RolePlayerPolicyDeclarationDetail[]> = new EventEmitter();

  form: UntypedFormGroup;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  policies: Policy[];
  filteredPolicies: Policy[] = [];
  selectedSubjectsOfInsurance: RolePlayerPolicyDeclarationDetail[] = [];

  isAwaitingRenewal = false;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly policyService: PolicyService,
    private readonly declarationService: DeclarationService
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isLoading$.next(true);
    if (this.rolePlayerId && this.rolePlayerId > 0) {
      this.filteredPolicies = [];
      this.selectedSubjectsOfInsurance = [];
      this.getPolicies();
    } else {
      this.isLoading$.next(false);
    }
  }

  getPolicies() {
    this.loadingMessage$.next('loading policies...please wait');
    this.policyService.getPoliciesWithProductOptionByRolePlayer(this.rolePlayerId).subscribe(results => {
      if (results && results.length > 0) {
        this.policies = results;
        if (this.categoryInsured && this.eventDate) {
          this.isRenewalPending();
        }
        else {
          this.filteredPolicies = this.policies;
          this.isLoading$.next(false);
        }
      }
      else {
        this.policies = results;
        this.isLoading$.next(false);
      }
    });
  }

  isRenewalPending() {
    this.loadingMessage$.next('loading renewal status...please wait');
    this.declarationService.getRequiredRenewalRolePlayerPolicyDeclarations(this.rolePlayerId).subscribe(result => {
      this.isAwaitingRenewal = result && result.length > 0;
      this.getPolicyCover();
    });
  }

  getPolicyCover() {
    this.loadingMessage$.next('loading cover...please wait');
    this.policies.forEach(policy => {
      this.policyService.getPolicyCover(policy.policyId).subscribe(covers => {
        policy.covers = covers;
        this.getPolicyDeclarations(policy);
      });
    });
  }

  getPolicyDeclarations(policy: Policy) {
    this.loadingMessage$.next('loading category cover (SOI)...please wait');
    this.declarationService.getAllRolePlayerPolicyDeclarations(policy).subscribe(result => {
      policy.rolePlayerPolicyDeclarations = result.rolePlayerPolicyDeclarations;
      this.filterPoliciesBySOI(policy);
      this.isLoading$.next(false);
    });
  }

  filterPoliciesBySOI(policy: Policy) {
    if (policy.covers && policy.covers.length > 0) {
      const hasCover = policy.covers.some(s => new Date(s.effectiveFrom) <= new Date(this.eventDate) && (!s.effectiveTo || new Date(s.effectiveTo) >= new Date(this.eventDate)));
      if (hasCover) {
        this.filterCategoryInsuredSOI(policy);
      }
    }
  }

  filterCategoryInsuredSOI(policy: Policy) {
    if (policy.rolePlayerPolicyDeclarations && policy.rolePlayerPolicyDeclarations.length > 0) {
      policy.rolePlayerPolicyDeclarations.forEach(declaration => {
        declaration.rolePlayerPolicyDeclarationDetails.forEach(detail => {
          if (detail.categoryInsured == this.categoryInsured
            && ((new Date(detail.effectiveFrom) <= new Date(this.eventDate) && new Date(detail.effectiveTo) >= new Date(this.eventDate))
              || (this.isAwaitingRenewal))
            && !this.filteredPolicies.includes(policy)) {
            this.filteredPolicies.push(policy);
          }
        });
      });
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      policies: [{ value: null, disabled: this.isReadOnly }, Validators.required]
    });
  }

  selectedPolicyChanged() {
    if (this.categoryInsured && this.eventDate) {
      this.selectedSubjectsOfInsurance = [];

      this.selectedPolicies.forEach(policy => {
        if (policy.rolePlayerPolicyDeclarations && policy.rolePlayerPolicyDeclarations.length > 0) {
          policy.rolePlayerPolicyDeclarations.forEach(declaration => {
            declaration.rolePlayerPolicyDeclarationDetails.forEach(detail => {
              if (detail.categoryInsured == this.categoryInsured && new Date(detail.effectiveFrom) <= new Date(this.eventDate)
                && new Date(detail.effectiveTo) >= new Date(this.eventDate)) {
                this.selectedSubjectsOfInsurance.push(detail);
              }
            });
          });
        }
      });
      this.selectedSubjectsOfInsuranceEmit.emit(this.selectedSubjectsOfInsurance);
    }

    this.selectedPoliciesEmit.emit(this.selectedPolicies);
  }

  getProductOption(rolePlayerPolicyDeclarationDetail: RolePlayerPolicyDeclarationDetail): string {
    let code = 'N/A';

    this.selectedPolicies.forEach(policy => {
      const index = policy.rolePlayerPolicyDeclarations.findIndex(s => s.rolePlayerPolicyDeclarationId == rolePlayerPolicyDeclarationDetail.rolePlayerPolicyDeclarationId);
      if (index > -1) {
        code = `${policy.policyNumber} (${policy.productOption.code})`;
      }
    });
    return code;
  }

  getCategoryInsuredName(categoryInsured: CategoryInsuredEnum): string {
    return this.formatLookup(CategoryInsuredEnum[categoryInsured]);
  }

  formatLookup(lookup: string): string {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
