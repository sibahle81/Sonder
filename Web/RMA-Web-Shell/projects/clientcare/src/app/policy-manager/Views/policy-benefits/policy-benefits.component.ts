import { CaseTypeEnum } from "./../../shared/enums/case-type.enum";
import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { ProductOptionService } from "../../../product-manager/services/product-option.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { ProductOption } from "../../../product-manager/models/product-option";
import { BenefitTypeEnum } from "projects/shared-models-lib/src/lib/enums/benefit-type-enum";
import { PolicyBenefitsDataSource } from "./policy-benefits.datasource";
import { Case } from "../../shared/entities/case";
import { ValidationResult } from "projects/shared-components-lib/src/lib/wizard/shared/models/validation-result";
import { CoverMemberTypeEnum } from "projects/shared-models-lib/src/lib/enums/cover-member-type-enum";
import { RolePlayerBenefit } from "../../shared/entities/role-player-benefit";
import { RolePlayer } from "../../shared/entities/roleplayer";
import { Benefit } from "../../../product-manager/models/benefit";
import { HttpErrorResponse } from "@angular/common/http";
import { AlertService } from "projects/shared-services-lib/src/lib/services/alert/alert.service";
import { RuleItem } from "projects/shared-models-lib/src/lib/common/ruleItem";
import { fromEvent } from "rxjs";
import { debounceTime, distinctUntilChanged, tap } from "rxjs/operators";
import { BenefitModel } from "../../../product-manager/models/benefit-model";
import { Person } from "../../shared/entities/person";

