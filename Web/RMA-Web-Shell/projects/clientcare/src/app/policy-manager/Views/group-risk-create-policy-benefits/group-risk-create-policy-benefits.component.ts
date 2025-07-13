import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

import { GroupRisk } from '../../shared/entities/group-risk';
import { InsuredLivesSummaryTable, InsuredLivesSummary } from '../../shared/entities/insured-lives-summary';
import { GroupRiskService } from '../../shared/Services/group-risk.service';
import { GroupRiskPolicyBenefit } from '../../shared/entities/group-risk-policy-benefit';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject } from 'rxjs';
import { GroupRiskPolicyCaseService } from '../../shared/Services/group-risk-policy-case.service';
import { BrokerageService } from '../../../broker-manager/services/brokerage.service';
import { ProductOptionService } from '../../../product-manager/services/product-option.service';
import { ProductService } from '../../../product-manager/services/product.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { MemberService } from '../../../member-manager/services/member.service';
import { GroupRiskPolicyCaseModel } from '../../shared/entities/group-risk-policy-case-model';
import { GroupRiskPolicy } from '../../shared/entities/group-risk-policy';
import { Benefit } from '../../../product-manager/models/benefit';
import { OptionItemValueLookup } from '../../shared/entities/option-item-value-lookup';
import { BenefitGroupEnum } from '../../../product-manager/models/benefit-group.enum';
import { GroupRiskOptionTypeLevelEnum } from '../../shared/enums/option-type-level-enum';
import { PolicyBenefitOption } from '../../shared/entities/policy-benefit-option';
import { OptionItemFieldEnum } from '../../shared/enums/option-item-field.enum';
import { DatePipe } from '@angular/common';
import { FuneralBenefitComponent } from '../group-risk-create-policy-benefit-views/funeral-benefit/funeral-benefit.component';
import { SpouseDeathBenefitComponent } from '../group-risk-create-policy-benefit-views/spouse-death-benefit/spouse-death-benefit.component';
import { CriticalIllnessBenefitComponent } from '../group-risk-create-policy-benefit-views/critical-illness-benefit/critical-illness-benefit.component';
import { StandardBenefitComponent } from '../group-risk-create-policy-benefit-views/standard-benefit/standard-benefit.component';
import { DeathBenefitComponent } from '../group-risk-create-policy-benefit-views/death-benefit/death-benefit.component';
import { DisabilityLumpsumBenefitComponent } from '../group-risk-create-policy-benefit-views/disability-lumpsum-benefit/disability-lumpsum-benefit.component';
import { TotalTemporaryDisabilityBenefitComponent } from '../group-risk-create-policy-benefit-views/total-temporary-disability-benefit/total-temporary-disability-benefit.component';
import { DisabilityIncomeBenefitComponent } from '../group-risk-create-policy-benefit-views/disability-income-benefit/disability-income-benefit.component';
import { GroupRiskPolicyBenefitCategory } from '../../shared/entities/group-risk-policy-benefit-category';
import { ProductOptionItemValueLookup } from '../../shared/entities/product-option-item-value-lookup';

@Component({
  selector: 'app-group-risk-create-policy-benefits',
  templateUrl: './group-risk-create-policy-benefits.component.html',
  styleUrls: ['./group-risk-create-policy-benefits.component.css']
})
export class GroupRiskCreatePolicyBenefitsComponent extends WizardDetailBaseComponent<GroupRiskPolicyCaseModel> {
  @ViewChild(StandardBenefitComponent, { static: false }) standardBenefitComponent: StandardBenefitComponent;
  @ViewChild(FuneralBenefitComponent, { static: false }) funeralComponent: FuneralBenefitComponent; 
  @ViewChild(SpouseDeathBenefitComponent, { static: false }) spouseDeathComponent: SpouseDeathBenefitComponent;
  @ViewChild(CriticalIllnessBenefitComponent, { static: false }) criticalIllnessComponent: CriticalIllnessBenefitComponent;
  @ViewChild(DeathBenefitComponent, { static: false }) deathBenefitComponent: DeathBenefitComponent;
  @ViewChild(DisabilityLumpsumBenefitComponent, { static: false }) disabilityLumpsumComponent: DisabilityLumpsumBenefitComponent;
  @ViewChild(TotalTemporaryDisabilityBenefitComponent, { static: false }) ttdBenefitComponent: TotalTemporaryDisabilityBenefitComponent;
  @ViewChild(DisabilityIncomeBenefitComponent, { static: false }) disabilityIncomeComponent: DisabilityIncomeBenefitComponent;


  isFuneralBenefit: boolean = false;
  isSpouseDeathBenefit: boolean = false;
  isCriticalIllnessBenefit: boolean = false;
  isDeathBenefit: boolean = false;
  isDisabilityLumpsumBenefit: boolean = false;
  isTotalTemporalDisabilityBenefit: boolean = false;
  isDisabilityIncome: boolean = false;

  isEditingForm: boolean = false;
  isLoading: boolean = false;

  selectedGroupRiskPolicyId: number;
  selectedBenefitId: number;
  selectedBenefitCalcId: number;

  benefitOptionItemLookup: OptionItemValueLookup[];
  benefitDetailDates: Date[];

  displayedColumns = [
    "benefitName",
    "policyNumber",
    "startDate",
    "endDate",
    "benefitCode",
    "actions",
  ];

  public dataSource = new MatTableDataSource<GroupRiskPolicyBenefit>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild("filter", { static: true }) filter: ElementRef;

  isLoadingGroupRiskPolicies$: BehaviorSubject<boolean> = new BehaviorSubject(
    true,
  );
  selectedItemRowIndex: number;
  selectedEffectiveDate  : Date;
  groupRiskPolicyBenefits: GroupRiskPolicyBenefit[] = [];
  groupRiskPolicies: GroupRiskPolicy[] = [];
  benefits: Benefit[] = [];
  selectedProductOptionId: number;

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly groupRiskPolicyCaseService: GroupRiskPolicyCaseService,
    private readonly brokerageService: BrokerageService,
    private readonly productOptionService: ProductOptionService,
    private readonly productService: ProductService,
    private readonly privateAlertService: AlertService,
    private readonly confirmService: ConfirmationDialogsService,
    private readonly userService: UserService,
    private readonly memberService: MemberService,
    private readonly datePipe: DatePipe
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups() { 

  }

