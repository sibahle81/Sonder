import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { CoverMemberTypeEnum } from 'projects/shared-models-lib/src/lib/enums/cover-member-type-enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { GroupPolicySchemeService } from '../group-policy-scheme-selection/group-policy-scheme.service';
import { UpgradeDowngradePolicyCase } from '../../shared/entities/upgrade-downgrade-policy-case';
import { ProductOptionService } from '../../../product-manager/services/product-option.service';
import { ChangePolicyOption } from '../../shared/entities/change-policy-option';
import { BenefitModel } from '../../../product-manager/models/benefit-model';
import { ChangeBenefit } from '../../shared/entities/change-benefit';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-group-scheme-benefits',
  templateUrl: './group-scheme-benefits.component.html',
  styleUrls: ['./group-scheme-benefits.component.css']
})
export class GroupSchemeBenefitsComponent extends WizardDetailBaseComponent<UpgradeDowngradePolicyCase> implements AfterContentChecked {

  public benefitsArray: Observable<any>[] = [];

  private readonly blankFilter: string = '-blank-';

  oldBenefitList: BenefitModel[] = [];
  mainMemberBenefits: BenefitModel[] = [];
  spouseBenefits: BenefitModel[] = [];
  childBenefits: BenefitModel[] = [];
  familyBenefits: BenefitModel[] = [];
  stillbornBenefits: BenefitModel[] = [];
  benefits: ChangeBenefit[] = [];
  coverAmountOptions: string[] = [];

  coverAmountFilter = this.blankFilter;
  loadingCurrent = false;
  loadingNew = false;

  errorMessage = 'Please select all the corresponding new benefits';
  benefitColumns = ['coverMemberTypeId', 'coverMemberType', 'oldBenefitId', 'oldBenefitName', 'newBenefitId', 'newBenefitName', 'benefitSelect'];