@Component({
  selector: "policy-benefits",
  templateUrl: "./policy-benefits.component.html",
  styleUrls: ["./policy-benefits.component.css"],
})
export class PolicyBenefitsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild("filter", { static: true }) filter: ElementRef;

  @Input() selectedProductOption: ProductOption;
  @Input() coverMemberType: CoverMemberTypeEnum;
  @Input() parentModel: Case;
  @Input() title: string;
  @Input() mainMemberAge = 0;
  @Input() showAge = true;

  displayedColumns = [
    "selected",
    "age",
    "benefitType",
    "coverMemberType",
    "name",
    "benefitBaseRateLatest",
    "benefitRateLatest",
  ];

  selectedBenefits: RolePlayerBenefit[];
  benefits: RolePlayerBenefit[];
  results: Benefit[];
  model: RolePlayer;

  disableOptionCheckbox = false;
  isReadOnly = false;
  isWizard = false;

  private readonly maximumAgeRuleId = 11;
  private readonly minimumAgeRuleId = 12;

  constructor(
    private readonly alertService: AlertService,
    private readonly productOptionService: ProductOptionService,
    public readonly dataSource: PolicyBenefitsDataSource
  ) { }

  ngOnInit() {
    this.dataSource.clearData();
    this.dataSource.setControls(this.paginator, this.sort);
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    fromEvent(this.filter.nativeElement, "keyup")
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => {
          this.search();
        })
      )
      .subscribe();
  }

  search(): void {
    this.paginator.pageIndex = 0;
    if (this.filter.nativeElement.value.length === 0) {
      this.reset();
    } else {
      this.filterData();
    }
  }

  filterData(): void {
    this.dataSource.filter = this.filter.nativeElement.value
      .trim()
      .toLowerCase();
    this.dataSource.filteredData = this.dataSource.data[0];
  }

  reset(): void {
    this.filter.nativeElement.value = "";
    this.dataSource.filter = "";
  }

  populateForm(parentModel: Case) {
    this.parentModel = parentModel;
    if (this.parentModel && this.parentModel.mainMember.policies) {
      this.model = this.parentModel.mainMember;
      this.selectedBenefits = [];
      if (
        this.model &&
        this.model.policies[0].productOption &&
        this.model.benefits
      ) {
        const mainMemberBenefits = this.model.benefits.filter(
          (x) =>
            (x && (x.coverMemberType as CoverMemberTypeEnum)) ===
            this.coverMemberType
        );
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

  private canLoadBenefits(productOption: ProductOption): boolean {
    if (!this.model) { return false; }
    if (!this.model.person) { return false; }
    if (!productOption) { return false; }
    if (!productOption.id) { return false; }
    if (this.coverMemberType < 1) { return false; }
    if (this.coverMemberType > 4) { return false; }
    return true;
  }

  private getRoleplayerBenefit(productOptionName: string, benefit: BenefitModel, selectedBenefit: BenefitModel, person: Person, age: any[]): RolePlayerBenefit {
    const rolePlayerBenefit = new RolePlayerBenefit();
    rolePlayerBenefit.id = benefit.benefitId;
    rolePlayerBenefit.name = benefit.benefitName;
    rolePlayerBenefit.benefitName = benefit.benefitName;
    rolePlayerBenefit.productOptionName = productOptionName;
    rolePlayerBenefit.code = benefit.benefitCode;
    rolePlayerBenefit.coverMemberType = benefit.coverMemberType;
    rolePlayerBenefit.benefitType = benefit.benefitType;
    rolePlayerBenefit.rolePlayerName = `${person.firstName} ${person.surname}`;    
    rolePlayerBenefit.age = age[0];
    rolePlayerBenefit.ageIsYears = age[1];
    if (selectedBenefit) {
      rolePlayerBenefit.selected = true;  
      rolePlayerBenefit.benefitBaseRateLatest = selectedBenefit.baseRate;
      rolePlayerBenefit.benefitRateLatest = selectedBenefit.benefitAmount;
      rolePlayerBenefit.isStatedBenefit = selectedBenefit.benefitType === BenefitTypeEnum.Basic;
    } else {
      rolePlayerBenefit.selected = false;    
      rolePlayerBenefit.benefitBaseRateLatest = benefit.baseRate;
      rolePlayerBenefit.benefitRateLatest = benefit.benefitAmount;
      rolePlayerBenefit.isStatedBenefit = benefit.benefitType === BenefitTypeEnum.Basic;
    }
    return rolePlayerBenefit;
  }

  private getDate(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  getData(productOption: ProductOption): void {
    if (!this.canLoadBenefits(productOption)) { return; }
    this.benefits = [];
    this.productOptionService.getBenefitsForProductOptionAndCoverType(productOption.id, this.coverMemberType).subscribe({
      next: (benefits: BenefitModel[]) => {
        const member = this.parentModel.mainMember;
        let selectedBenefitIds: number[] = [];
        let selectedBenefits: BenefitModel[] = [];
        // Calculate member join age and current age.
        const today = this.getDate(new Date());
        let inceptionDate = today;
        if (member.policies?.length > 0) {
          inceptionDate = this.getDate(new Date(member.policies[0].policyInceptionDate));
        }
        const dob = this.getDate(new Date(member.person.dateOfBirth));
        const memberAge = this.getMemberAge(dob, today);
        const joinAge = this.getMemberAge(dob, inceptionDate);
        // Find the benefits already selected for the member
        if (member.benefits?.length > 0) {
          selectedBenefits = this.getBenefitsModel(member.benefits);
          selectedBenefitIds = selectedBenefits.map(b => b.benefitId);
        }
        // Load the benefits
        benefits.forEach(benefit => {
          if (!this.benefitAlreadyIncluded(benefit.benefitId)) {
            const selectedBenefit = selectedBenefits.find(b => b.benefitId === benefit.benefitId);
            const roleplayerBenefit = this.getRoleplayerBenefit(productOption.name, benefit, selectedBenefit, member.person, memberAge);
            if (this.isReadOnly) {
              if (selectedBenefit) {
                this.benefits.push(roleplayerBenefit); 
              }
            } else if (this.passesBenefitRules(roleplayerBenefit, memberAge, joinAge)) {              
              this.benefits.push(roleplayerBenefit);              
            }
          }
        });
        // If there is only one basic benefit, select it
        var basicBenefits = this.benefits.filter(b => b.benefitType === BenefitTypeEnum.Basic);
        if (basicBenefits.length === 1) {
          basicBenefits[0].selected = true;
        }
        // Sort the benefits
        this.benefits = this.benefits.sort(this.compareBenefit);
        // Disable the checkboxes if the view is readonly.
        // This is set for all records, individual records cannot be enabled / disabled.
        if (this.model.policies[0].policyLifeExtension == undefined) {
          this.disableOptionCheckbox = this.isReadOnly;
        } else {
          this.disableOptionCheckbox = true;
        }
      },
      error: (response: HttpErrorResponse) => {
        this.showErrorMessage(response);
      },
      complete: () => {
        this.dataSource.getData(this.benefits);
        this.results = this.benefits;
      }
    });
  }

  private compareBenefit(a: RolePlayerBenefit, b: RolePlayerBenefit): number {
    const benefitTypeComparison = a.benefitType - b.benefitType;
    if (benefitTypeComparison !== 0) {
      return benefitTypeComparison;
    }
    return a.benefitName.localeCompare(b.benefitName);
  }

  private getBenefitsModel(benefits: RolePlayerBenefit[]): BenefitModel[] {
    const list: BenefitModel[] = [];
    for (const benefit of benefits) {
      const model = new BenefitModel();
      model.productOptionName = benefit.productOptionName;
      model.benefitId = benefit.id;
      model.benefitName = benefit.name;
      model.benefitCode = benefit.code;
      model.coverMemberType = benefit.coverMemberType;
      model.benefitType = benefit.benefitType;
      model.minimumAge = benefit.minAge;
      model.maximumAge = benefit.maxAge;
      model.baseRate = benefit.benefitBaseRateLatest;
      model.benefitAmount = benefit?.benefitRateLatest;
      model.selected = benefit.selected;
      list.push(model);
    }
    return list;
  }

  private benefitAlreadyIncluded(benefitId: number): boolean {
    const idx = this.benefits.findIndex((b) => b.id === benefitId);
    return idx >= 0;
  }

  private passesBenefitRules(
    rolePlayerBenefit: RolePlayerBenefit,
    memberAge: any[],
    joinAge: any[]
  ): boolean {
    if (!rolePlayerBenefit.ruleItems) {
      rolePlayerBenefit.age = joinAge[0];
      rolePlayerBenefit.ageIsYears = joinAge[1];
      return true;
    }

    const minAge = this.getRuleAge(
      rolePlayerBenefit.ruleItems.filter(
        (ri) => ri.ruleId === this.minimumAgeRuleId
      ),
      0
    );
    const maxAge = this.getRuleAge(
      rolePlayerBenefit.ruleItems.filter(
        (ri) => ri.ruleId === this.maximumAgeRuleId
      ),
      999
    );

    if (joinAge[0] >= minAge && joinAge[0] <= maxAge) {
      rolePlayerBenefit.age = joinAge[0];
      rolePlayerBenefit.ageIsYears = joinAge[1];
      return true;
    }

    if (memberAge[0] >= minAge && memberAge[0] <= maxAge) {
      rolePlayerBenefit.age = memberAge[0];
      rolePlayerBenefit.ageIsYears = memberAge[1];
      return true;
    }

    return false;
  }

  private getRuleAge(rules: RuleItem[], defaultAge: number) {
    if (!rules || rules.length === 0) {
      return defaultAge;
    }
    const rule = rules[0];

    if (rule.ruleConfiguration) {
      const formattedJson = rule.ruleConfiguration.replace(/'/g, '"');
      const configs = JSON.parse(formattedJson) as Array<any>;
      if (configs && configs.length > 0) {
        const config = configs[0];
        return config.fieldValue as number;
      }
    }
    return defaultAge;
  }

  private getRolePlayerBenefit(
    productOptionName: string,
    roleplayer: RolePlayer,
    benefit: BenefitModel,
    selectedBenefitIds: number[]
  ): RolePlayerBenefit {

    if (!benefit) { return null; }

    const existing = roleplayer.benefits?.find(b => b.id === benefit.benefitId && (b.benefitRateLatest > 0.00 || b.benefitBaseRateLatest > 0.00));

    const rolePlayerBenefit = new RolePlayerBenefit();
    rolePlayerBenefit.id = benefit.benefitId;
    if (existing) {
      rolePlayerBenefit.benefitBaseRateLatest = existing.benefitBaseRateLatest;
      rolePlayerBenefit.benefitRateLatest = existing.benefitRateLatest;
    } else {
      rolePlayerBenefit.benefitBaseRateLatest = benefit.baseRate;
      rolePlayerBenefit.benefitRateLatest = benefit.benefitAmount;
    }
    rolePlayerBenefit.benefitType = benefit.benefitType;
    rolePlayerBenefit.coverMemberType = benefit.coverMemberType;
    rolePlayerBenefit.name = benefit.benefitName;
    rolePlayerBenefit.code = benefit.benefitCode;
    rolePlayerBenefit.isStatedBenefit =
      rolePlayerBenefit.benefitBaseRateLatest > 0 &&
      benefit.benefitType === BenefitTypeEnum.Additional;
    rolePlayerBenefit.productOptionName = productOptionName;
    rolePlayerBenefit.benefitName = benefit.benefitName;
    rolePlayerBenefit.selected = selectedBenefitIds.includes(benefit.benefitId);
    rolePlayerBenefit.rolePlayerName = `${roleplayer.person.firstName} ${roleplayer.person.surname}`;
    return rolePlayerBenefit;
  }

  private getMemberAge(dob: Date, testDate: Date): any[] {
    let age = testDate.getFullYear() - dob.getFullYear();
    const birthDay = new Date(
      testDate.getFullYear(),
      dob.getMonth(),
      dob.getDate()
    );
    if (birthDay.getTime() > testDate.getTime()) {
      age--;
    }
    if (age > 0) {
      return [age, true];
    }
    age =
      dob.getMonth() >= testDate.getMonth()
        ? 12 + testDate.getMonth() - dob.getMonth()
        : testDate.getMonth() - dob.getMonth();
    if (age === 12) {
      age--;
    }
    return [age, false];
  }

  private showErrorMessage(error: HttpErrorResponse): void {
    if (error.error) {
      if (error.error.Error) {
        this.alertService.error(error.error.Error);
      } else if (error.message) {
        this.alertService.error(error.message);
      }
    } else {
      this.alertService.error("An unknown error has occured.");
    }
  }

  addBenefit(event: any, benefit: RolePlayerBenefit) {
    benefit.selected = event.checked;
    if (event.checked) {
      this.benefits.forEach(
        b => {
          if (b.rolePlayerName === benefit.rolePlayerName) {
            if (benefit.benefitType === BenefitTypeEnum.Basic && benefit.id !== b.id) {
              b.selected = false;
            }
          }
        }
      );
    }
    this.dataSource.dataChange.next(this.benefits);
  }

  getSelectedBenefits(): RolePlayerBenefit[] {
    return this.benefits
      ? this.benefits.filter((d) => d.selected === true)
      : [];
  }

  getCoverMemberTypeDesc(id: number): string {
    return CoverMemberTypeEnum[id].replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, " $1").trim();
  }

  getBenefitTypeDesc(id: number): string {
    return BenefitTypeEnum[id];
  }

  populateModel(): void {
    if (this.model) {
      if (this.model.caseTypeId !== CaseTypeEnum.CancelPolicy) {
        if (this.parentModel.mainMember) {
          this.selectedBenefits = this.getSelectedBenefits();
        } else {
          this.selectedBenefits = [];
        }
        if (this.model.benefits) {
          for (let x = this.model.benefits.length - 1; x >= 0; x--) {
            if (
              this.model.benefits[x] &&
              this.model.benefits[x].coverMemberType === this.coverMemberType
            ) {
              this.model.benefits.splice(x, 1);
            }
          }
        } else {
          this.model.benefits = [];
        }

        if (
          this.parentModel.mainMember.policies.length > 0 &&
          this.parentModel.mainMember.policies[0].benefits
        ) {
          for (
            let x = this.parentModel.mainMember.policies[0].benefits.length - 1;
            x >= 0;
            x--
          ) {
            if (
              this.parentModel.mainMember.policies[0].benefits[x] &&
              this.parentModel.mainMember.policies[0].benefits[x]
                .coverMemberType === this.coverMemberType
            ) {
              this.parentModel.mainMember.policies[0].benefits.splice(x, 1);
            }
          }
        } else {
          this.parentModel.mainMember.policies[0].benefits = [];
        }

        for (let x = this.selectedBenefits.length - 1; x >= 0; x--) {
          if (
            this.selectedBenefits[x].coverMemberType === this.coverMemberType
          ) {
            this.selectedBenefits[x].rolePlayerName =
              this.parentModel.mainMember.displayName;
            if (this.selectedBenefits[x]) {
              this.model.benefits.push(this.selectedBenefits[x]);
            }
            this.parentModel.mainMember.policies[0].benefits.push(
              this.results.filter(
                (y) => y.id === this.selectedBenefits[x].id
              )[0]
            );
          }
        }
      }
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model && this.model.benefits) {
      if (
        this.parentModel.mainMember &&
        (this.model.benefits.length === 0 ||
          this.model.benefits.filter(
            (b) => b !== null && b.benefitType === BenefitTypeEnum.Basic
          ).length === 0)
      ) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push(
          "No basic benefit found for " + this.model.displayName
        );
      }

      if (
        this.parentModel.mainMember &&
        this.model.benefits.filter(
          (b) =>
            b !== null &&
            b.benefitType === BenefitTypeEnum.Basic &&
            b.coverMemberType === CoverMemberTypeEnum.MainMember
        ).length > 1
      ) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push(
          "There must only be a single basic benefit found for " +
          this.model.displayName
        );
      }
    }
    return validationResult;
  }

  memberPassesAgeGroupRules(
    benefit: Benefit,
    memberBenefit: RolePlayerBenefit
  ): boolean {
    let passed = true;

    if (!memberBenefit.age) {
      return false;
    }

    if (memberBenefit && benefit) {
      if (!benefit.ruleItems || benefit.ruleItems.length === 0) {
        return passed;
      }

      benefit.ruleItems.forEach((rule) => {
        if (rule.ruleConfiguration) {
          const formattedJson = rule.ruleConfiguration.replace(/'/g, '"');
          const configs = JSON.parse(formattedJson) as Array<any>;
          for (const config of configs) {
            if (
              config.fieldName === "Maximum Entry Age (Years)" &&
              memberBenefit.ageIsYears
            ) {
              passed = passed && memberBenefit.age <= config.fieldValue;
            }
            if (
              config.fieldName === "Minimum Entry Age (Years)" &&
              memberBenefit.ageIsYears
            ) {
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