  loadLookups(benefit: Benefit) {

    this.standardBenefitComponent.loadLookups(benefit.id);
    switch (benefit.benefitGroup) {
      case BenefitGroupEnum.DisabilityIncome:
        this.loadDisabilityIncomeLookups(benefit.id);
        break;
      case BenefitGroupEnum.Death:
        this.loadDeathBenefitLookups(benefit.id);
        break;
      case BenefitGroupEnum.LumpSumDisability:
        this.loadLumpSumDisabilityLookups(benefit.id);
        break;
      case BenefitGroupEnum.TemporalTotalDisability:
        this.loadTTDLookups(benefit.id);
        break;
      case BenefitGroupEnum.SpouseDeath:
        this.loadSpouseDeathLookups(benefit.id);
        break;
      case BenefitGroupEnum.CriticalIllness:
        this.loadCriticalIllnessLookups(benefit.id);
        break;
      case BenefitGroupEnum.Funeral:
        this.loadFuneralBenfitLookups(benefit.id);
        break;
      default:
    }
    
  }
  createForm() {

    if (Array.isArray(this.model) && this.model.length > 0) {
      this.model = this.model[0];
    }
     
    if(this.model && this.model.groupRiskPolicies){
      this.groupRiskPolicies = this.model.groupRiskPolicies;
    }

    this.form = this.formBuilder.group({
      selectedDetailDate: [""]
    });
  }

  loadDisabilityIncomeLookups(benefitId: number) {
    this.disabilityIncomeComponent.loadLookups(benefitId);
  }

  loadDeathBenefitLookups(benefitId: number) {
    this.deathBenefitComponent.loadLookups(benefitId);
  }

  loadCriticalIllnessLookups(benefitId: number) {
    this.criticalIllnessComponent.loadLookups(benefitId);
  }

  loadLumpSumDisabilityLookups(benefitId: number) {
    this.disabilityLumpsumComponent.loadLookups(benefitId);
  }

  loadTTDLookups(benefitId: number) {
    this.ttdBenefitComponent.loadLookups(benefitId);
  }

  loadSpouseDeathLookups(benefitId: number) {
    this.spouseDeathComponent.loadLookups(benefitId);
  }

  loadFuneralBenfitLookups(benefitId: number) {
    this.funeralComponent.loadLookups(benefitId);
  }

  groupRiskPolicyChange(policyId: any) {
    let productOptionId = this.model.groupRiskPolicies.filter(x => x.policyId === policyId)[0].productOptionId;
    let policyToUpdate = this.selectedGroupRiskPolicyId;
    this.selectedGroupRiskPolicyId = policyId;
    this.selectedProductOptionId = productOptionId;

    this.savePolicyBenefitsToModel(policyToUpdate);

    var existingBenefits = this.model.groupRiskPolicies.filter(x => x.policyId === policyId)[0].groupRiskPolicyBenefits.map(b => b.benefitId)
    this.standardBenefitComponent.filterBenefits(existingBenefits);
  }

  loadDetailsForDate(benefitDetailId: number, effectiveDate: Date) {
    this.loadingStart("Loading details for benefit...")
    this.groupRiskPolicyCaseService.getGroupRiskPolicyBenefit(benefitDetailId, effectiveDate).subscribe({
      next: (result) => {
        if (result) {
          this.loadFormFromBenefit(result);
          this.form.patchValue({ "selectedDetailDate": effectiveDate });
        }  
      },
      complete: () => {
        this.loadingStop();
      }
    });
  }

  onDetailsDateChanged(selectedDate: Date) {
    if (this.selectedItemRowIndex >= 0) {
      var benefitDetailId = this.dataSource.data[this.selectedItemRowIndex].benefitDetailId;
      this.loadDetailsForDate(benefitDetailId, selectedDate);
    }
    
  }
  onBenefitChange(benefit: Benefit) {
    this.isLoading = true;
    this.selectedBenefitId = benefit.id;
    this.setVisibleColumns(benefit);
    this.loadLookups(benefit);
    
    this.groupRiskPolicyCaseService.getBenefitOptionItemValues(benefit.id, "Benefit").subscribe({
      next: result => {
        this.benefitOptionItemLookup = result;
      },
      complete: () => {
        this.isLoading = false;
      }
    });

    this.setPolicyOptionsLoadingStatus(true, benefit.benefitGroup);
    this.loadPolicyLevelOptionItems(this.selectedProductOptionId, benefit.benefitGroup);
  }

  onStartDateChanged(startDate: Date) {
    if (!this.isEditWorkflow)
      this.standardBenefitComponent.form.patchValue({ "effectiveDate": startDate });
  }

  populateForm() {
    
    this.standardBenefitComponent.setViewData(this.model, true);

    if (!this.isDisabled)
      this.standardBenefitComponent.enable();

    if (this.isEditWorkflow)
      this.standardBenefitComponent.form.controls.effectiveDate.enable();
    else
      this.standardBenefitComponent.form.controls.effectiveDate.disable();

    if (this.inApprovalMode)
      this.disableComponents();

    this.loadAllCaseBenefits();
  }

  loadGroupRiskBenefits(policyId: number) {
    var policy = this.model.groupRiskPolicies.find(x => x.policyId == policyId);
    if (policy) {
      if (policy.groupRiskPolicyBenefits) {
        this.groupRiskPolicyBenefits = policy.groupRiskPolicyBenefits;
        this.bindPolicyBenefitsTable();
      }
    }
  }

  savePolicyBenefitsToModel(policyId: number) {
    var policy = this.model.groupRiskPolicies.find(x => x.policyId == policyId);
    if (policy) {
      policy.groupRiskPolicyBenefits = this.groupRiskPolicyBenefits.filter(x => x.policyId == policyId);
    }
  }