  get isApprovalWizard(): boolean {
    return this.isReadonly;
  }

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly alertService: AlertService,
    public readonly formBuilder: UntypedFormBuilder,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly schemeService: GroupPolicySchemeService,
    private readonly productOptionService: ProductOptionService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  onLoadLookups(): void { }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      coverAmount: null,
    });
  }

  populateForm(): void {
    this.loadingCurrent = true;
    // Set the current cover amount
    this.form.patchValue({ coverAmount: this.model.coverAmount ? this.model.coverAmount : ''});
    this.coverAmountFilter = this.model.coverAmount ? this.model.coverAmount : this.blankFilter;
    // Make sure "after" is assigned in all cases
    this.model.benefits.forEach(
      b => { if (!b.after) { b.after = 0; } }
    );
    // Load current benefits for policy and benefits of selected policies
    this.schemeService.getBenefitsForSelectedPolicies(this.model).subscribe({
      next: (benefits: BenefitModel[]) => {
        this.loadingNew = true;
        this.oldBenefitList = benefits;
        // Load benefits for selected product option and selected policies
        this.productOptionService.getBenefitsForProductOption(this.model.productOption.after).subscribe({
          next: (data: BenefitModel[]) => {
            // Get distinct cover amount options
            this.coverAmountOptions = this.getCoverAmountOptions(data);
            // Load benefits per member type
            this.mainMemberBenefits = this.getBenefits(data, 1);
            this.spouseBenefits = this.getBenefits(data, 2);
            this.childBenefits = this.getBenefits(data, 3);
            this.familyBenefits = this.getBenefits(data, 4);
            this.stillbornBenefits = this.getBenefits(data, 5);
            this.loadCurrentBenefits(benefits);
            this.loadOptionsForEachBenefit();
            this.checkAllBenefitsAssigned();
          },
          error: (response: HttpErrorResponse) => {
            const errorMessage = response.error.Error ? response.error.Error : response.message;
            this.alertService.error(errorMessage, 'Benefit Error');
            this.loadingNew = false;
          },
          complete: () => {
            this.loadingNew = false;
          }
        });
      },
      error: (response: HttpErrorResponse) => {
        const errorMessage = response.error.Error ? response.error.Error : response.message;
        this.alertService.error(errorMessage, 'Product Option Error');
        this.loadingCurrent = false;
      },
      complete: () => {
        this.loadingCurrent = false;
      }
    });

  }

  private getCoverAmountOptions(benefits: BenefitModel[]): string[] {
    const list: string[] = [];
    benefits.forEach(b => {
      let option = this.getSubstringBetween(b.benefitName.toUpperCase(), '@', 'K');
      if (!String.isNullOrEmpty(option) && option.indexOf('@') === 0) {
        option = option.replaceAll(' ', '');
        if (list.indexOf(option) < 0) {
          list.push(option);
        }
      }
    });
    return list;
  }

  private loadCurrentBenefits(benefits: BenefitModel[]): void {
    this.benefits = [];
    for (let benefit of benefits) {
      const cb = new ChangeBenefit();
      cb.oldBenefitId = benefit.benefitId;
      cb.oldBenefitName = benefit.benefitName;
      cb.coverMemberTypeId = benefit.coverMemberType;
      cb.coverMemberType = this.getCoverMemberType(benefit.coverMemberType);
      const changeOption = this.findChangeOption(benefit.benefitId);
      if (changeOption) {
        if (changeOption.after && changeOption.after > 0) {
          const benefit = this.findBenefit(changeOption.after, cb.coverMemberTypeId);
          if (benefit) {
            cb.newBenefitId = benefit.benefitId;
            cb.newBenefitName = benefit.benefitName;
          }
        }
      }
      this.benefits.push(cb);
    }
    this.loadOptionsForEachBenefit();
  }

  private loadOptionsForEachBenefit(): void {
    this.benefitsArray = [];
    // Populate the benefits array list for each row
    for (let benefit of this.benefits) {
      const benefitList = this.filterBenefitsList(benefit.oldBenefitId, benefit.coverMemberTypeId);
      this.benefitsArray.push(of(benefitList));
      if (benefitList.length === 1) {
        // Auto populate the new benefit if there is only one option
        const newBenefit = benefitList[0];
        benefit.newBenefitId = newBenefit.benefitId;
        benefit.newBenefitName = newBenefit.benefitName;
      } else {
        // Check if there is a new benefit that matches the old benefit name exactly (except for the cover amount)
        const filter = this.coverAmountFilter ? this.coverAmountFilter : this.blankFilter;
        const oldCoverAmount = this.getSubstringBetween(benefit.oldBenefitName, '@', 'K');
        const newBenefitName = benefit.oldBenefitName.replace(oldCoverAmount, filter).replaceAll(' ', '');
        const newBenefit = benefitList.find(b => b.benefitName.replaceAll(' ', '') === newBenefitName);
        if (newBenefit) {
          benefit.newBenefitId = newBenefit.benefitId;
          benefit.newBenefitName = newBenefit.benefitName;
        }
      }
    }
  }

  private findBenefit(benefitId: number, coverMemberType: number): BenefitModel {
    const list = this.getBenefitList(coverMemberType);
    if (!list) { return null; }
    return list.find(b => b.benefitId === benefitId);
  }

  filterBenefits(filter: string): void {
    if (String.isNullOrEmpty(filter)) { return; }
    // Clear all the "after" benefits where the benefit does not match the filter
    this.benefits.forEach(b => { b.newBenefitId = 0; b.newBenefitName = '' });
    // Set the new filter
    this.coverAmountFilter = filter;
    // Load benefits for each option, and auto-populate matching options
    this.loadOptionsForEachBenefit();
  }

  getBenefitList(coverMemberType: number): BenefitModel[] {
    switch (coverMemberType) {
      case CoverMemberTypeEnum.MainMember:
        return this.mainMemberBenefits;
      case CoverMemberTypeEnum.Spouse:
        return this.spouseBenefits;
      case CoverMemberTypeEnum.Child:
        return this.childBenefits;
      case CoverMemberTypeEnum.ExtendedFamily:
        return this.familyBenefits;
      case CoverMemberTypeEnum.Stillborn:
        return this.stillbornBenefits;
    }
    return [];
  }

  filterBenefitsList(oldBenefitId: number, coverMemberType: number): BenefitModel[] {
    let benefitList: BenefitModel[] = [];
    switch (coverMemberType) {
      case CoverMemberTypeEnum.MainMember:
        benefitList = this.mainMemberBenefits;
        break;
      case CoverMemberTypeEnum.Spouse:
        benefitList = this.spouseBenefits;
        break;
      case CoverMemberTypeEnum.Child:
        benefitList = this.childBenefits;
        break;
      case CoverMemberTypeEnum.ExtendedFamily:
        benefitList = this.familyBenefits;
        break;
      case CoverMemberTypeEnum.Stillborn:
        benefitList = this.stillbornBenefits;
        break;
    }
    // Filter by cover amount
    benefitList = this.filterBenefitListByCoverAmount(benefitList);
    // Filter child benefits on the age band
    if (coverMemberType === CoverMemberTypeEnum.Child) {
      const oldBenefit = this.oldBenefitList.find(b => b.benefitId === oldBenefitId);
      benefitList = this.filterBenefitListByAgeRange(benefitList, oldBenefit);
    }
    return benefitList;
  }

  private filterBenefitListByAgeRange(benefitList: BenefitModel[], oldBenefit: BenefitModel): BenefitModel[] {
    if (oldBenefit) {
      // Try to find benefits that match the minimum and maximum ages exactly.
      let list = benefitList.filter(b => b.minimumAge === oldBenefit.minimumAge && b.maximumAge === oldBenefit.maximumAge);
      if (list.length > 0) {
        return list;
      } else {
        // If that fails, try to find benefits that match the minimum age only:
        list = benefitList.filter(b => b.minimumAge === oldBenefit.minimumAge);
        if (list.length > 0) {
          return list;
        }
      }
    }
    return benefitList;
  }

  private filterBenefitListByCoverAmount(benefitList: BenefitModel[]): BenefitModel[] {
    const coverAmount = this.coverAmountFilter ? this.coverAmountFilter.replaceAll(' ', '') : this.blankFilter;
    // If the filter is not found in the list, do not filter
    const list = benefitList.filter(b => b.benefitName.replaceAll(' ', '').indexOf(coverAmount) >= 0);
    return list.length > 0 ? list : benefitList;
  }

  private findChangeOption(oldBenefitId: number): ChangePolicyOption {
    if (!this.model.benefits) { return null; }
    const benefit = this.model.benefits.find(b => b.before === oldBenefitId);
    return benefit;
  }

  private getBenefits(data: BenefitModel[], coverMemberTypeId: number): BenefitModel[] {
    const benefits = data.filter(b => b.coverMemberType === coverMemberTypeId).sort(this.compareBenefit);
    return benefits;
  }

  private compareBenefit(a: BenefitModel, b: BenefitModel): number {
    const nameA = a.benefitName.toLowerCase();
    const nameB = b.benefitName.toLowerCase();
    if (nameA < nameB) { return -1; }
    if (nameA > nameB) { return 1; }
    return 0;
  }

  getCoverMemberType(coverMemberTypeId: number): string {
    return CoverMemberTypeEnum[coverMemberTypeId];
  }

  populateModel(): void {
    this.model.coverAmount = this.form.get('coverAmount').value;
    this.model.benefits = [];
    for (let benefit of this.benefits) {
      const cb = new ChangePolicyOption();
      cb.before = benefit.oldBenefitId;
      cb.after = benefit.newBenefitId;
      this.model.benefits.push(cb);
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    this.checkAllBenefitsAssigned();
    if (this.errorMessage != '') {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('Not all of the new benefits have been selected');
    }
    return validationResult;
  }

  loadBenefitName(oldBenefitId: number, newBenefitId: number, coverMemberType: number): void {
    // Load the old benefit
    const idx = this.benefits.findIndex(b => b.oldBenefitId === oldBenefitId);
    if (idx >= 0) {
      const benefit = this.findBenefit(newBenefitId, coverMemberType);
      if (benefit) {
        this.benefits[idx].newBenefitName = benefit.benefitName;
      }
    }
    this.checkAllBenefitsAssigned();
  }

  private getSubstringBetween(value: string, start: string, end: string) {
    if (String.isNullOrEmpty(value)) { return ''; }
    let idx = value.indexOf(start);
    if (idx >= 0) {
      let str = value.substring(idx);
      idx = str.indexOf(end);
      if (idx > 0) {
        str = str.substring(0, idx + 1);
        return str;
      }
    }
    return value;
  }

  private checkAllBenefitsAssigned(): void {
    for (let benefit of this.benefits) {
      if (!benefit.newBenefitId || benefit.newBenefitId <= 0) {
        this.errorMessage = 'Please select all the corresponding new benefits';
        return;
      }
    }
    this.errorMessage = '';
  }
}
