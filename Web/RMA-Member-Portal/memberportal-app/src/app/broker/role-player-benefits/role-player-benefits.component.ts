import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';
import { ValidationResult } from 'src/app/shared/components/wizard/shared/models/validation-result';
import { BenefitTypeEnum } from 'src/app/shared/enums/benefit-type-enum';
import { CoverMemberTypeEnum } from 'src/app/shared/enums/cover-member-type-enum';
import { InsuredLifeStatusEnum } from 'src/app/shared/enums/insured-life-status.enum';
import { RolePlayerTypeEnum } from 'src/app/shared/enums/role-player-type-enum';
import { Benefit } from 'src/app/shared/models/benefit';
import { Case } from 'src/app/shared/models/case';
import { PolicyInsuredLife } from 'src/app/shared/models/policy-insured-life';
import { RolePlayerBenefit } from 'src/app/shared/models/role-player-benefit';
import { RolePlayer } from 'src/app/shared/models/roleplayer';
import { RuleItem } from 'src/app/shared/models/ruleItem';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { ProductOptionService } from 'src/app/shared/services/product-option.service';


@Component({
  selector: 'role-player-benefits',
  templateUrl: './role-player-benefits.component.html',
  styleUrls: ['./role-player-benefits.component.css']
})
export class RolePlayerBenefitsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isData$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public dataSource = new MatTableDataSource<Benefit>();

  @Input() title: string;
  @Input() caption: string;
  @Input() coverMemberType: CoverMemberTypeEnum;
  @Input() productOptionId: number;

  displayedColumns = ['selected', 'rolePlayerName', 'age', 'benefitType', 'coverMemberType', 'code', 'name', 'premium', 'benefitAmount'];

  memberBenefits: RolePlayerBenefit[] = [];
  benefits: Benefit[] = [];
  ruleRelaxDate = new Date(1900, 1, 1);

  enableSelection = false;
  isWizard = false;
  isReadOnly = true;

  constructor(
    private readonly productOptionService: ProductOptionService,
    private readonly lookupService: LookupService
  ) {
    this.lookupService.getItemByKey('OnboardingRulesRelax').subscribe(
      data => {
        if (data) {
          this.ruleRelaxDate = new Date(data);
          this.ruleRelaxDate.setHours(0, 0, 0, 0);
        }
      }
    );
  }

  ngOnInit() {

  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadBenefits(productOptionId: number) {
    return new Promise(
      resolve => {
        this.isLoading$.next(true);
        this.productOptionService.getBenefitsForOption(productOptionId).subscribe(
          data => {
            this.benefits = data.filter(b => b.coverMemberType === this.coverMemberType);
            this.benefits.forEach(
              b => {
                const ruleitems = b.ruleItems.filter(r => r.ruleConfiguration);
                b.minAge = this.getAgeValue(ruleitems.filter(r => r.ruleId === 12 || r.ruleConfiguration.indexOf('Minimum Entry Age') >= 0), 0);
                b.maxAge = this.getAgeValue(ruleitems.filter(r => r.ruleId === 11 || r.ruleConfiguration.indexOf('Maximum Entry Age') >= 0), 999);
              }
            );
            this.isLoading$.next(false);
            resolve(this.benefits.length);
          }
        );
      }
    );
  }

  getAgeValue(rules: RuleItem[], age: number): number {
    if (rules && rules.length > 0) {
      let rule = rules[0].ruleConfiguration;
      while (rule.indexOf('\'') >= 0) { rule = rule.replace('\'', '"'); }
      const value = JSON.parse(rule);
      const item = Array.isArray(value) ? value[0] : value;
      age = item.fieldValue ? item.fieldValue : item.value;
    }
    return age;
  }

  addMembers(members: RolePlayer[]): void {
    this.getSourceData([]);
    this.memberBenefits = [];

    if (!members) { return; }

    members.forEach(
      m => {
        if (m.person) {
          let selectDefault = false;
          let benefits: Benefit[] = [];

          const joinDate = this.coverMemberType === 3 ? new Date() : new Date(m.joinDate ? m.joinDate : new Date());
          joinDate.setHours(0, 0, 0, 0);
          const memberAge = this.calculateAge(new Date(m.person.dateOfBirth), joinDate);
          if (joinDate.getTime() >= this.ruleRelaxDate.getTime()) {
            benefits = this.benefits.filter(b => memberAge >= b.minAge && memberAge <= b.maxAge);
          } else {
            benefits = this.benefits;
          }
          selectDefault = benefits.length === 1;

          benefits.forEach(
            b => {
              const memberHasBenefit = m.benefits ? m.benefits.findIndex(mb => mb.id === b.id) >= 0 : false;
              const rpb = new RolePlayerBenefit();
              const rates = b.benefitRates.filter(r => r.benefitRateStatusText === 'Current');
              const rate = (rates.length > 0) ? rates[0] : null;
              rpb.selected = memberHasBenefit || selectDefault;
              rpb.rolePlayerName = m.displayName;
              rpb.age = memberAge;
              rpb.ageIsYears = true;
              rpb.id = b.id;
              rpb.benefitType = b.benefitType;
              rpb.coverMemberType = b.coverMemberType;
              rpb.code = b.code;
              rpb.name = b.name;
              rpb.benefitBaseRateLatest = rate ? rate.baseRate : 0;
              rpb.benefitRateLatest = rate ? rate.benefitAmount : 0;
              this.memberBenefits.push(rpb);
            }
          );
        }
      }
    );
    this.enableSelection = false;
    if (this.isWizard) {
      this.enableSelection = !this.isReadOnly;
    }
    this.getSourceData(this.memberBenefits);
  }

  populateModel(model: Case, members: RolePlayer[]): RolePlayer[] {
    if (!model) { return []; }
    if (!members || members.length === 0) { return []; }

    const policyId = model.mainMember.policies[0].policyId;

    if (model.mainMember.policies &&
      model.mainMember.policies.length > 0 &&
      model.mainMember.policies[0].benefits &&
      model.mainMember.policies[0].benefits.length > 0 &&
      model.mainMember.policies[0].benefits[0]
    ) {
      model.mainMember.policies[0].benefits
        = model.mainMember.policies[0].benefits.filter(b => b.coverMemberType !== this.coverMemberType);
    }

    let rolePlayerTypeId = 0;
    switch (this.coverMemberType) {
      case CoverMemberTypeEnum.MainMember:
        rolePlayerTypeId = RolePlayerTypeEnum.MainMemberSelf;
        break;
      case CoverMemberTypeEnum.Spouse:
        rolePlayerTypeId = RolePlayerTypeEnum.Spouse;
        break;
      case CoverMemberTypeEnum.Child:
        rolePlayerTypeId = RolePlayerTypeEnum.Child;
        break;
      default:
        rolePlayerTypeId = RolePlayerTypeEnum.Extended;
    }

    if (!model.mainMember.policies[0].insuredLives) {
      model.mainMember.policies[0].insuredLives = [];
    }

    model.mainMember.policies[0].insuredLives
      = model.mainMember.policies[0].insuredLives.filter(l => l.rolePlayerTypeId !== rolePlayerTypeId);

    members.forEach(
      m => {
        m.benefits = [];
        const memberBenefits = this.memberBenefits.filter(mb => mb.selected && mb.rolePlayerName === m.displayName);
        memberBenefits.forEach(
          mb => {
            // Add the insured life
            const insuredLife = new PolicyInsuredLife();
            insuredLife.policyId = policyId;
            insuredLife.rolePlayerId = m.rolePlayerId;
            insuredLife.rolePlayerTypeId = rolePlayerTypeId;
            insuredLife.insuredLifeStatus = InsuredLifeStatusEnum.Active;
            insuredLife.statedBenefitId = mb.id;
            insuredLife.startDate = m.joinDate;
            insuredLife.endDate = null;
            model.mainMember.policies[0].insuredLives.push(insuredLife);
            // Add the benefit
            const benefit = this.benefits.find(b => b.id === mb.id);
            let benefitExists: Benefit = null;

            if (model.mainMember.policies &&
              model.mainMember.policies.length > 0 &&
              model.mainMember.policies[0].benefits &&
              model.mainMember.policies[0].benefits.length > 0 &&
              model.mainMember.policies[0].benefits[0]
            ) {
              benefitExists = model.mainMember.policies[0].benefits.find(b => b.id === benefit.id);
            }

            if (!benefitExists) {
              model.mainMember.policies[0].benefits.push(benefit);
            }
            m.benefits.push(mb);
          }
        );
      }
    );
    return members;
  }

  validateModel(members: RolePlayer[], validationResult: ValidationResult): void {
    members.forEach(
      m => {
        if (m.benefits) {
          const benefits = m.benefits.filter(b => b.benefitType === 1);
          if (benefits.length === 0 && !m.isDeleted) {
            validationResult.errors = validationResult.errors + 1;
            validationResult.errorMessages.push('No basic benefit found for ' + m.displayName);
          }
        } else {
          validationResult.errors = validationResult.errors + 1;
          validationResult.errorMessages.push('No benefits found for ' + m.displayName);
        }
      }
    );
  }

  calculateAge(birthDate: Date, joinDate: Date): number {
    let age = joinDate.getFullYear() - birthDate.getFullYear();
    const birthDay = new Date(joinDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (birthDay.getTime() > joinDate.getTime()) { age--; }
    return age;
  }

  getBenefitType(id: number): string {
    return BenefitTypeEnum[id];
  }

  getCoverMemberType(id: number): string {
    return CoverMemberTypeEnum[id].replace(/([A-Z])/g, ' $1').trim();
  }

  getSourceData(benefits: Benefit[]): void {
    this.isLoading$.next(true);
    this.dataSource.data = benefits;
    this.isLoading$.next(false);
  }

  updateBenefit(event: any, benefit: RolePlayerBenefit) {
    benefit.selected = event.checked;
    if (event.checked && benefit.benefitType === 1) {
      this.memberBenefits.forEach(
        mb => {
          if (mb.id !== benefit.id && mb.rolePlayerName === benefit.rolePlayerName) {
            if (mb.benefitType === 1 && mb.selected) {
              mb.selected = false;
            }
          }
        }
      );
    }
    this.dataSource.data = this.memberBenefits;
  }
}