  readForm(): GroupRiskPolicyBenefit {
    var policyBenefit = new GroupRiskPolicyBenefit();
    var benefit = this.getSelectedBenefit();
    
    policyBenefit.benefitName = benefit.name;
    policyBenefit.benefitGroup = benefit.benefitGroup;
    policyBenefit.benefitCode = benefit.code;

    var formData = this.standardBenefitComponent.form.getRawValue();
    policyBenefit.policyId = formData.policyId;
    policyBenefit.benefitId = formData.benefitId;
    policyBenefit.startDate = new Date(this.datePipe.transform(formData.startDate, 'yyyy-MM-dd')).getCorrectUCTDate();
    policyBenefit.endDate = (!formData.endDate) ? null : new Date(this.datePipe.transform(formData.endDate, 'yyyy-MM-dd')).getCorrectUCTDate();
    policyBenefit.newEffectiveDate = new Date(this.datePipe.transform(formData.effectiveDate, 'yyyy-MM-dd')).getCorrectUCTDate();
    policyBenefit.benefitDetailId = this.selectedItemRowIndex >= 0 ? this.dataSource.data[this.selectedItemRowIndex].benefitDetailId : 0;
    

    if (!this.isEditWorkflow || policyBenefit.benefitDetailId == 0) {
      policyBenefit.benefitOptions.push(this.createOptionItem(formData.benefitCalcId));
      policyBenefit.benefitOptions.push(this.createOptionItem(formData.benefitPayeeId));
      policyBenefit.benefitOptions.push(this.createOptionItem(formData.billingLevel));
      policyBenefit.benefitOptions.push(this.createOptionItem(formData.branchBilling));
      policyBenefit.benefitDetailsEffectiveDates = [];
      policyBenefit.benefitDetailsEffectiveDates.push(policyBenefit.newEffectiveDate);

      switch (benefit.benefitGroup) {
        case BenefitGroupEnum.Death:
          formData = this.deathBenefitComponent.form.getRawValue();
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.freeCoverLimit, "MaxFreeCoverLimit"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.previousInsurerFCL, "PreviousFCL"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.maximumBenefitMultiple, "BenefitMaxMultiple"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.maximumSumAssured, "BenefitMaxSumAssured"));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.continuedCover));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.conversionOption));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.taxReplacement));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.extendedDeathBenefit));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.bodyRepatriation));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.shareOfFund));
          break;
        case BenefitGroupEnum.LumpSumDisability:
          formData = this.disabilityLumpsumComponent.form.getRawValue();
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.freeCoverLimit, "MaxFreeCoverLimit"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.previousInsurerFCL, "PreviousFCL"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.maximumBenefitMultiple, "BenefitMaxMultiple"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.maximumSumAssured, "BenefitMaxSumAssured"));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.benefitBasis));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.continuedCover));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.conversionOption));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.taxReplacement));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.shareOfFund));
          break;
        case BenefitGroupEnum.DisabilityIncome:
          formData = this.disabilityIncomeComponent.form.getRawValue();
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.freeCoverLimit, "MaxFreeCoverLimit"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.previousInsurerFCL, "PreviousFCL"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.maximumWaiverBenefit, "BenefitMaxWaiver"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.maxMedicalPremiumWaiverBenefit, "MedPremiumWaiverMax"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.maximumRehabilitationBenefit, "BenefitMaxRehab"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.maximumSumAssured, "BenefitMaxSumAssured"));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.paybackBenefit));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.survivorBenefit));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.rehabilitationBenefit));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.recoveryBonus));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.conversionOption));
          break;
        case BenefitGroupEnum.CriticalIllness:
          formData = this.criticalIllnessComponent.form.getRawValue();
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.freeCoverLimit, "MaxFreeCoverLimit"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.previousInsurerFCL, "PreviousFCL"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.maximumBenefitMultiple, "BenefitMaxMultiple"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.maximumSumAssured, "BenefitMaxSumAssured"));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.benefitBasis));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.continuedCover));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.conversionOption));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.topUpBenefit));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.survivalPeriod));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.restoreDeathBenfit));
          break;
        case BenefitGroupEnum.TemporalTotalDisability:
          formData = this.ttdBenefitComponent.form.getRawValue();
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.freeCoverLimit, "MaxFreeCoverLimit"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.previousInsurerFCL, "PreviousFCL"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.maximumSumAssured, "BenefitMaxSumAssured"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.maximumWaiverBenefit, "BenefitMaxWaiver"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.maxMedicalPremiumWaiverBenefit, "MedPremiumWaiverMax"));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.paybackBenefit));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.conversionOption));
          break;
        case BenefitGroupEnum.SpouseDeath:
          formData = this.spouseDeathComponent.form.getRawValue();
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.freeCoverLimit, "MaxFreeCoverLimit"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.previousInsurerFCL, "PreviousFCL"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.maximumBenefitMultiple, "BenefitMaxMultiple"));
          policyBenefit.benefitOptions.push(this.createOptionItem(0, formData.maximumSumAssured, "BenefitMaxSumAssured"));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.continuedCover));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.conversionOption));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.extendedDeathBenefit));
          break;
        case BenefitGroupEnum.Funeral:
          formData = this.funeralComponent.form.getRawValue();
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.continuedCover));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.extendedDeathBenefit));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.bodyRepatriation));
          policyBenefit.benefitOptions.push(this.createOptionItem(formData.paidUpBenefit));
          break;
        default:
          break;
      }
    }

    if (this.isEditWorkflow) {
      if (this.selectedItemRowIndex >= 0) {
        policyBenefit.benefitOptions = this.dataSource.data[this.selectedItemRowIndex].benefitOptions;
        policyBenefit.benefitDetailId = this.dataSource.data[this.selectedItemRowIndex].benefitDetailId;
        policyBenefit.benefitDetailsEffectiveDates = this.dataSource.data[this.selectedItemRowIndex].benefitDetailsEffectiveDates;
      }
        

      this.setUpdatedBenefitOptions(benefit.benefitGroup, policyBenefit.benefitOptions)

    }
    
    //set categories back
    policyBenefit.benefitCategories = this.getBenefitCategoriesFromModel(policyBenefit.policyId, policyBenefit.benefitId);
    return policyBenefit;
  }

  getBenefitCategoriesFromModel(policyId: number, benefitId: number): GroupRiskPolicyBenefitCategory[] {
    var benefitCategories: GroupRiskPolicyBenefitCategory[] = [];
    var policy = this.model.groupRiskPolicies.find(x => x.policyId == policyId);
    if (policy) {
      var benefit = policy.groupRiskPolicyBenefits.find(x => x.benefitId == benefitId);
      if (benefit)
        return benefit.benefitCategories;
    }

    return benefitCategories;
  }

  getProductOptionBenefits(productOptionId: number) {
    if (productOptionId > 0) {
      this.productOptionService
        .getBenefitsByProductOptionId(productOptionId)
        .subscribe((result) => {
          this.benefits = result;
        });
    }
  }

  onSaveBenefit() {
    if (this.formsValid()) {
      const formObject = this.readForm();
      this.saveBenefit(formObject);
    } else {
      //this.form.updateValueAndValidity();
      this.privateAlertService.error(
        "Please ensure all fields are captured.",
        "Add Policy Benefits",
      );
    }
  }

  saveBenefit(benefit: GroupRiskPolicyBenefit) {
    if (this.isEditingForm) {
      this.EditBenefit(benefit);
    }
    else {
      this.groupRiskPolicyBenefits.push(benefit);
      this.privateAlertService.success(
        "Policy benefit has been created Successfully.",
        "Create Policy Benefit");
    }
    this.isEditingForm = false;
    this.updateDataSource();
    this.resetForms();
  }

  EditBenefit(benefit: GroupRiskPolicyBenefit) {
    this.groupRiskPolicyBenefits[this.selectedItemRowIndex] = benefit;
    this.privateAlertService.success(
      "Policy benefit has been updated Successfully.",
      "Update Policy Benefit");
  }

  createPolicyNumber(request: GroupRiskPolicyBenefit): void {
    if (request) {
      if (this.selectedItemRowIndex > -1) {
        this.groupRiskPolicyBenefits[this.selectedItemRowIndex] = request;
        this.privateAlertService.success(
          "Policy benefit has been updated Successfully.",
          "Update Policy Benefit"
        );
      } else {
        this.groupRiskPolicyBenefits.push(request);
        this.privateAlertService.success(
          "Policy benefit has been added Successfully.",
          "Add Policy Benefit"
        );
      }
      this.updateDataSource();
      this.selectedItemRowIndex = -1;
      this.resetForms();
    }
  }

  bindPolicyBenefitsTable() {
    this.updateDataSource();
  }

  updateDataSource(): void {
    this.dataSource.data = [...this.groupRiskPolicyBenefits];
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  populateModel() {
    this.setBenefitKeyFieldsEnabled();
    if (this.isEditWorkflow) {
      this.updateBenefitsModel();
      return;
    }
    if (!this.isDisabled) {
    this.savePolicyBenefitsToModel(this.selectedGroupRiskPolicyId);
      this.isEditingForm = false;
      this.resetForms(); 
    }
  }

  updateBenefitsModel() {
    for (let i = 0; i < this.dataSource.data.length; i++) {
      for (let p = 0; p < this.model.groupRiskPolicies.length; p++) {
        if (this.dataSource.data[i].policyId == this.model.groupRiskPolicies[p].policyId) {
          for (let b = 0; b < this.model.groupRiskPolicies[p].groupRiskPolicyBenefits.length; b++) {
            if (this.dataSource.data[i].benefitId == this.model.groupRiskPolicies[p].groupRiskPolicyBenefits[b].benefitId) {
              this.model.groupRiskPolicies[p].groupRiskPolicyBenefits[b] = this.dataSource.data[i];
              this.model.groupRiskPolicies[p].groupRiskPolicyBenefits[b].benefitDetailsEffectiveDates = this.dataSource.data[i].benefitDetailsEffectiveDates;
            }
          }
        }
      }
    }
  }

  onRemove(item: any, rowIndex: number): void {
    this.confirmService
      .confirmWithoutContainer(
        "Remove Policy Benefit",
        "Are you sure you want to remove this policy benefit?",
        "Center",
        "Center",
        "Yes",
        "No"
      )
      .subscribe((result) => {
        if (result === true) {
          this.groupRiskPolicyBenefits.splice(rowIndex, 1);
          this.updateDataSource();
        }
      });
  }


  hideColumns() {
    this.isFuneralBenefit = false;
    this.isSpouseDeathBenefit = false;
    this.isCriticalIllnessBenefit = false;
    this.isFuneralBenefit = false;
    this.isDisabilityLumpsumBenefit = false;
    this.isDeathBenefit = false;
    this.isTotalTemporalDisabilityBenefit = false;
    this.isDisabilityIncome = false;
  }

  setVisibleColumns(benefit: Benefit) {
    this.hideColumns();
    switch (benefit.benefitGroup) {
      case BenefitGroupEnum.Death:
        this.isDeathBenefit = true;
        break;
      case BenefitGroupEnum.LumpSumDisability:
        this.isDisabilityLumpsumBenefit = true;
        break;
      case BenefitGroupEnum.DisabilityIncome:
        this.isDisabilityIncome = true;
        break;
      case BenefitGroupEnum.CriticalIllness:
        this.isCriticalIllnessBenefit = true;
        break;
      case BenefitGroupEnum.TemporalTotalDisability:
        this.isTotalTemporalDisabilityBenefit = true;
        break;
      case BenefitGroupEnum.SpouseDeath:
        this.isSpouseDeathBenefit = true;
        break;
      case BenefitGroupEnum.Funeral:
        this.isFuneralBenefit = true;
        break;
      default:
        break;
    }

  }

  setVisibleColumnsForBenefitId(benefitId: number) {
    var benefit = this.benefits.find(x => x.id == benefitId);
    this.setVisibleColumns(benefit);
  }

  onEdit(item: GroupRiskPolicyBenefit, rowIndex: number): void {
    this.selectedItemRowIndex = rowIndex;
    if (this.isDisabled || this.isEditWorkflow) {
      this.loadFromSavedBenefit(item);
      if (this.isEditWorkflow) this.isEditingForm = true;
      this.form.controls.selectedDetailDate.enable();
      return;
    }

    var productOptionId = this.model.groupRiskPolicies.find(x => x.policyId === item.policyId).productOptionId;
    this.standardBenefitComponent.changeGroupRiskPolicy(item.policyId, productOptionId, false);
    var benefit = this.getSelectedBenefit(item.benefitId);
    if (!benefit) {
      benefit = new Benefit();
      benefit.id = item.benefitId;
      benefit.benefitGroup = item.benefitGroup;
    }
    this.isEditingForm = true;
    this.isLoading = true;
    this.setVisibleColumns(benefit);
    this.resetForms();
    this.loadLookups(benefit);
    this.groupRiskPolicyCaseService.getBenefitOptionItemValues(item.benefitId, "Benefit").subscribe({
      next: result => {
        this.benefitOptionItemLookup = result;
        this.loadFormFromBenefit(item);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
    
  }
  loadProductOptionsAndForm(item: GroupRiskPolicyBenefit) {
    var productOptionId = this.model.groupRiskPolicies.find(x => x.policyId == item.policyId).productOptionId;
    if (this.selectedProductOptionId !== productOptionId) {
      this.isLoading = true;
      this.setPolicyOptionsLoadingStatus(true, item.benefitGroup);
      this.loadPolicyLevelOptionItems(productOptionId, item.benefitGroup);
      this.standardBenefitComponent.changeGroupRiskPolicy(item.policyId, productOptionId, false);
      this.productOptionService
        .getBenefitsByProductOptionId(productOptionId)
        .subscribe(
          {
            next: (result) => {
              this.benefits = result;
              this.setVisibleColumnsForBenefitId(item.benefitId);
              this.loadFormFromBenefit(item);
              this.loadLookups(this.benefits.find(x => x.id == item.benefitId));
            },
            complete: () => {
              this.isLoading = false;
            }

          });
    }
    else{
      this.setVisibleColumnsForBenefitId(item.benefitId);
      this.loadFormFromBenefit(item);
      this.loadLookups(this.benefits.find(x => x.id == item.benefitId));
    }

    this.selectedProductOptionId = productOptionId;
  }

  loadFromSavedBenefit(item: GroupRiskPolicyBenefit) {
    if (this.selectedBenefitId !== item.benefitId) {
      this.isLoading = true;
      this.groupRiskPolicyCaseService.getBenefitOptionItemValues(item.benefitId, "Benefit").subscribe({
        next: result => {
          this.benefitOptionItemLookup = result;
          this.loadProductOptionsAndForm(item);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
      this.selectedBenefitId = item.benefitId;
    } else {
      this.loadProductOptionsAndForm(item);
    }
    
  }

  loadFormFromBenefit(benefit: GroupRiskPolicyBenefit) {
    this.standardBenefitComponent.form.patchValue({
      policyId: benefit.policyId,
      benefitId: benefit.benefitId,
      startDate: benefit.startDate,
      endDate: benefit.endDate,
      effectiveDate: benefit.newEffectiveDate,
      benefitCalcId: this.getOption(OptionItemFieldEnum.BenefitCalculationMethod, benefit.benefitOptions).benefitOptionItemValueId,
      benefitPayeeId: this.getOption(OptionItemFieldEnum.BenefitPayee, benefit.benefitOptions).benefitOptionItemValueId,
      billingLevel: this.getOption(OptionItemFieldEnum.BillingLevel, benefit.benefitOptions).benefitOptionItemValueId,
      branchBilling: this.getOption(OptionItemFieldEnum.BranchBilling, benefit.benefitOptions).benefitOptionItemValueId
    });

    switch (benefit.benefitGroup) {
      case BenefitGroupEnum.SpouseDeath:
        this.spouseDeathComponent.form.patchValue({
          freeCoverLimit: this.getOption(OptionItemFieldEnum.FreeCoverLimit, benefit.benefitOptions).overrideValue,
          previousInsurerFCL: this.getOption(OptionItemFieldEnum.PreviousInsurerFCL, benefit.benefitOptions).overrideValue,
          continuedCover: this.getOption(OptionItemFieldEnum.ContinuedCover, benefit.benefitOptions).benefitOptionItemValueId,
          conversionOption: this.getOption(OptionItemFieldEnum.ConversionOption, benefit.benefitOptions).benefitOptionItemValueId,
          extendedDeathBenefit: this.getOption(OptionItemFieldEnum.ExtendedDeathBenefit, benefit.benefitOptions).benefitOptionItemValueId,
          maximumBenefitMultiple: this.getOption(OptionItemFieldEnum.MaxBenefitMultiple, benefit.benefitOptions).overrideValue,
          maximumSumAssured: this.getOption(OptionItemFieldEnum.MaxSumAssured, benefit.benefitOptions).overrideValue
        });
        break;
      case BenefitGroupEnum.CriticalIllness:
        this.criticalIllnessComponent.form.patchValue({
          benefitBasis: this.getOption(OptionItemFieldEnum.BenefitBasis, benefit.benefitOptions).benefitOptionItemValueId,
          freeCoverLimit: this.getOption(OptionItemFieldEnum.FreeCoverLimit, benefit.benefitOptions).overrideValue,
          previousInsurerFCL: this.getOption(OptionItemFieldEnum.PreviousInsurerFCL, benefit.benefitOptions).overrideValue,
          continuedCover: this.getOption(OptionItemFieldEnum.ContinuedCover, benefit.benefitOptions).benefitOptionItemValueId,
          conversionOption: this.getOption(OptionItemFieldEnum.ConversionOption, benefit.benefitOptions).benefitOptionItemValueId,
          topUpBenefit: this.getOption(OptionItemFieldEnum.TopUpBenefit, benefit.benefitOptions).benefitOptionItemValueId,
          survivalPeriod: this.getOption(OptionItemFieldEnum.SurvivalPeriod, benefit.benefitOptions).benefitOptionItemValueId,
          restoreDeathBenfit: this.getOption(OptionItemFieldEnum.RestoreDeathBenefit, benefit.benefitOptions).benefitOptionItemValueId,
          maximumBenefitMultiple: this.getOption(OptionItemFieldEnum.MaxBenefitMultiple, benefit.benefitOptions).overrideValue,
          maximumSumAssured: this.getOption(OptionItemFieldEnum.MaxSumAssured, benefit.benefitOptions).overrideValue
        });
        break;
      case BenefitGroupEnum.Funeral:
        this.funeralComponent.form.patchValue({
          continuedCover: this.getOption(OptionItemFieldEnum.ContinuedCover, benefit.benefitOptions).benefitOptionItemValueId,
          extendedDeathBenefit: this.getOption(OptionItemFieldEnum.ExtendedDeathBenefit, benefit.benefitOptions).benefitOptionItemValueId,
          bodyRepatriation: this.getOption(OptionItemFieldEnum.BodyRepatriationBenefit, benefit.benefitOptions).benefitOptionItemValueId,
          paidUpBenefit: this.getOption(OptionItemFieldEnum.PaidUpBenefit, benefit.benefitOptions).benefitOptionItemValueId,
        });
        break;
      case BenefitGroupEnum.Death:
        this.deathBenefitComponent.form.patchValue({
          freeCoverLimit: this.getOption(OptionItemFieldEnum.FreeCoverLimit, benefit.benefitOptions).overrideValue,
          previousInsurerFCL: this.getOption(OptionItemFieldEnum.PreviousInsurerFCL, benefit.benefitOptions).overrideValue,
          continuedCover: this.getOption(OptionItemFieldEnum.ContinuedCover, benefit.benefitOptions).benefitOptionItemValueId,
          conversionOption: this.getOption(OptionItemFieldEnum.ConversionOption, benefit.benefitOptions).benefitOptionItemValueId,
          taxReplacement: this.getOption(OptionItemFieldEnum.TaxReplacementCover, benefit.benefitOptions).benefitOptionItemValueId,
          extendedDeathBenefit: this.getOption(OptionItemFieldEnum.ExtendedDeathBenefit, benefit.benefitOptions).benefitOptionItemValueId,
          shareOfFund: this.getOption(OptionItemFieldEnum.ShareOfFund, benefit.benefitOptions).benefitOptionItemValueId,
          bodyRepatriation: this.getOption(OptionItemFieldEnum.BodyRepatriationBenefit, benefit.benefitOptions).benefitOptionItemValueId,
          maximumBenefitMultiple: this.getOption(OptionItemFieldEnum.MaxBenefitMultiple, benefit.benefitOptions).overrideValue,
          maximumSumAssured: this.getOption(OptionItemFieldEnum.MaxSumAssured, benefit.benefitOptions).overrideValue
        });
        break;
      case BenefitGroupEnum.LumpSumDisability:
        this.disabilityLumpsumComponent.form.patchValue({
          benefitBasis: this.getOption(OptionItemFieldEnum.BenefitBasis, benefit.benefitOptions).benefitOptionItemValueId,
          freeCoverLimit: this.getOption(OptionItemFieldEnum.FreeCoverLimit, benefit.benefitOptions).overrideValue,
          previousInsurerFCL: this.getOption(OptionItemFieldEnum.PreviousInsurerFCL, benefit.benefitOptions).overrideValue,
          continuedCover: this.getOption(OptionItemFieldEnum.ContinuedCover, benefit.benefitOptions).benefitOptionItemValueId,
          conversionOption: this.getOption(OptionItemFieldEnum.ConversionOption, benefit.benefitOptions).benefitOptionItemValueId,
          taxReplacement: this.getOption(OptionItemFieldEnum.TaxReplacementCover, benefit.benefitOptions).benefitOptionItemValueId,
          shareOfFund: this.getOption(OptionItemFieldEnum.ShareOfFund, benefit.benefitOptions).benefitOptionItemValueId,
          maximumBenefitMultiple: this.getOption(OptionItemFieldEnum.MaxBenefitMultiple, benefit.benefitOptions).overrideValue,
          maximumSumAssured: this.getOption(OptionItemFieldEnum.MaxSumAssured, benefit.benefitOptions).overrideValue
        });
        break;
      case BenefitGroupEnum.TemporalTotalDisability:
        this.ttdBenefitComponent.form.patchValue({
          conversionOption: this.getOption(OptionItemFieldEnum.ConversionOption, benefit.benefitOptions).benefitOptionItemValueId,
          paybackBenefit: this.getOption(OptionItemFieldEnum.PaybackBenefit, benefit.benefitOptions).benefitOptionItemValueId,
          freeCoverLimit: this.getOption(OptionItemFieldEnum.FreeCoverLimit, benefit.benefitOptions).overrideValue,
          previousInsurerFCL: this.getOption(OptionItemFieldEnum.PreviousInsurerFCL, benefit.benefitOptions).overrideValue,
          maximumSumAssured: this.getOption(OptionItemFieldEnum.MaxSumAssured, benefit.benefitOptions).overrideValue,
          maximumWaiverBenefit: this.getOption(OptionItemFieldEnum.MaxWaiverBenefit, benefit.benefitOptions).overrideValue,
          maxMedicalPremiumWaiverBenefit: this.getOption(OptionItemFieldEnum.MaxMedicalPremiumWaiver, benefit.benefitOptions).overrideValue,
        });
        break;
      case BenefitGroupEnum.DisabilityIncome:
        this.disabilityIncomeComponent.form.patchValue({
          conversionOption: this.getOption(OptionItemFieldEnum.ConversionOption, benefit.benefitOptions).benefitOptionItemValueId,
          paybackBenefit: this.getOption(OptionItemFieldEnum.PaybackBenefit, benefit.benefitOptions).benefitOptionItemValueId,
          survivorBenefit: this.getOption(OptionItemFieldEnum.SurvivorBenefit, benefit.benefitOptions).benefitOptionItemValueId,
          recoveryBonus: this.getOption(OptionItemFieldEnum.RecoveryBonus, benefit.benefitOptions).benefitOptionItemValueId,
          rehabilitationBenefit: this.getOption(OptionItemFieldEnum.RehabilitationBenefit, benefit.benefitOptions).benefitOptionItemValueId,
          freeCoverLimit: this.getOption(OptionItemFieldEnum.FreeCoverLimit, benefit.benefitOptions).overrideValue,
          previousInsurerFCL: this.getOption(OptionItemFieldEnum.PreviousInsurerFCL, benefit.benefitOptions).overrideValue,
          maximumSumAssured: this.getOption(OptionItemFieldEnum.MaxSumAssured, benefit.benefitOptions).overrideValue,
          maximumWaiverBenefit: this.getOption(OptionItemFieldEnum.MaxWaiverBenefit, benefit.benefitOptions).overrideValue,
          maxMedicalPremiumWaiverBenefit: this.getOption(OptionItemFieldEnum.MaxMedicalPremiumWaiver, benefit.benefitOptions).overrideValue,
          maximumRehabilitationBenefit: this.getOption(OptionItemFieldEnum.MaxRehabilitationBenefit, benefit.benefitOptions).overrideValue,
        });
      default:
        break;
    }

    this.setBenefitKeyFieldsEnabled();

    if (benefit.benefitDetailsEffectiveDates.length >= 1) {
      if (benefit.benefitDetailsEffectiveDates.length > 1)
        this.benefitDetailDates = benefit.benefitDetailsEffectiveDates.sort((startDate: Date, endDate: Date) => { return new Date(endDate).getTime() - new Date(startDate).getTime(); });
      else
        this.benefitDetailDates = benefit.benefitDetailsEffectiveDates;

      this.form.patchValue({ selectedDetailDate: benefit.benefitDetailsEffectiveDates[0] });
    }
  }

  setBenefitKeyFieldsEnabled() {
    if (this.selectedItemRowIndex >= 0) {
      if ((this.isEditWorkflow && this.dataSource.data[this.selectedItemRowIndex].benefitDetailId > 0) || this.isDisabled) {
        this.standardBenefitComponent.form.controls.benefitId.disable();
        this.standardBenefitComponent.form.controls.policyId.disable();
      }
      else {
        this.standardBenefitComponent.form.controls.benefitId.enable();
        this.standardBenefitComponent.form.controls.policyId.enable();
      }
    }
    else {
      this.standardBenefitComponent.form.controls.benefitId.enable();
      this.standardBenefitComponent.form.controls.policyId.enable();
    }
  }

  createOptionItem(optionItemValueId: number, overrideValue: number = null, optionTypeCode: string = null): PolicyBenefitOption {
    if (optionItemValueId > 0)
      return new PolicyBenefitOption(optionItemValueId);

    return new PolicyBenefitOption(this.getOptionItemValueId(optionTypeCode), overrideValue);
  }

  getOptionItemValueId(optionTypeCode: string): number {
    var optionItemValue = this.benefitOptionItemLookup.find(x => x.optionTypeCode === optionTypeCode);
    if (optionItemValue)
      return optionItemValue.benefitOptionItemValueId;
    return 0;  
  }

  getOption(optionField: OptionItemFieldEnum, benefitOptions: PolicyBenefitOption[]): PolicyBenefitOption {
    for (var i = 0; i < this.benefitOptionItemLookup.length ; i++) {
      if (this.benefitOptionItemLookup[i].optionItemField == optionField) {
        var selectedOption = benefitOptions.find(x => x.benefitOptionItemValueId == this.benefitOptionItemLookup[i].benefitOptionItemValueId);
        if (selectedOption)
          return selectedOption;
      }
    }
    
    return new PolicyBenefitOption(0);
  }

  ToKeyValuePair(enums: any) {
    const results = [];
    const keys = Object.values(enums).filter((v) => Number.isInteger(v));
    for (const key of keys) {
      if (key && enums[key as number]) {
        results.push({ id: key, name: enums[key as number] });
      }
    }
    return results;
  }

  formatLookup(lookup: string): string {
    return lookup
      ? lookup.replace(/([a-z])([A-Z])/g, "$1 $2").replace("_", "-")
      : "N/A";
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, " $1").trim();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {

    validationResult.errors = 0;
    validationResult.errorMessages =  [];

    this.model.groupRiskPolicies.forEach(policy => {
      if (!policy.groupRiskPolicyBenefits || policy.groupRiskPolicyBenefits.length == 0) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push('Please add Policy benefits');
      }
    })

    return validationResult;
  }

  loadAllCaseBenefits() {
    var benefits: GroupRiskPolicyBenefit[] = [];
    this.groupRiskPolicyBenefits = [];
    for(var i = 0; i < this.model.groupRiskPolicies.length; i++) {
      if (this.model.groupRiskPolicies[i].groupRiskPolicyBenefits.length > 0) {
        benefits.push(...this.model.groupRiskPolicies[i].groupRiskPolicyBenefits);
      }
    }

    this.groupRiskPolicyBenefits = benefits;
    this.bindPolicyBenefitsTable();
  }

  getBenefitPolicyNumber(policyId: number): string {
    if (this.model.groupRiskPolicies) {
      var policy = this.model.groupRiskPolicies.find(x => x.policyId == policyId);
      if (policy)
        return policy.policyNumber;
    }

    return "";
  }

  get isEditWorkflow(): boolean {
    if (!this.context)
      return false;
    return this.context.wizard.linkedItemId > 0;
  }

  getSelectedBenefit(benefitId: number = null): Benefit {
    return benefitId == null ? this.standardBenefitComponent.getSelectedBenefit() : this.standardBenefitComponent.getSelectedBenefitById(benefitId);
  }

  formsValid(): boolean {
    var validationResult = this.standardBenefitComponent.onValidateModel(new ValidationResult(""));
    if (validationResult.errorMessages.length > 0)
      return false;


    if (this.isDeathBenefit)
      validationResult = this.deathBenefitComponent.onValidateModel(new ValidationResult(""));

    if (this.isFuneralBenefit)
      validationResult = this.funeralComponent.onValidateModel(new ValidationResult(""));

    if (this.isCriticalIllnessBenefit)
      validationResult = this.criticalIllnessComponent.onValidateModel(new ValidationResult(""));

    if (this.isDisabilityIncome)
      validationResult = this.disabilityIncomeComponent.onValidateModel(new ValidationResult(""));

    if (this.isDisabilityLumpsumBenefit)
      validationResult = this.disabilityLumpsumComponent.onValidateModel(new ValidationResult(""));

    if (this.isTotalTemporalDisabilityBenefit)
      validationResult = this.ttdBenefitComponent.onValidateModel(new ValidationResult(""));

    if (this.isSpouseDeathBenefit)
      validationResult = this.spouseDeathComponent.onValidateModel(new ValidationResult(""));


    if (validationResult.errorMessages.length > 0)
      return false;

    return true;
  }
  resetForms() {
    this.standardBenefitComponent.form.reset();
    if (this.isSpouseDeathBenefit)
      this.spouseDeathComponent.form.reset();
    if (this.isCriticalIllnessBenefit)
      this.criticalIllnessComponent.form.reset();
    if (this.isFuneralBenefit)
      this.funeralComponent.form.reset();
    if (this.isDeathBenefit)
      this.deathBenefitComponent.form.reset();
    if (this.isDisabilityLumpsumBenefit)
      this.disabilityLumpsumComponent.form.reset();
    if (this.isTotalTemporalDisabilityBenefit)
      this.ttdBenefitComponent.form.reset();
    if (this.isDisabilityIncome)
      this.disabilityIncomeComponent.form.reset();

    this.form.patchValue({ "selectedDetailDate": "" });
    this.standardBenefitComponent.form.controls.benefitId.enable();
  }

  disableComponents() {
    this.standardBenefitComponent.disable();
    this.deathBenefitComponent.disable();
    this.funeralComponent.disable();
    this.criticalIllnessComponent.disable();
    this.disabilityIncomeComponent.disable();
    this.disabilityLumpsumComponent.disable();
    this.ttdBenefitComponent.disable();
    this.spouseDeathComponent.disable();
  }

  updateOption(benefitOptions: PolicyBenefitOption[], optionItemField: OptionItemFieldEnum, optionItemValueId: number, overrideValue: number = null) {
    var benefitOption = benefitOptions.find(x => x.optionItemField == optionItemField);
    if (benefitOption) {
      if (optionItemValueId > 0) {
        benefitOption.benefitOptionItemValueId = optionItemValueId;
      }
      else {
        benefitOption.overrideValue = overrideValue;
      }
    }
  }
  setUpdatedBenefitOptions(benefitGroup: BenefitGroupEnum, benefitOptions: PolicyBenefitOption[]) {

    var formData = this.standardBenefitComponent.form.getRawValue();
    this.updateOption(benefitOptions, OptionItemFieldEnum.BenefitCalculationMethod, formData.benefitCalcId);
    this.updateOption(benefitOptions, OptionItemFieldEnum.BenefitPayee, formData.benefitPayeeId);
    this.updateOption(benefitOptions, OptionItemFieldEnum.BillingLevel, formData.billingLevel);
    this.updateOption(benefitOptions, OptionItemFieldEnum.BranchBilling, formData.branchBilling);

    

    switch (benefitGroup) {
      case BenefitGroupEnum.CriticalIllness:
        formData = this.criticalIllnessComponent.form.getRawValue();

        this.updateOption(benefitOptions, OptionItemFieldEnum.FreeCoverLimit, 0, formData.freeCoverLimit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.PreviousInsurerFCL, 0, formData.previousInsurerFCL);
        this.updateOption(benefitOptions, OptionItemFieldEnum.MaxSumAssured, 0, formData.maximumSumAssured);
        this.updateOption(benefitOptions, OptionItemFieldEnum.MaxBenefitMultiple, 0, formData.maximumBenefitMultiple);
        this.updateOption(benefitOptions, OptionItemFieldEnum.BenefitBasis, formData.benefitBasis);
        this.updateOption(benefitOptions, OptionItemFieldEnum.ConversionOption, formData.conversionOption);
        this.updateOption(benefitOptions, OptionItemFieldEnum.TopUpBenefit, formData.topUpBenefit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.SurvivorBenefit, formData.survivalPeriod);
        this.updateOption(benefitOptions, OptionItemFieldEnum.RestoreDeathBenefit, formData.restoreDeathBenfit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.ContinuedCover, formData.continuedCover);
        break;
      case BenefitGroupEnum.Death:
        formData = this.deathBenefitComponent.form.getRawValue();

        this.updateOption(benefitOptions, OptionItemFieldEnum.FreeCoverLimit, 0, formData.freeCoverLimit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.PreviousInsurerFCL, 0, formData.previousInsurerFCL);
        this.updateOption(benefitOptions, OptionItemFieldEnum.MaxSumAssured, 0, formData.maximumSumAssured);
        this.updateOption(benefitOptions, OptionItemFieldEnum.MaxBenefitMultiple, 0, formData.maximumBenefitMultiple);
        this.updateOption(benefitOptions, OptionItemFieldEnum.ConversionOption, formData.conversionOption);
        this.updateOption(benefitOptions, OptionItemFieldEnum.TaxReplacementCover, formData.taxReplacement);
        this.updateOption(benefitOptions, OptionItemFieldEnum.ExtendedDeathBenefit, formData.extendedDeathBenefit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.BodyRepatriationBenefit, formData.bodyRepatriation);
        this.updateOption(benefitOptions, OptionItemFieldEnum.ShareOfFund, formData.shareOfFund);
        this.updateOption(benefitOptions, OptionItemFieldEnum.ContinuedCover, formData.continuedCover);
        break;
      case BenefitGroupEnum.DisabilityIncome:
        formData = this.disabilityIncomeComponent.form.getRawValue();

        this.updateOption(benefitOptions, OptionItemFieldEnum.MaxWaiverBenefit, 0, formData.maximumWaiverBenefit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.MaxMedicalPremiumWaiver, 0, formData.maxMedicalPremiumWaiverBenefit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.FreeCoverLimit, 0, formData.freeCoverLimit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.PreviousInsurerFCL, 0, formData.previousInsurerFCL);
        this.updateOption(benefitOptions, OptionItemFieldEnum.MaxSumAssured, 0, formData.maximumSumAssured);
        this.updateOption(benefitOptions, OptionItemFieldEnum.MaxRehabilitationBenefit, 0, formData.maximumRehabilitationBenefit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.PaybackBenefit, formData.paybackBenefit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.SurvivorBenefit, formData.survivorBenefit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.RehabilitationBenefit, formData.rehabilitationBenefit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.RecoveryBonus, formData.recoveryBonus);
        this.updateOption(benefitOptions, OptionItemFieldEnum.ContinuedCover, formData.continuedCover);
        break;
      case BenefitGroupEnum.Funeral:
        formData = this.funeralComponent.form.getRawValue();

        this.updateOption(benefitOptions, OptionItemFieldEnum.ExtendedDeathBenefit, formData.extendedDeathBenefit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.BodyRepatriationBenefit, formData.bodyRepatriation);
        this.updateOption(benefitOptions, OptionItemFieldEnum.PaidUpBenefit, formData.paidUpBenefit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.ContinuedCover, formData.continuedCover);
        break;
      case BenefitGroupEnum.LumpSumDisability:
        formData = this.disabilityLumpsumComponent.form.getRawValue();

        this.updateOption(benefitOptions, OptionItemFieldEnum.FreeCoverLimit, 0, formData.freeCoverLimit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.PreviousInsurerFCL, 0, formData.previousInsurerFCL);
        this.updateOption(benefitOptions, OptionItemFieldEnum.MaxSumAssured, 0, formData.maximumSumAssured);
        this.updateOption(benefitOptions, OptionItemFieldEnum.MaxBenefitMultiple, 0, formData.maximumBenefitMultiple);
        this.updateOption(benefitOptions, OptionItemFieldEnum.BenefitBasis, formData.benefitBasis);
        this.updateOption(benefitOptions, OptionItemFieldEnum.ConversionOption, formData.conversionOption);
        this.updateOption(benefitOptions, OptionItemFieldEnum.TaxReplacementCover, formData.taxReplacement);
        this.updateOption(benefitOptions, OptionItemFieldEnum.ShareOfFund, formData.shareOfFund);
        this.updateOption(benefitOptions, OptionItemFieldEnum.ContinuedCover, formData.continuedCover);
        break;
      case BenefitGroupEnum.SpouseDeath:
        formData = this.spouseDeathComponent.form.getRawValue();

        this.updateOption(benefitOptions, OptionItemFieldEnum.FreeCoverLimit, 0, formData.freeCoverLimit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.PreviousInsurerFCL, 0, formData.previousInsurerFCL);
        this.updateOption(benefitOptions, OptionItemFieldEnum.MaxSumAssured, 0, formData.maximumSumAssured);
        this.updateOption(benefitOptions, OptionItemFieldEnum.ConversionOption, formData.conversionOption);
        this.updateOption(benefitOptions, OptionItemFieldEnum.ExtendedDeathBenefit, formData.extendedDeathBenefit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.ContinuedCover, formData.continuedCover);
        break;
      case BenefitGroupEnum.TemporalTotalDisability:
        formData = this.ttdBenefitComponent.form.getRawValue();

        this.updateOption(benefitOptions, OptionItemFieldEnum.MaxWaiverBenefit, 0, formData.maximumWaiverBenefit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.MaxMedicalPremiumWaiver, 0, formData.maxMedicalPremiumWaiverBenefit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.FreeCoverLimit, 0, formData.freeCoverLimit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.PreviousInsurerFCL, 0, formData.previousInsurerFCL);
        this.updateOption(benefitOptions, OptionItemFieldEnum.MaxSumAssured, 0, formData.maximumSumAssured);
        this.updateOption(benefitOptions, OptionItemFieldEnum.PaybackBenefit, formData.paybackBenefit);
        this.updateOption(benefitOptions, OptionItemFieldEnum.ContinuedCover, formData.continuedCover);
        break;
      default:
    }
  }

  loadPolicyLevelOptionItems(productOptionId: number, benefitGroup: BenefitGroupEnum) {
    var retrievedOptions: ProductOptionItemValueLookup[];
    this.isLoading = true;
    this.groupRiskPolicyCaseService.getProductOptionOptionItemWithOverrideValues(productOptionId).subscribe({
      next: result => {
        this.setPolicyLevelOptionItemValues(result, benefitGroup);
      },
      complete: () => {
        this.isLoading = false;
      }
    })
  }

  setPolicyOptionsLoadingStatus(isLoading: boolean, benefitGroup: BenefitGroupEnum) {
    if (benefitGroup == BenefitGroupEnum.SpouseDeath) {
      this.spouseDeathComponent.setPolicyLevelOptionsLoading(true);
      return;
    }

    if (benefitGroup == BenefitGroupEnum.Death) {
      this.deathBenefitComponent.setPolicyLevelOptionsLoading(true);
      return;
    }

    if (benefitGroup == BenefitGroupEnum.LumpSumDisability) {
      this.disabilityLumpsumComponent.setPolicyLevelOptionsLoading(true);
      return;
    }

    if (benefitGroup == BenefitGroupEnum.CriticalIllness) {
      this.criticalIllnessComponent.setPolicyLevelOptionsLoading(true);
      return;
    }

    if (benefitGroup == BenefitGroupEnum.TemporalTotalDisability) {
      this.ttdBenefitComponent.setPolicyLevelOptionsLoading(true);
      return;
    }

    if (benefitGroup == BenefitGroupEnum.DisabilityIncome) {
      this.disabilityIncomeComponent.setPolicyLevelOptionsLoading(true);
      return;
    }

  }

  setPolicyLevelOptionItemValues(policyLevelOptionItemValues: ProductOptionItemValueLookup[], benefitGroup: BenefitGroupEnum) {
    if (benefitGroup == BenefitGroupEnum.SpouseDeath) {
      this.spouseDeathComponent.setPolicyLevelOptions(policyLevelOptionItemValues);
      return;
    }

    if (benefitGroup == BenefitGroupEnum.Death) {
      this.deathBenefitComponent.setPolicyLevelOptions(policyLevelOptionItemValues);
      return;
    }

    if (benefitGroup == BenefitGroupEnum.LumpSumDisability) {
      this.disabilityLumpsumComponent.setPolicyLevelOptions(policyLevelOptionItemValues);
      return;
    }

    if (benefitGroup == BenefitGroupEnum.CriticalIllness) {
      this.criticalIllnessComponent.setPolicyLevelOptions(policyLevelOptionItemValues);
      return;
    }

    if (benefitGroup == BenefitGroupEnum.TemporalTotalDisability) {
      this.ttdBenefitComponent.setPolicyLevelOptions(policyLevelOptionItemValues);
      return;
    }

    if (benefitGroup == BenefitGroupEnum.DisabilityIncome) {
      this.disabilityIncomeComponent.setPolicyLevelOptions(policyLevelOptionItemValues);
      return;
    }
  }
}



