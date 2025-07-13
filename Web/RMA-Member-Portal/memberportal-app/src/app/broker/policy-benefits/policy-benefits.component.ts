import { Component, OnInit, ViewChild, Input, AfterViewInit } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BehaviorSubject } from "rxjs";
import { ValidationResult } from "src/app/shared/components/wizard/shared/models/validation-result";
import { BenefitTypeEnum } from "src/app/shared/enums/benefit-type-enum";
import { CaseType } from "src/app/shared/enums/case-type.enum";

import { CoverMemberTypeEnum } from "src/app/shared/enums/cover-member-type-enum";
import { Benefit } from "src/app/shared/models/benefit";
import { Case } from "src/app/shared/models/case";
import { ProductOption } from "src/app/shared/models/product-option";
import { RolePlayerBenefit } from "src/app/shared/models/role-player-benefit";
import { RolePlayer } from "src/app/shared/models/roleplayer";
import { ProductOptionService } from "src/app/shared/services/product-option.service";


@Component({
  selector: 'policy-benefits',
  templateUrl: './policy-benefits.component.html',
  styleUrls: ['./policy-benefits.component.css']
})
export class PolicyBenefitsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isData$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public dataSource = new MatTableDataSource<Benefit>();

  @Input() selectedProductOption: ProductOption;
  @Input() coverMemberType: CoverMemberTypeEnum;
  @Input() parentModel: Case;
  @Input() title: string;
  @Input() mainMemberAge = 0;
  @Input() showAge = true;

  displayedColumns = ['selected', 'age', 'benefitType', 'coverMemberType', 'code', 'name', 'benefitBaseRateLatest', 'benefitRateLatest'];
  benefits: RolePlayerBenefit[];
  model: RolePlayer;
  selectedBenefits: RolePlayerBenefit[];
  results: Benefit[];
  disableCheckbox = true;
  isWizard = false;

  get disableSelectBox(): boolean {
    if (this.isWizard) { return this.disableCheckbox; }
    return true;
  }

  constructor(
    private readonly productOptionService: ProductOptionService
  ) { }

  ngOnInit() {

  }

  populateForm(parentModel: Case) {
    this.parentModel = parentModel;
    if (this.parentModel && this.parentModel.mainMember.policies) {
      this.model = this.parentModel.mainMember;
      this.selectedBenefits = [];
      if (this.model && this.model.policies[0].productOption && this.model.benefits) {
        const mainMemberBenefits = this.model.benefits.filter(x => (x && x.coverMemberType as CoverMemberTypeEnum) === this.coverMemberType);
        for (let y = mainMemberBenefits.length - 1; y >= 0; y--) {
          this.selectedBenefits.push(mainMemberBenefits[y]);
        }
        this.getData(this.parentModel.mainMember.policies[0].productOption);
      }
    }
  }

  onSelectedOptionChanged(selectedProductOption: ProductOption) {
    this.selectedProductOption = selectedProductOption;
    if (this.selectedProductOption) {
      this.selectedBenefits = [];
      this.getData(this.selectedProductOption);
    }
  }

  getData(productOption: ProductOption) {
    if (productOption && productOption.id) {
      this.isLoading$.next(true);
      this.productOptionService.getBenefitsForOption(productOption.id).subscribe(
        data => {
          const benefits: Benefit[] = data.filter(x => x.coverMemberType === this.coverMemberType);

          let selectedBenefitIds: number[] = [];
          if (this.parentModel.mainMember.benefits && this.parentModel.mainMember.benefits.length > 0) {
            selectedBenefitIds = this.parentModel.mainMember.benefits.map(b => b.id);
          } else if (benefits.length === 1) {
            selectedBenefitIds = benefits.map(b => b.id);
          }

          this.benefits = [];
          for (let i = benefits.length - 1; i >= 0; i--) {
            const element = benefits[i];
            const benefitRate = element.benefitRates.find(br => br.benefitRateStatusText === 'Current');
            const benefitViewModel = new RolePlayerBenefit();
            benefitViewModel.id = element.id;
            benefitViewModel.benefitBaseRateLatest = benefitRate ? benefitRate.baseRate : element.benefitBaseRateLatest;
            benefitViewModel.benefitRateLatest = benefitRate ? benefitRate.benefitAmount : element.benefitRateLatest;
            benefitViewModel.benefitType = element.benefitType;
            benefitViewModel.coverMemberType = element.coverMemberType;
            benefitViewModel.code = element.code;
            benefitViewModel.ruleItems = element.ruleItems;
            benefitViewModel.startDate = element.startDate;
            benefitViewModel.name = element.name;
            benefitViewModel.endDate = element.endDate;
            benefitViewModel.productClass = element.productClass;
            benefitViewModel.productId = element.productId;
            benefitViewModel.statusText = element.statusText;
            benefitViewModel.isStatedBenefit = benefitViewModel.benefitBaseRateLatest > 0 && element.benefitType === BenefitTypeEnum.Additional;
            benefitViewModel.productOptionName = productOption.name;
            benefitViewModel.benefitName = element.name;
            benefitViewModel.selected = selectedBenefitIds.includes(element.id);

            if (this.model.person) {
              benefitViewModel.rolePlayerName = this.model.person.firstName + ' ' + this.model.person.surname;
              if (this.model.person.dateOfBirth) {

                const today = new Date();
                const dob = new Date(this.model.person.dateOfBirth);

                let age = today.getFullYear() - dob.getFullYear();
                const birthDay = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());

                if (birthDay > today) { age--; }

                if (age <= 0) {
                  age = (dob.getMonth() >= today.getMonth()) ? 12 + today.getMonth() - dob.getMonth() : today.getMonth() - dob.getMonth();
                  if (age === 12) { age--; }
                  benefitViewModel.age = age;
                  benefitViewModel.ageIsYears = false;
                } else {
                  benefitViewModel.age = age;
                  benefitViewModel.ageIsYears = true;
                }
              } else if (this.mainMemberAge > 0) {
                benefitViewModel.age = this.mainMemberAge;
                benefitViewModel.ageIsYears = true;
              }
            }

            if (this.memberPassesAgeGroupRules(element, benefitViewModel)) {
              this.benefits.push(benefitViewModel);
            }
          }

          if (this.parentModel.caseTypeId === 1) {
            if (benefits.length === 1) {
              benefits[0].selected = true;
              this.disableCheckbox = true;
            } else {
              this.disableCheckbox = false;
            }
          }

          setTimeout(() => {
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
          })

          this.getSourceData(this.benefits);
          this.isLoading$.next(false);
          this.results = benefits;
        }
      );
    }
  }

  addBenefit(event: any, benefit: RolePlayerBenefit) {
    benefit.selected = event.checked;
    if (event.checked && benefit.benefitType === 1) {
      this.benefits.forEach(
        b => {
          if (b.id !== benefit.id && b.rolePlayerName === benefit.rolePlayerName) {
            if (b.benefitType === 1 && b.selected) {
              b.selected = false;
            }
          }
        }
      );
    }
    this.dataSource.data = this.benefits;
  }


  getSourceData(benefits: Benefit[]) {
    this.isLoading$.next(true);
    this.dataSource.data = benefits;
    this.isLoading$.next(false);
  }

  getSelectedBenefits(): RolePlayerBenefit[] {
    return this.benefits ? this.benefits.filter(d => d.selected === true) : [];
  }

  getCoverMemberTypeDesc(id: number): string {
    return CoverMemberTypeEnum[id].replace(/([A-Z])/g, ' $1').trim();
  }

  getBenefitTypeDesc(id: number): string {
    return BenefitTypeEnum[id];
  }

  populateModel(): void {
    if (this.model) {
      if (this.model.caseTypeId !== CaseType.CancelPolicy) {
        if (this.parentModel.mainMember) {
          this.selectedBenefits = this.getSelectedBenefits();
        } else {
          this.selectedBenefits = [];
        }
        if (this.model.benefits) {
          for (let x = this.model.benefits.length - 1; x >= 0; x--) {
            if (this.model.benefits[x] && this.model.benefits[x].coverMemberType === this.coverMemberType) {
              this.model.benefits.splice(x, 1);
            }
          }
        } else {
          this.model.benefits = [];
        }

        if (this.parentModel.mainMember.policies.length > 0 && this.parentModel.mainMember.policies[0].benefits) {
          for (let x = this.parentModel.mainMember.policies[0].benefits.length - 1; x >= 0; x--) {
            if (this.parentModel.mainMember.policies[0].benefits[x] && this.parentModel.mainMember.policies[0].benefits[x].coverMemberType === this.coverMemberType) {
              this.parentModel.mainMember.policies[0].benefits.splice(x, 1);
            }
          }
        } else {
          this.parentModel.mainMember.policies[0].benefits = [];
        }

        for (let x = this.selectedBenefits.length - 1; x >= 0; x--) {
          if (this.selectedBenefits[x].coverMemberType === this.coverMemberType) {
            this.selectedBenefits[x].rolePlayerName = this.parentModel.mainMember.displayName;
            if (this.selectedBenefits[x]) {
              this.model.benefits.push(this.selectedBenefits[x]);
            }
            this.parentModel.mainMember.policies[0].benefits.push(this.results.filter(y => y.id === this.selectedBenefits[x].id)[0]);
          }
        }
      }
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model && this.model.benefits) {
      if (this.parentModel.mainMember && (this.model.benefits.length === 0 || this.model.benefits.filter(b => b !== null && b.benefitType === BenefitTypeEnum.Basic).length === 0)) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push('No basic benefit found for ' + this.model.displayName);
      }

      if (this.parentModel.mainMember && (this.model.benefits.filter(b => b !== null && b.benefitType === BenefitTypeEnum.Basic && b.coverMemberType === CoverMemberTypeEnum.MainMember).length > 1)) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push('There must only be a single basic benefit found for ' + this.model.displayName);
      }
    }
    return validationResult;
  }

  getAge(dateOfBirth: Date) {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const birthDay = new Date(today.getFullYear(), dateOfBirth.getMonth(), dateOfBirth.getDate());
    if (birthDay > today) { age--; }
    if (age > 0) { return `${age} years`; }
    age = (dateOfBirth.getMonth() >= today.getMonth()) ? 12 + today.getMonth() - dateOfBirth.getMonth() : today.getMonth() - dateOfBirth.getMonth();
    if (age === 12) { age--; }
    return `${age} months`;
  }

  memberPassesAgeGroupRules(benefit: Benefit, memberBenefit: RolePlayerBenefit): boolean {
    let passed = true;

    if (!memberBenefit.age) {
      return false;
    }

    if (memberBenefit && benefit) {
      if (!benefit.ruleItems || benefit.ruleItems.length === 0) { return passed; }

      benefit.ruleItems.forEach(rule => {
        if (rule.ruleConfiguration) {
          const formattedJson = rule.ruleConfiguration.replace(/'/g, '"');
          const configs = JSON.parse(formattedJson) as Array<any>;
          for (const config of configs) {
            if (config.fieldName === 'Maximum Entry Age (Years)' && memberBenefit.ageIsYears) {
              passed = passed && memberBenefit.age <= config.fieldValue;
            }

            if (config.fieldName === 'Minimum Entry Age (Years)' && memberBenefit.ageIsYears) {
              passed = passed && memberBenefit.age >= config.fieldValue;
            }
          }
        }
      });
    }
    return passed;
  }

  disable(): void {
    this.isWizard = false;
  }
}
