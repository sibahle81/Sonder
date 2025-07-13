import { Component, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";


import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { GroupRiskPolicyCaseModel } from '../../shared/entities/group-risk-policy-case-model';
import { GroupRiskPolicyCaseService } from '../../shared/Services/group-risk-policy-case.service';
import { GroupRiskCreateBenefitCategoryStandardComponent } from '../group-risk-create-benefit-category-views/standard-benefit/standard-benefit.component';
import { GroupRiskPolicyBenefit } from '../../shared/entities/group-risk-policy-benefit';
import { GroupRiskPolicyBenefitCategory } from '../../shared/entities/group-risk-policy-benefit-category';
import { GroupRiskCreateBenefitCategoryCIComponent } from '../group-risk-create-benefit-category-views/critical-illness/critical-illness.component';
import { GroupRiskCreateBenefitCategoryDeathComponent } from '../group-risk-create-benefit-category-views/death-benefit/death-benefit.component';
import { GroupRiskCreateBenefitCategoryDisabilityComponent } from '../group-risk-create-benefit-category-views/disability-benefit/disability-benefit.component';
import { GroupRiskCreateBenefitCategoryDLSComponent } from '../group-risk-create-benefit-category-views/disability-lumpsum/disability-lumpsum.component';
import { GroupRiskCreateBenefitCategoryTTDComponent } from '../group-risk-create-benefit-category-views/total-temporal-disability-benefit/total-temporal-disability-benefit.component';
import { GroupRiskCreateBenefitCategoryFuneralComponent } from '../group-risk-create-benefit-category-views/funeral-benefit/funeral-benefit.component';
import { GroupRiskCreateBenefitCategorySpouseDeathComponent } from '../group-risk-create-benefit-category-views/spouse-death-benefit/spouse-death-benefit.component';
import { AlertService } from "projects/shared-services-lib/src/lib/services/alert/alert.service";
import { ConfirmationDialogsService } from '../../../../../../shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { ProductOptionService } from '../../../product-manager/services/product-option.service';
import { ProductOptionCodeEnum } from '../../shared/enums/policy-option-code-enum';
import { ProductOption } from '../../../product-manager/models/product-option';
import { MatDialog } from '@angular/material/dialog';
import { DefaultConfirmationDialogComponent } from '../../../../../../shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { OptionItemValueLookup } from '../../shared/entities/option-item-value-lookup';
import { PolicyBenefitCategoryOption } from '../../shared/entities/policy-benefit-category-option';
import { BenefitGroupEnum } from '../../../product-manager/models/benefit-group.enum';
import { OptionItemFieldEnum } from '../../shared/enums/option-item-field.enum';
import { DatePipe } from '@angular/common';
import { ProductOptionItemValueLookup } from '../../shared/entities/product-option-item-value-lookup';
import { PolicyBenefitOption } from '../../shared/entities/policy-benefit-option';
import { FuneralCustomScaleComponent } from '../group-risk-create-benefit-category-views/funeral-benefit/funeral-custom-scale/funeral-custom-scale.component';
import { FuneralCoverTypeEnum } from '../../shared/enums/funeral-cover-type.enum';
import { BenefitCategoryFuneral } from '../../shared/entities/benefit-category-funeral';


@Component({
  selector: 'app-group-risk-create-benefit-categories',
  templateUrl: './group-risk-create-benefit-categories.component.html',
  styleUrls: ['./group-risk-create-benefit-categories.component.css']
})
export class GroupRiskCreateBenefitCategoriesComponent extends WizardDetailBaseComponent<GroupRiskPolicyCaseModel> {
  canSave: boolean = false;
  isEditingCategory: boolean = false;
  isFuneralBenefit: boolean = false;
  isDeathBenefit: boolean = false;
  isCriticalIllness: boolean = false;
  isSpouseDeath: boolean = false;
  isDisabilityIncome: boolean = false;
  isTemporalTotalDisability: boolean = false;
  isLumpSumDisability: boolean = false;
  isFuneralCustomScale: boolean = false;
  selectedPolicyId: number = 0;
  selectedBenefitId: number = 0;
  isLoading: boolean = false;
  selectedEditIndex: number = -1;
  benefitOptionItemValuesLookup: OptionItemValueLookup[];
  categoryDetailDates: Date[];

  displayedColumns = [
    "benefitId",
    "policyId",
    "categoryDescription",
    "startDate",
    "endDate",
    "actions",
  ];
  public createdCategories = new MatTableDataSource<GroupRiskPolicyBenefitCategory>();

  @ViewChild(GroupRiskCreateBenefitCategoryStandardComponent, { static: false }) standardBenefitComponent: GroupRiskCreateBenefitCategoryStandardComponent;
  @ViewChild(GroupRiskCreateBenefitCategoryCIComponent, { static: false }) criticalIllnessComponent: GroupRiskCreateBenefitCategoryCIComponent;
  @ViewChild(GroupRiskCreateBenefitCategoryDeathComponent, { static: false }) deathBenefitComponent: GroupRiskCreateBenefitCategoryDeathComponent;
  @ViewChild(GroupRiskCreateBenefitCategoryDisabilityComponent, { static: false }) disabilityIncomeComponent: GroupRiskCreateBenefitCategoryDisabilityComponent;
  @ViewChild(GroupRiskCreateBenefitCategoryDLSComponent, { static: false }) lumpsumDisablityComponent: GroupRiskCreateBenefitCategoryDLSComponent;
  @ViewChild(GroupRiskCreateBenefitCategoryTTDComponent, { static: false }) temporalTotalDisabilityComponent: GroupRiskCreateBenefitCategoryTTDComponent;
  @ViewChild(GroupRiskCreateBenefitCategoryFuneralComponent, { static: false }) funeralBenefitComponent: GroupRiskCreateBenefitCategoryFuneralComponent;
  @ViewChild(GroupRiskCreateBenefitCategorySpouseDeathComponent, { static: false }) spouseDeathComponent: GroupRiskCreateBenefitCategorySpouseDeathComponent;
  @ViewChild(FuneralCustomScaleComponent, { static: false }) funeralCustomScaleComponent: FuneralCustomScaleComponent;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly groupRiskPolicyCaseService: GroupRiskPolicyCaseService,
    private readonly alertService: AlertService,
    private readonly confirmService: ConfirmationDialogsService,
    private readonly productOptionService: ProductOptionService,
    private readonly dialog: MatDialog,
    private readonly datePipe: DatePipe
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups() {
  }

  createForm() {
    this.form = this.formBuilder.group({
      selectedDetailDate: [""]
    });
  }

  populateForm() {
    this.standardBenefitComponent.setViewData(this.model, true);
    this.standardBenefitComponent.enable();

    if (this.isEditWorkflow)
      this.standardBenefitComponent.form.controls.newEffectiveDate.enable();
    else
      this.standardBenefitComponent.form.controls.newEffectiveDate.disable();

    if (this.isDisabled) {
      this.standardBenefitComponent.disable();
      this.criticalIllnessComponent.disable();
      this.deathBenefitComponent.disable();
      this.disabilityIncomeComponent.disable();
      this.lumpsumDisablityComponent.disable();
      this.temporalTotalDisabilityComponent.disable();
      this.funeralBenefitComponent.disable();
      this.spouseDeathComponent.disable();
      this.funeralCustomScaleComponent.disable();
      this.loadAllCreatedCategoriesOnCase();
      return;
    }

    this.loadAllCreatedCategoriesOnCase();
  }
  populateModel() {

    this.setKeyBenfitFieldsEnabled();
    if (this.isEditWorkflow) {
      this.updateCategoriestoModel();
      return;
    }

    if (this.isDisabled)
      return;

    this.saveCreatedCategories(this.selectedPolicyId, this.selectedBenefitId);
  }

  updateCategoriestoModel() {
    for (let i = 0; i < this.createdCategories.data.length; i++) {
      for (let p = 0; p < this.model.groupRiskPolicies.length; p++) {
        if (this.createdCategories.data[i].policyId == this.model.groupRiskPolicies[p].policyId) {
          for (let b = 0; b < this.model.groupRiskPolicies[p].groupRiskPolicyBenefits.length; b++) {
            if (this.model.groupRiskPolicies[p].groupRiskPolicyBenefits[b].benefitId == this.createdCategories.data[i].benefitId) {
              for (let c = 0; c < this.model.groupRiskPolicies[p].groupRiskPolicyBenefits[b].benefitCategories.length; c++) {
                if (this.model.groupRiskPolicies[p].groupRiskPolicyBenefits[b].benefitCategories[c].benefitCategoryId == this.createdCategories.data[i].benefitCategoryId &&
                  this.createdCategories.data[i].benefitCategoryId > 0) {
                  this.model.groupRiskPolicies[p].groupRiskPolicyBenefits[b].benefitCategories[c] = this.createdCategories.data[i];
                  this.model.groupRiskPolicies[p].groupRiskPolicyBenefits[b].benefitCategories[c].categoryDetailsEffectiveDates = this.createdCategories.data[i].categoryDetailsEffectiveDates;
                }
              }
            }
          }
        }
      }
    }

    if (this.isEditWorkflow) {
      var newCategories = this.createdCategories.data.filter(x => x.benefitCategoryId == 0);
      for (var newCategory of newCategories) {
        var policy = this.model.groupRiskPolicies.find(p => p.policyId == newCategory.policyId);
        if (policy)
          var benefit = policy.groupRiskPolicyBenefits.find(b => b.benefitId == newCategory.benefitId);
        if (benefit) {
          var existingCatories = benefit.benefitCategories.filter(x => x.benefitCategoryId > 0);
          benefit.benefitCategories = existingCatories;
          benefit.benefitCategories.push(newCategory);
        }
      }

    }
  }



  showCategory(item: GroupRiskPolicyBenefitCategory, index: number) {
    if (this.selectedBenefitId !== item.benefitId) {
      this.isLoading = true;
      this.groupRiskPolicyCaseService.getBenefitOptionItemValues(item.benefitId, "BenefitCategory").subscribe({
        next: result => {
          if (result) {
            this.benefitOptionItemValuesLookup = result;
            this.setupVisibleComponents(item.policyId, item.benefitId);
            this.EditCategory(item, index);
            this.updateLookups(item.benefitId);
          }
        },
        error: err => {
          this.popAlert("Errors getting option values.", "error");
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
    else {
      this.setupVisibleComponents(item.policyId, item.benefitId);
      this.EditCategory(item, index);
      this.updateLookups(item.benefitId);
    }

    this.standardBenefitComponent.loadPolicyBenefits(item.policyId);
    this.selectedBenefitId = item.benefitId;
    this.selectedPolicyId = item.policyId;

    if (item.categoryDetailsEffectiveDates.length >= 1) {
      if (item.categoryDetailsEffectiveDates.length > 1)
        this.categoryDetailDates = item.categoryDetailsEffectiveDates.sort((startDate: Date, endDate: Date) => { return new Date(endDate).getTime() - new Date(startDate).getTime(); });
      else
        this.categoryDetailDates = item.categoryDetailsEffectiveDates;

      this.form.patchValue({ selectedDetailDate: item.categoryDetailsEffectiveDates[0] });
    }

    this.getProductOptionLevelSettings(item.policyId, item.benefitId);
  }


  onEdit(item: GroupRiskPolicyBenefitCategory, index: number) {
    if (this.isDisabled || this.isEditWorkflow) {  
      this.showCategory(item, index);
      if (this.isEditWorkflow) this.isEditingCategory = true;
      this.form.controls.selectedDetailDate.enable();
      return;
    }

    if (this.isEditingCategory && this.selectedEditIndex == index)
      return;

    if (this.isEditingCategory && this.selectedEditIndex !== index) {
      var dialoqRef = this.dialog.open(DefaultConfirmationDialogComponent, {
        width: '40%',
        disableClose: true,
        data: {
          "title": "Edit Category",
          "text": "All unsaved changed will be lost.Do you want to proceed?"
        }
      });

      dialoqRef.afterClosed().subscribe(result => {
        if (result) {
          this.EditCategory(item, index);
        }
      });
    }
    else {
      this.showCategory(item, index);
    }
  }

  loadDetailsForDate(benefitCategoryId: number, effectiveDate: Date) {
    this.loadingStart("Loading details for benefit...")
    this.groupRiskPolicyCaseService.getGroupRiskPolicyBenefitCategory(benefitCategoryId, effectiveDate).subscribe({
      next: (result) => {
        if (result) {
          this.showCategory(result, this.selectedEditIndex);
          this.form.patchValue({ "selectedDetailDate": effectiveDate });
        }
      },
      complete: () => {
        this.loadingStop();
      }
    });
  }

  onDetailsDateChanged(effectiveDate: Date) {
    if (this.selectedEditIndex >= 0) {
      var benefitCategoryId = this.createdCategories.data[this.selectedEditIndex].benefitCategoryId;
      this.loadDetailsForDate(benefitCategoryId, effectiveDate);
    }
  }

  onStartDateChanged(startDate: Date) {
    if (!this.isEditWorkflow)
      this.standardBenefitComponent.form.patchValue({"newEffectiveDate": startDate})
  }

  EditCategory(item: GroupRiskPolicyBenefitCategory, index: number){
      this.isEditingCategory = true;
      this.selectedEditIndex = index;
      this.resetForms(0, 0);
      this.loadFormFromCategory(item);
  }  

  onRemove(item: GroupRiskPolicyBenefitCategory, index: number) {
    this.confirmService
      .confirmWithoutContainer(
        "Remove Benefit Category",
        "Are you sure you want to remove this category?",
        "Center",
        "Center",
        "Yes",
        "No",
      )
      .subscribe((result) => {
        if (result === true) {
          this.createdCategories.data.splice(index, 1);
          this.createdCategories.paginator = this.paginator;
          this.createdCategories.sort = this.sort;
        }
      });
  }

  onSaveBenefitCategory() {
    if (!this.formsValid()) {
      this.popAlert("Errors saving the category.", "error");
      return;
    }
    if (this.benefitOptionItemValuesLookup) {
      this.saveBenefitCategory();
    }
    else {
      this.isLoading = true;
      this.groupRiskPolicyCaseService.getBenefitOptionItemValues(this.selectedBenefitId, "BenefitCategory").subscribe({
        next: result => {
          if (result) {
            this.benefitOptionItemValuesLookup = result;
            this.saveBenefitCategory();
          }
        },
        error: err => {
          this.popAlert("Errors getting option values.", "error");
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
  saveBenefitCategory() {
    var benefitCategory = this.getCategoryFromForms();

    if (this.isEditingCategory) {
      this.createdCategories.data[this.selectedEditIndex] = benefitCategory;
    }
    else {
      this.createdCategories.data.push(benefitCategory);
    }

    this.createdCategories.paginator = this.paginator;
    this.createdCategories.sort = this.sort;
    this.resetForms(this.selectedPolicyId, this.selectedBenefitId);

    this.isEditingCategory = false;
    this.selectedEditIndex = -1;
    this.popAlert("Benefit category saved.", "success");
  }
  onBenefitChanged(code: string) {
    var benefitToReset = this.selectedBenefitId;
    if (this.isEditingCategory) {
      this.selectedBenefitId = this.standardBenefitComponent.form.controls.benefitId.value; 
      this.standardBenefitComponent.form.patchValue({ "benefitId": benefitToReset });
      var dialoqRef = this.dialog.open(DefaultConfirmationDialogComponent, {
        width: '40%',
        disableClose: true,
        data: {
          "title": "Edit Category",
          "text": "All unsaved changed will be lost.Do you want to proceed?"
        }
      });

      dialoqRef.afterClosed().subscribe(result => {
        if (result) {
          this.isEditingCategory = false;
          this.changeBenefit(this.selectedBenefitId);
          this.setupVisibleComponents(this.selectedPolicyId, this.selectedBenefitId);
          this.updateLookups(this.selectedBenefitId);
        }
      });
    }
    else {
      this.changeBenefit();
      this.setupVisibleComponents(this.selectedPolicyId, this.selectedBenefitId);
      this.updateLookups(this.selectedBenefitId);
    }

    this.getProductOptionLevelSettings(this.selectedPolicyId, this.selectedBenefitId);
  }
    

  changeBenefit(newBenefitId: number = 0) {
    this.saveCreatedCategories(this.selectedPolicyId, this.selectedBenefitId);
    this.selectedBenefitId = (newBenefitId > 0) ? newBenefitId : this.standardBenefitComponent.form.controls.benefitId.value;
    this.resetForms(this.selectedPolicyId, this.selectedBenefitId);
    this.isLoading = true;
    this.groupRiskPolicyCaseService.getBenefitOptionItemValues(this.selectedBenefitId, "BenefitCategory").subscribe({
      next: result => {
        if (result) {
          this.benefitOptionItemValuesLookup = result;
        }
      },
      error: err => {
        this.popAlert("Errors getting option values.", "error");
      },
      complete: () => {
        this.isLoading = false;
      }
    });
    
  }

  onPolicyChanged(policyId: number) {
    this.selectedPolicyId = policyId;
    this.resetForms(0, 0);
    this.hideAllComponents();
    this.standardBenefitComponent.form.patchValue({ "policyId": this.selectedPolicyId });
  }

  getBenefitName(policyId: number, benefitId: number): string {
    var benefit = this.findBenefit(policyId, benefitId);
    if (!benefit)
      return "";
    return benefit.benefitName;
  }

  getCustomerReference(policyId: number): string {
    var policy = this.model.groupRiskPolicies.find(x => x.policyId === policyId);
    if (policy)
      return policy.policyNumber;
  }

  saveCreatedCategories(policyId: number, benefitId: number) {
    var policyIndex = this.model.groupRiskPolicies.findIndex(x => x.policyId === policyId);
    if (policyIndex >= 0) {
      var benefitIndex = this.model.groupRiskPolicies[policyIndex].groupRiskPolicyBenefits.findIndex(x => x.benefitId === benefitId);
      if (benefitIndex >= 0) {
        this.model.groupRiskPolicies[policyIndex].groupRiskPolicyBenefits[benefitIndex].benefitCategories = this.createdCategories.data.filter(x => x.benefitId == benefitId);
      }

    }
  }

  loadCreatedCategories(policyId: number, benefitId: number) {
    var policy = this.model.groupRiskPolicies.find(x => x.policyId === policyId);
    if (policy) {
      var benefit = policy.groupRiskPolicyBenefits.find(x => x.benefitId === benefitId);
      if (benefit) {
        this.bindToTable(benefit.benefitCategories);
      } 
    }
      
  }

  loadAllCreatedCategoriesOnCase() {
    var allCategories: GroupRiskPolicyBenefitCategory[] = [];
    for (var i = 0; i < this.model.groupRiskPolicies.length; i++) {
      for(var j = 0; j < this.model.groupRiskPolicies[i].groupRiskPolicyBenefits.length; j++) {
        allCategories.push(...this.model.groupRiskPolicies[i].groupRiskPolicyBenefits[j].benefitCategories);
      }
    }

    this.bindToTable(allCategories);
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    validationResult.errors = 0;
    validationResult.errorMessages = [];

    for (let policy of this.model.groupRiskPolicies) {
      for (let benefit of policy.groupRiskPolicyBenefits) {
        if (!benefit.benefitCategories || benefit.benefitCategories.length == 0) {
          validationResult.errorMessages.push(benefit.benefitName + ": No Categories created");
          validationResult.errors = validationResult.errors + 1;
        }

        if (benefit.benefitCategories) {
            for (let category of benefit.benefitCategories) {
              if (!this.isFirstDayOfMonth(category.startDate)) {
                validationResult.errorMessages.push(category.categoryDescription + ": Start Date should be the first of the month");
                validationResult.errors = validationResult.errors + 1;
              }

              if (!this.isFirstDayOfMonth(category.newEffectiveDate)) {
                validationResult.errorMessages.push(category.categoryDescription + ": Effective Date should be the first of the month");
                validationResult.errors = validationResult.errors + 1;
              }

              if (category.newEffectiveDate < category.startDate) {
                validationResult.errorMessages.push(category.categoryDescription + ": Effective Date should be on or after the Start Date");
                validationResult.errors = validationResult.errors + 1;
              }
            }
        }
      }
    }

    return validationResult;
  }

  getSelectedBenefit(policyId: number, benefitId: number): GroupRiskPolicyBenefit {
    var policy = this.model.groupRiskPolicies.find(x => x.policyId === policyId);
    var benefit: GroupRiskPolicyBenefit;
    if (policy) {
      benefit = policy.groupRiskPolicyBenefits.find(x => x.benefitId === benefitId);
    }

    return benefit;
  }

  updateModel(benefitCategory: GroupRiskPolicyBenefitCategory) {
    var policyId = benefitCategory.policyId;
    var benefitId = benefitCategory.benefitId;

    var policy = this.model.groupRiskPolicies.find(x => x.policyId === policyId);
    if (policy) {
      var benefit = policy.groupRiskPolicyBenefits.find(x => x.benefitId === benefitId);
      if (benefit) {
        if (!benefit.benefitCategories)
          benefit.benefitCategories = [];

        benefit.benefitCategories.push(benefitCategory);
      }
        
    }
  }

  showHideComponents(benefitGroup: BenefitGroupEnum) {
    switch (benefitGroup) {
      case BenefitGroupEnum.Death:
        this.isDeathBenefit = true;
        break;
      case BenefitGroupEnum.LumpSumDisability:
        this.isLumpSumDisability = true;
        break;
      case BenefitGroupEnum.CriticalIllness:
        this.isCriticalIllness = true;
        break;
      case BenefitGroupEnum.DisabilityIncome:
        this.isDisabilityIncome = true;
        break;
      case BenefitGroupEnum.TemporalTotalDisability:
        this.isTemporalTotalDisability = true;
        break;
      case BenefitGroupEnum.Funeral:
        this.isFuneralBenefit = true;
        break;
      case BenefitGroupEnum.SpouseDeath:
        this.isSpouseDeath = true;
        break;
      default:
    }
  }

  setupVisibleComponents(policyId:number, benefitId: number) {
    var benefit = this.findBenefit(policyId, benefitId);

    this.hideAllComponents();
    this.showHideComponents(benefit.benefitGroup);
  }

  findBenefit(policyId: number, benefitId: number): GroupRiskPolicyBenefit {
    var policy = this.model.groupRiskPolicies.find(x => x.policyId === policyId);
    if (policy) {
      var benefit = policy.groupRiskPolicyBenefits.find(x => x.benefitId === benefitId);
      if (benefit)
        return benefit;
    }

    return null;
  }

  getCategoryFromForms(): GroupRiskPolicyBenefitCategory {
    if (!this.benefitOptionItemValuesLookup)
      return null;

    var benefitCategory = new GroupRiskPolicyBenefitCategory();
    var formControls = (this.standardBenefitComponent.form.getRawValue());

    benefitCategory.benefitId = formControls.benefitId;
    benefitCategory.startDate = new Date(this.datePipe.transform(formControls.startDate, 'yyyy-MM-dd')).getCorrectUCTDate();
    benefitCategory.newEffectiveDate = new Date(this.datePipe.transform(formControls.newEffectiveDate, 'yyyy-MM-dd')).getCorrectUCTDate();
    benefitCategory.endDate = (!formControls.endDate) ? null : new Date(this.datePipe.transform(formControls.endDate, 'yyyy-MM-dd')).getCorrectUCTDate();
    benefitCategory.categoryDescription = formControls.categoryDescription;
    benefitCategory.flatCoverAmount = formControls.flatCoverAmount;
    benefitCategory.policyId = formControls.policyId;
    benefitCategory.name = formControls.categoryDescription.length < 50 ? formControls.categoryDescription : formControls.categoryDescription.substring(0, 49);
    benefitCategory.benefitCategoryId = this.selectedEditIndex >= 0 ? this.createdCategories.data[this.selectedEditIndex].benefitCategoryId : 0;
    
    if (!this.isEditWorkflow || benefitCategory.benefitCategoryId == 0) {
    benefitCategory.categoryOptions.push(this.createOptionItemValue(0, "NRA", formControls.normalRetirementAge));
      benefitCategory.categoryOptions.push(this.createOptionItemValue(0, "MinEntryAge", formControls.minimumEntryAge));
      benefitCategory.categoryOptions.push(this.createOptionItemValue(0, "MaxEntryAge", formControls.maxEntryAge));
      benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.benefitPaymentOption));
      benefitCategory.categoryDetailsEffectiveDates = [];
      benefitCategory.categoryDetailsEffectiveDates.push(benefitCategory.newEffectiveDate);

      if (this.isDeathBenefit) {
        formControls = this.deathBenefitComponent.form.getRawValue();

        benefitCategory.categoryOptions.push(this.createOptionItemValue(0, "MaxCoverAge", formControls.maxCoverAge));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.benefitSalaryTypeOptionItemId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.premiumSalaryTypeOptionItemId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.lessApprovedBenefitOptionId));
        benefitCategory.salaryMultiple = formControls.salaryMultiple;
      }

      if (this.isFuneralBenefit) {
        formControls = this.funeralBenefitComponent.form.getRawValue();

        benefitCategory.funeralCoverTypeId = formControls.coverTypeOptionId;
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.eligibilityWaitingPeriodOptionId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(0, "SpouseMaxCoverAge", formControls.spouseMaxCoverAge));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(0, "MaxSpouseCovered", formControls.maxSpouseCovered));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(0, "ChildMaxCoverAge", formControls.childMaxCoverAge));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(0, "ParentEntryAge", formControls.parentEntryAge));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(0, "ParentMaxCoverAge", formControls.parentMaxCoverAge));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(0, "ExtendedFamilyEntryAge", formControls.extendedFamilyEntryAge));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(0, "ExtendedMaxCoverAge", formControls.extendedFamilyMaxCoverAge));

        benefitCategory.categoryOptions.push(this.createOptionItemValue(0, "MaxCoverAge", formControls.maxCoverAge));
        if (benefitCategory.funeralCoverTypeId == FuneralCoverTypeEnum.CustomScale) {
          benefitCategory.funeralScales = this.getCustomScales();
        }
      }

      if (this.isCriticalIllness) {
        formControls = this.criticalIllnessComponent.form.getRawValue();

        benefitCategory.salaryMultiple = formControls.salaryMultiple;
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.benefitPackageId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.benefitSalaryTypeOptionItemId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.premiumSalaryTypeOptionItemId));
      }

      if (this.isDisabilityIncome) {
        formControls = this.disabilityIncomeComponent.form.getRawValue();

        benefitCategory.employerWaiver = formControls.employerWaiver;
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.claimWaitingPeriodOptionId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.employeeBenefitsOptionId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.benefitSalaryTypeOptionItemId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.premiumSalaryTypeOptionItemId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.benefitDefinitionOptionItemId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.initialBenefitPeriodOptionItemId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.benefitEscalationRateOptionItemId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.medicalPremiumWaiverOptionItemId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.medicalWaiverPaymentTermOptionId));
      }

      if (this.isLumpSumDisability) {
        formControls = this.lumpsumDisablityComponent.form.getRawValue();

        benefitCategory.salaryMultiple = formControls.salaryMultiple;
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.claimWaitingPeriodOptionId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.benefitSalaryTypeOptionItemId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.premiumSalaryTypeOptionItemId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.lessApprovedBenefitOptionId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.taperOptionId));
      }

      if (this.isTemporalTotalDisability) {
        formControls = this.temporalTotalDisabilityComponent.form.getRawValue();

        benefitCategory.employerWaiver = formControls.employerWaiver;
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.claimWaitingPeriodOptionId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.employeeBenefitsOptionId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.benefitSalaryTypeOptionItemId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.premiumSalaryTypeOptionItemId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.benefitDefinitionOptionItemId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.initialBenefitPeriodOptionItemId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.benefitEscalationRateOptionItemId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.medicalPremiumWaiverOptionItemId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.medicalWaiverPaymentTermOptionId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(0, "BenPayTerm", formControls.benefitPaymentTerm));
      }

      if (this.isSpouseDeath) {
        formControls = this.spouseDeathComponent.form.getRawValue();

        benefitCategory.salaryMultiple = formControls.salaryMultiple;
        benefitCategory.categoryOptions.push(this.createOptionItemValue(0, "MaxCoverAge", formControls.maxCoverAge));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.benefitSalaryTypeOptionItemId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.premiumSalaryTypeOptionItemId));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(0, "SpouseMaxCoverAge", formControls.spouseMaxCoverAge));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(0, "MaxSpouseCovered", formControls.maxSpouseCovered));
        benefitCategory.categoryOptions.push(this.createOptionItemValue(formControls.maritalStatusOptionId));
      }
    }

    if (this.isEditWorkflow) {
      if (this.selectedEditIndex >= 0) {
        benefitCategory.categoryOptions = this.createdCategories.data[this.selectedEditIndex].categoryOptions;
        benefitCategory.benefitCategoryId = this.createdCategories.data[this.selectedEditIndex].benefitCategoryId;
        benefitCategory.categoryDetailsEffectiveDates = this.createdCategories.data[this.selectedEditIndex].categoryDetailsEffectiveDates;
      }

      var benefit = this.getSelectedBenefit(benefitCategory.policyId, benefitCategory.benefitId);
      this.setUpdatedCategoryOptions(benefit.benefitGroup, benefitCategory)
    }

    return benefitCategory;
  }

  getCustomScales(): BenefitCategoryFuneral[] {
    var result: BenefitCategoryFuneral[] = [];
    for (let customScale of this.funeralCustomScaleComponent.getCreatedFuneralScales()) {
      result.push({
        benefitCategoryId: customScale.benefitCategoryId,
        effectiveDate: new Date(this.datePipe.transform(customScale.effectiveDate, 'yyyy-MM-dd')).getCorrectUCTDate(),
        funeralInsuredTypeId: customScale.funeralInsuredTypeId,
        coverAmount: customScale.coverAmount
      });
    }

    return result;
  }

  updateOption(categoryOptions: PolicyBenefitCategoryOption[], optionItemField: OptionItemFieldEnum, optionItemValueId: number, overrideValue: number = null) {
    var categoryOption = categoryOptions.find(x => x.optionItemField == optionItemField);
    if (categoryOption) {
      if (optionItemValueId > 0) {
        categoryOption.benefitOptionItemValueId = optionItemValueId;
      }
      else {
        categoryOption.overrideValue = overrideValue;
      }
    }
  }

  getOptionItemValueId(optionTypeCode: string): number {
    var optionItemValue = this.benefitOptionItemValuesLookup.find(x => x.optionTypeCode === optionTypeCode);
    if (optionItemValue)
      return optionItemValue.benefitOptionItemValueId;

    return 0;
  }

  getOptionItemFieldValue(fieldId: OptionItemFieldEnum, categoryOptions: PolicyBenefitCategoryOption[]): PolicyBenefitCategoryOption {
    for (var i = 0; i < this.benefitOptionItemValuesLookup.length; i++) {
      if (this.benefitOptionItemValuesLookup[i].optionItemField == fieldId)
        var categoryOption = categoryOptions.find(x => x.benefitOptionItemValueId == this.benefitOptionItemValuesLookup[i].benefitOptionItemValueId);
      if (categoryOption)
        return categoryOption;
    }

    return new PolicyBenefitCategoryOption(0);
  }
  createOptionItemValue(benefitOptionItemValueId: number, optionTypeCode: string = null, overrideValue: number = null): PolicyBenefitCategoryOption {
     if (benefitOptionItemValueId > 0)
       return new PolicyBenefitCategoryOption(benefitOptionItemValueId);

     if (!optionTypeCode)
       return null;

    return new PolicyBenefitCategoryOption(this.getOptionItemValueId(optionTypeCode) , overrideValue);
  }

  loadFormFromCategory(benefitCategory: GroupRiskPolicyBenefitCategory) {
    this.standardBenefitComponent.form.patchValue({
      "policyId": benefitCategory.policyId,
      "benefitId": benefitCategory.benefitId,
      "startDate": benefitCategory.startDate,
      "endDate": benefitCategory.endDate,
      "benefitPaymentOption": this.getOptionItemFieldValue(OptionItemFieldEnum.BenefitPaymentOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
      "categoryDescription": benefitCategory.categoryDescription,
      "minimumEntryAge": this.getOptionItemFieldValue(OptionItemFieldEnum.MinimumEntryAge, benefitCategory.categoryOptions).overrideValue,
      "maxEntryAge": this.getOptionItemFieldValue(OptionItemFieldEnum.MaximumEntryAge, benefitCategory.categoryOptions).overrideValue, 
      "flatCoverAmount": benefitCategory.flatCoverAmount,
      "normalRetirementAge": this.getOptionItemFieldValue(OptionItemFieldEnum.NormalRetirementAge, benefitCategory.categoryOptions).overrideValue, 
      "newEffectiveDate": benefitCategory.newEffectiveDate
    });

    if (this.isDeathBenefit) {
      this.deathBenefitComponent.form.patchValue({
        "maxCoverAge": this.getOptionItemFieldValue(OptionItemFieldEnum.MaximumCoverAge, benefitCategory.categoryOptions).overrideValue,
        "benefitSalaryTypeOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.BenefitSalaryTypeOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "premiumSalaryTypeOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.PremiumSalaryTypeOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "lessApprovedBenefitOptionId": this.getOptionItemFieldValue(OptionItemFieldEnum.LessApprovedBenefitOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "salaryMultiple": benefitCategory.salaryMultiple
      });
    }

    if (this.isFuneralBenefit) {
      this.funeralBenefitComponent.form.patchValue({
        "eligibilityWaitingPeriodOptionId": this.getOptionItemFieldValue(OptionItemFieldEnum.EligibilityWaitingPeriod, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "spouseMaxCoverAge": this.getOptionItemFieldValue(OptionItemFieldEnum.SpouseMaximumCoverAge, benefitCategory.categoryOptions).overrideValue,
        "maxSpouseCovered": this.getOptionItemFieldValue(OptionItemFieldEnum.MaximumSpousesCovered, benefitCategory.categoryOptions).overrideValue,
        "childMaxCoverAge": this.getOptionItemFieldValue(OptionItemFieldEnum.ChildMaximumCoverAge, benefitCategory.categoryOptions).overrideValue,
        "parentEntryAge": this.getOptionItemFieldValue(OptionItemFieldEnum.ParentEntryAge, benefitCategory.categoryOptions).overrideValue,
        "parentMaxCoverAge": this.getOptionItemFieldValue(OptionItemFieldEnum.ParentMaximumCoverAge, benefitCategory.categoryOptions).overrideValue,
        "extendedFamilyEntryAge": this.getOptionItemFieldValue(OptionItemFieldEnum.ExtendedFamilyEntryAge, benefitCategory.categoryOptions).overrideValue,
        "extendedFamilyMaxCoverAge": this.getOptionItemFieldValue(OptionItemFieldEnum.ExtendedFamilyMaximumCoverAge, benefitCategory.categoryOptions).overrideValue,
        "coverTypeOptionId": benefitCategory.funeralCoverTypeId,
        "maxCoverAge": this.getOptionItemFieldValue(OptionItemFieldEnum.MaximumCoverAge, benefitCategory.categoryOptions).overrideValue
      });

      this.isFuneralCustomScale = this.isCustomFuneralSetupSelected(benefitCategory);
      if (this.isFuneralCustomScale)
        this.funeralCustomScaleComponent.setTableData(benefitCategory.funeralScales);
    }

    if (this.isCriticalIllness) {
      this.criticalIllnessComponent.form.patchValue({
        "benefitPackageId": this.getOptionItemFieldValue(OptionItemFieldEnum.BenefitPackageOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "benefitSalaryTypeOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.BenefitSalaryTypeOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "premiumSalaryTypeOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.PremiumSalaryTypeOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "salaryMultiple": benefitCategory.salaryMultiple
      });
    }

    if (this.isDisabilityIncome) {
      this.disabilityIncomeComponent.form.patchValue({
        "claimWaitingPeriodOptionId": this.getOptionItemFieldValue(OptionItemFieldEnum.ClaimWaitingPeriod, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "employeeBenefitsOptionId": this.getOptionItemFieldValue(OptionItemFieldEnum.EmployeeDisabilityBenefitOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "benefitSalaryTypeOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.BenefitSalaryTypeOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "premiumSalaryTypeOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.PremiumSalaryTypeOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "benefitDefinitionOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.BenefitDefitionOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "initialBenefitPeriodOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.InitialBenefitPeriodOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "benefitEscalationRateOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.BenefitEscalationRateOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "employerWaiver": benefitCategory.employerWaiver,
        "medicalPremiumWaiverOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.MedicalPremiumWaiverOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "medicalWaiverPaymentTermOptionId": this.getOptionItemFieldValue(OptionItemFieldEnum.MedicalWaiverPaymentTermOption, benefitCategory.categoryOptions).benefitOptionItemValueId
      });
    }

    if (this.isLumpSumDisability) {
      this.lumpsumDisablityComponent.form.patchValue({
        "claimWaitingPeriodOptionId": this.getOptionItemFieldValue(OptionItemFieldEnum.ClaimWaitingPeriod, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "benefitSalaryTypeOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.BenefitSalaryTypeOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "premiumSalaryTypeOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.PremiumSalaryTypeOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "lessApprovedBenefitOptionId": this.getOptionItemFieldValue(OptionItemFieldEnum.LessApprovedBenefitOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "salaryMultiple": benefitCategory.salaryMultiple,
        "taperOptionId": this.getOptionItemFieldValue(OptionItemFieldEnum.TaperOption, benefitCategory.categoryOptions).benefitOptionItemValueId
      });
    }

    if (this.isTemporalTotalDisability) {
      this.temporalTotalDisabilityComponent.form.patchValue({
        "claimWaitingPeriodOptionId": this.getOptionItemFieldValue(OptionItemFieldEnum.ClaimWaitingPeriod, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "employeeBenefitsOptionId": this.getOptionItemFieldValue(OptionItemFieldEnum.EmployeeDisabilityBenefitOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "benefitSalaryTypeOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.BenefitSalaryTypeOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "premiumSalaryTypeOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.PremiumSalaryTypeOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "benefitDefinitionOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.BenefitDefitionOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "initialBenefitPeriodOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.InitialBenefitPeriodOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "benefitEscalationRateOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.BenefitEscalationRateOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "employerWaiver": benefitCategory.employerWaiver,
        "medicalPremiumWaiverOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.MedicalPremiumWaiverOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "medicalWaiverPaymentTermOptionId": this.getOptionItemFieldValue(OptionItemFieldEnum.MedicalWaiverPaymentTermOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "benefitPaymentTerm": this.getOptionItemFieldValue(OptionItemFieldEnum.BenefitPaymentTerm, benefitCategory.categoryOptions).overrideValue
      });
    }

    if (this.isSpouseDeath) {
      this.spouseDeathComponent.form.patchValue({
        "maxCoverAge": this.getOptionItemFieldValue(OptionItemFieldEnum.MaximumCoverAge, benefitCategory.categoryOptions).overrideValue,
        "benefitSalaryTypeOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.BenefitSalaryTypeOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "premiumSalaryTypeOptionItemId": this.getOptionItemFieldValue(OptionItemFieldEnum.PremiumSalaryTypeOption, benefitCategory.categoryOptions).benefitOptionItemValueId,
        "salaryMultiple": benefitCategory.salaryMultiple,
        "spouseMaxCoverAge": this.getOptionItemFieldValue(OptionItemFieldEnum.SpouseMaximumCoverAge, benefitCategory.categoryOptions).overrideValue,
        "maxSpouseCovered": this.getOptionItemFieldValue(OptionItemFieldEnum.MaximumSpousesCovered, benefitCategory.categoryOptions).overrideValue,
        "maritalStatusOptionId": this.getOptionItemFieldValue(OptionItemFieldEnum.MaritalStatusOption, benefitCategory.categoryOptions).benefitOptionItemValueId
      });
    }

    this.setKeyBenfitFieldsEnabled();

    if (benefitCategory.categoryDetailsEffectiveDates.length >= 1) {
      if (benefitCategory.categoryDetailsEffectiveDates.length > 1)
        this.categoryDetailDates = benefitCategory.categoryDetailsEffectiveDates.sort((startDate: Date, endDate: Date) => { return new Date(endDate).getTime() - new Date(startDate).getTime(); });
      else
        this.categoryDetailDates = benefitCategory.categoryDetailsEffectiveDates;

      this.form.patchValue({ selectedDetailDate: benefitCategory.categoryDetailsEffectiveDates[0] });
    }

  }

  setKeyBenfitFieldsEnabled() {
    if (this.selectedEditIndex >= 0) {
      if ((this.isEditWorkflow && this.createdCategories.data[this.selectedEditIndex].benefitCategoryId > 0) || this.isDisabled) {
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

  popAlert(message: string, type: string) {
    if (type == 'error')
      this.alertService.error(message, "Add Benefit Category", false);
    if (type == 'success')
      this.alertService.success(message, "Add Benefit Category", false);

  }

  resetForms(policyId: number, benefitId: number) {
    this.standardBenefitComponent.form.reset();
    if (this.isDeathBenefit && this.deathBenefitComponent)
      this.deathBenefitComponent.form.reset();

    if (this.isFuneralBenefit && this.funeralBenefitComponent)
      this.funeralBenefitComponent.form.reset();

    if (this.isFuneralCustomScale && this.funeralCustomScaleComponent) {
      this.funeralCustomScaleComponent.clearData();
      this.isFuneralCustomScale = false;
    }
      
    if (this.isCriticalIllness && this.criticalIllnessComponent)
      this.criticalIllnessComponent.form.reset();

    if (this.isDisabilityIncome && this.disabilityIncomeComponent)
      this.disabilityIncomeComponent.form.reset();

    if (this.isLumpSumDisability && this.lumpsumDisablityComponent)
      this.lumpsumDisablityComponent.form.reset();

    if (this.isTemporalTotalDisability && this.temporalTotalDisabilityComponent)
      this.temporalTotalDisabilityComponent.form.reset();

    if (this.isSpouseDeath && this.spouseDeathComponent)
      this.spouseDeathComponent.form.reset();

    if (!this.isEditingCategory) {
      this.standardBenefitComponent.form.patchValue({ "policyId": policyId, "benefitId": benefitId });
    }
    
    this.form.patchValue({ "selectedDetailDate": "" });
    this.standardBenefitComponent.form.controls.benefitId.enable();
    this.standardBenefitComponent.form.controls.policyId.enable();

  }

  updateLookups(benefitId: number) {
    this.standardBenefitComponent.loadLookups(benefitId);

    if (this.isDeathBenefit) {
      this.deathBenefitComponent.loadLookups(benefitId);
    }
      

    if (this.isFuneralBenefit)
      this.funeralBenefitComponent.loadLookups(benefitId);

    if (this.isCriticalIllness)
      this.criticalIllnessComponent.loadLookups(benefitId);

    if (this.isDisabilityIncome)
      this.disabilityIncomeComponent.loadLookups(benefitId);

    if (this.isLumpSumDisability)
      this.lumpsumDisablityComponent.loadLookups(benefitId);

    if (this.isTemporalTotalDisability)
      this.temporalTotalDisabilityComponent.loadLookups(benefitId);

    if (this.isSpouseDeath)
      this.spouseDeathComponent.loadLookups(benefitId);
  }

  formsValid(): boolean {
    var validationResult = this.standardBenefitComponent.onValidateModel(new ValidationResult(""));
    if (validationResult.errorMessages.length > 0)
      return false;


    if (this.isDeathBenefit)
      validationResult = this.deathBenefitComponent.onValidateModel(new ValidationResult(""));

    if (this.isFuneralBenefit)
      validationResult = this.funeralBenefitComponent.onValidateModel(new ValidationResult(""));

    if (this.isCriticalIllness)
      validationResult = this.criticalIllnessComponent.onValidateModel(new ValidationResult(""));

    if (this.isDisabilityIncome)
      validationResult = this.disabilityIncomeComponent.onValidateModel(new ValidationResult(""));

    if (this.isLumpSumDisability)
      validationResult = this.lumpsumDisablityComponent.onValidateModel(new ValidationResult(""));

    if (this.isTemporalTotalDisability)
      validationResult = this.temporalTotalDisabilityComponent.onValidateModel(new ValidationResult(""));

    if (this.isSpouseDeath)
      validationResult = this.spouseDeathComponent.onValidateModel(new ValidationResult(""));

    if (this.isFuneralCustomScale)
      validationResult = this.funeralCustomScaleComponent.onValidateModel(new ValidationResult(""));


    if (validationResult.errorMessages.length > 0)
      return false;

    return true;
  }

  hideAllComponents() {
    this.isFuneralBenefit = false;
    this.isDeathBenefit = false;
    this.isCriticalIllness = false;
    this.isSpouseDeath = false;
    this.isDisabilityIncome = false;
    this.isTemporalTotalDisability = false;
    this.isLumpSumDisability = false;
    this.isFuneralCustomScale = false;
  }

  get isEditWorkflow(): boolean {
    if (!this.context)
      return false;

    return this.context.wizard.linkedItemId > 0;
  }

  isFirstDayOfMonth(date: Date): boolean {
    return this.datePipe.transform(date, "d") === "1";
  }

  bindToTable(categories: GroupRiskPolicyBenefitCategory[] = []) {
    this.createdCategories.data = categories;
    this.createdCategories.paginator = this.paginator;
    this.createdCategories.sort = this.sort;
  }

  setUpdatedCategoryOptions(benefitGroup: BenefitGroupEnum, benefitCategory: GroupRiskPolicyBenefitCategory) {
    var formControls = this.standardBenefitComponent.form.getRawValue();

    this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.NormalRetirementAge, 0, formControls.normalRetirementAge);
    this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.MinimumEntryAge, 0, formControls.minimumEntryAge);
    this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.MaximumEntryAge, 0, formControls.maxEntryAge);
    this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.BenefitPaymentOption, formControls.benefitPaymentOption);

    switch (benefitGroup) {
      case BenefitGroupEnum.CriticalIllness:
        formControls = this.criticalIllnessComponent.form.getRawValue();

        benefitCategory.salaryMultiple = formControls.salaryMultiple;
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.BenefitPackageOption, formControls.benefitPackageId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.BenefitSalaryTypeOption, formControls.benefitSalaryTypeOptionItemId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.PremiumSalaryTypeOption, formControls.premiumSalaryTypeOptionItemId);
        break;
      case BenefitGroupEnum.Death:
        formControls = this.deathBenefitComponent.form.getRawValue();

        benefitCategory.salaryMultiple = formControls.salaryMultiple;
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.MaximumCoverAge, 0, formControls.maxCoverAge);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.BenefitSalaryTypeOption, formControls.benefitSalaryTypeOptionItemId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.PremiumSalaryTypeOption, formControls.premiumSalaryTypeOptionItemId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.LessApprovedBenefitOption, formControls.lessApprovedBenefitOptionId); 
        break;
      case BenefitGroupEnum.DisabilityIncome:
        formControls = this.disabilityIncomeComponent.form.getRawValue();

        benefitCategory.employerWaiver = formControls.employerWaiver;
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.ClaimWaitingPeriod, formControls.claimWaitingPeriodOptionId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.EmployeeDisabilityBenefitOption, formControls.employeeBenefitsOptionId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.BenefitSalaryTypeOption, formControls.benefitSalaryTypeOptionItemId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.PremiumSalaryTypeOption, formControls.premiumSalaryTypeOptionItemId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.BenefitDefitionOption, formControls.benefitDefinitionOptionItemId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.InitialBenefitPeriodOption, formControls.initialBenefitPeriodOptionItemId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.BenefitEscalationRateOption, formControls.benefitEscalationRateOptionItemId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.MedicalPremiumWaiverOption, formControls.medicalPremiumWaiverOptionItemId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.MedicalWaiverPaymentTermOption, formControls.medicalWaiverPaymentTermOptionId);
        break;
      case BenefitGroupEnum.Funeral:
        formControls = this.funeralBenefitComponent.form.getRawValue();

        benefitCategory.funeralCoverTypeId = formControls.coverTypeOptionId;
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.MaximumCoverAge, 0, formControls.maxCoverAge);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.SpouseMaximumCoverAge, 0, formControls.spouseMaxCoverAge);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.MaximumSpousesCovered, 0, formControls.maxSpouseCovered);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.ChildMaximumCoverAge, 0, formControls.childMaxCoverAge);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.ParentEntryAge, 0, formControls.parentEntryAge);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.ParentMaximumCoverAge, 0, formControls.parentMaxCoverAge);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.ExtendedFamilyEntryAge, 0, formControls.extendedFamilyEntryAge);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.ExtendedFamilyMaximumCoverAge, 0, formControls.extendedFamilyMaxCoverAge);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.EligibilityWaitingPeriod, formControls.eligibilityWaitingPeriodOptionId);

        if (benefitCategory.funeralCoverTypeId == FuneralCoverTypeEnum.CustomScale) {
          benefitCategory.funeralScales = this.getCustomScales();
        }
        break;
      case BenefitGroupEnum.LumpSumDisability:
        formControls = this.lumpsumDisablityComponent.form.getRawValue();

        benefitCategory.salaryMultiple = formControls.salaryMultiple;
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.ClaimWaitingPeriod, formControls.claimWaitingPeriodOptionId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.BenefitSalaryTypeOption, formControls.benefitSalaryTypeOptionItemId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.PremiumSalaryTypeOption, formControls.premiumSalaryTypeOptionItemId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.LessApprovedBenefitOption, formControls.lessApprovedBenefitOptionId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.TaperOption, formControls.taperOptionId);
        break;
      case BenefitGroupEnum.SpouseDeath:
        formControls = this.spouseDeathComponent.form.getRawValue();

        benefitCategory.salaryMultiple = formControls.salaryMultiple;
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.MaximumCoverAge, 0, formControls.maxCoverAge);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.SpouseMaximumCoverAge, 0, formControls.spouseMaxCoverAge);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.MaximumSpousesCovered, 0, formControls.maxSpouseCovered);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.BenefitSalaryTypeOption, formControls.benefitSalaryTypeOptionItemId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.PremiumSalaryTypeOption, formControls.premiumSalaryTypeOptionItemId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.MaritalStatusOption, formControls.maritalStatusOptionId);
        break;
      case BenefitGroupEnum.TemporalTotalDisability:
        formControls = this.temporalTotalDisabilityComponent.form.getRawValue();

        benefitCategory.employerWaiver = formControls.employerWaiver;
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.BenefitPaymentTerm, 0, formControls.benefitPaymentTerm);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.ClaimWaitingPeriod, formControls.claimWaitingPeriodOptionId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.EmployeeDisabilityBenefitOption, formControls.employeeBenefitsOptionId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.BenefitSalaryTypeOption, formControls.benefitSalaryTypeOptionItemId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.PremiumSalaryTypeOption, formControls.premiumSalaryTypeOptionItemId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.BenefitDefitionOption, formControls.benefitDefinitionOptionItemId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.InitialBenefitPeriodOption, formControls.initialBenefitPeriodOptionItemId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.BenefitEscalationRateOption, formControls.benefitEscalationRateOptionItemId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.MedicalPremiumWaiverOption, formControls.medicalPremiumWaiverOptionItemId);
        this.updateOption(benefitCategory.categoryOptions, OptionItemFieldEnum.MedicalWaiverPaymentTermOption, formControls.medicalWaiverPaymentTermOptionId);
        
        break;
      default:
    }
  }

  getProductOptionLevelSettings(policyId, benefitId) {
    var benefit = this.getSelectedBenefit(policyId, benefitId);
    var policy = this.model.groupRiskPolicies.find(x => x.policyId == policyId);
    if (!benefit) return;
    if (benefit.benefitGroup !== BenefitGroupEnum.Death && benefit.benefitGroup !== BenefitGroupEnum.SpouseDeath && benefit.benefitGroup != BenefitGroupEnum.Funeral) {
        return;
    }
    this.groupRiskPolicyCaseService.getProductOptionOptionItemWithOverrideValues(policy.productOptionId).subscribe({
      next: result => {
        this.setProductOptionLevelSettings(benefit.benefitGroup, result);
      }
    });
    if (this.isExtendedBenefitIncluded(benefit))
      this.setShowMaxCoverAge(true, benefit.benefitGroup);
    else
      this.setShowMaxCoverAge(false, benefit.benefitGroup);

  }
  
    

  setShowMaxCoverAge(isShow: boolean, benefitGroup: BenefitGroupEnum) {
    if (benefitGroup == BenefitGroupEnum.Death) {
      this.deathBenefitComponent.setShowMaxCoverAge(isShow);
    }

    if (benefitGroup == BenefitGroupEnum.SpouseDeath) {
      this.spouseDeathComponent.setShowMaxCoverAge(isShow);
    }

    if (benefitGroup == BenefitGroupEnum.Funeral) {
      this.funeralBenefitComponent.setShowMaxCoverAge(isShow);
    }
  } 
  setProductOptionLevelSettings(benefitGroup: BenefitGroupEnum, productOptionItemValues: ProductOptionItemValueLookup[]) {
    if (benefitGroup == BenefitGroupEnum.Death) {
      this.deathBenefitComponent.setPolicyLevelOptionItems(productOptionItemValues);
    }

    if (benefitGroup == BenefitGroupEnum.SpouseDeath) {
      this.spouseDeathComponent.setPolicyLevelOptionItems(productOptionItemValues);
    }

    if (benefitGroup == BenefitGroupEnum.Funeral) {
      this.funeralBenefitComponent.setPolicyLevelOptionItems(productOptionItemValues);
    }
  }

  isExtendedBenefitIncluded(benefit: GroupRiskPolicyBenefit): boolean {
    var optionItem = benefit.benefitOptions.find(x => x.optionItemField == OptionItemFieldEnum.ExtendedDeathBenefit);
    if (!optionItem)
      return false;

    var selectedOption = new PolicyBenefitOption(optionItem.benefitOptionItemValueId);
    selectedOption.optionItemCode = optionItem.optionItemCode;
    return selectedOption.isOptionCodeIncluded();
  }

  onFuneralCoverTypeChanged(funeralCoverTypeId: number) {
    this.isFuneralCustomScale = funeralCoverTypeId == FuneralCoverTypeEnum.CustomScale ? true : false;
  }

  isCustomFuneralSetupSelected(benefitCategory: GroupRiskPolicyBenefitCategory) : boolean{
    if (!(benefitCategory.funeralCoverTypeId) || benefitCategory.funeralCoverTypeId !== FuneralCoverTypeEnum.CustomScale)
      return false;
    else
      return true;
  }
} 
