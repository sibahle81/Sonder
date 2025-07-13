import { Component, OnInit, Input, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fromEvent } from 'rxjs';

import { CoverMemberTypeEnum } from 'projects/shared-models-lib/src/lib/enums/cover-member-type-enum';
import { ProductOptionService } from '../../../product-manager/services/product-option.service';
import { BenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/benefit-type-enum';
import { RolePlayerBenefit } from '../../shared/entities/role-player-benefit';
import { Benefit } from '../../../product-manager/models/benefit';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { Case } from '../../shared/entities/case';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { PolicyInsuredLife } from '../../shared/entities/policy-insured-life';
import { InsuredLifeStatusEnum } from '../../shared/enums/insured-life-status.enum';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BenefitModel } from '../../../product-manager/models/benefit-model';
import { Person } from '../../shared/entities/person';

import 'src/app/shared/extensions/date.extensions';

const defaultDate = '0001-01-01T00:00:00';

@Component({
  selector: 'role-player-benefits',
  templateUrl: './role-player-benefits.component.html',
  styleUrls: ['./role-player-benefits.component.css']
})
export class RolePlayerBenefitsComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;

  @Input() title: string;
  @Input() caption: string;
  @Input() coverMemberType: CoverMemberTypeEnum;
  @Input() productOptionId: number;

  displayedColumns = ['selected', 'rolePlayerName', 'age', 'benefitType', 'coverMemberType', 'name', 'premium', 'benefitAmount'];
  readonly currentBenefitStatus = 'Current';

  memberBenefits: RolePlayerBenefit[] = [];
  ruleRelaxDate = new Date(1900, 1, 1);
  benefits: BenefitModel[] = [];
  enableSelection = false;
  isLoading = false;
  isWizard = false;
  isReadOnly = true;


  get hideBenefits(): boolean {
    if (this.isLoading) { return true; }
    return this.datasource.data.length === 0;
  }

  constructor(
    private readonly productOptionService: ProductOptionService,
    private readonly lookupService: LookupService,
    public readonly datasource: Datasource
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
    this.datasource.setControls(this.paginator, this.sort);
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    fromEvent(this.filter.nativeElement, 'keyup')
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
    this.datasource.filter = this.filter.nativeElement.value.trim().toLowerCase();
    this.datasource.filteredData = this.datasource.data[0];
  }

  reset(): void {
    this.filter.nativeElement.value = '';
    this.datasource.filter = '';
  }

  loadBenefits(productOptionId: number) {
    const coverMemberType = this.coverMemberType;
    if (coverMemberType && coverMemberType >= 1 && coverMemberType <= 4) {
      return new Promise(
        resolve => {
          this.isLoading = true;
          this.productOptionService.getBenefitsForProductOptionAndCoverType(productOptionId, this.coverMemberType).subscribe(
            data => {
              this.benefits = data;
              this.isLoading = false;
              resolve(this.benefits.length);
            }
          );
        }
      );
    }
  }

  addMembers(members: RolePlayer[], preventBenefitEdit: boolean): void {
    this.datasource.clearData();
    this.datasource.getData([]);
    this.memberBenefits = [];

    const today = this.getDate(new Date());
          
    members = members.filter(m => !m.endDate || (new Date(m.endDate) > today || m.endDate.toString() === defaultDate));
    if (!members) { return; }

    members.forEach(
      m => {
        if (!m.isDeleted && m.person) {
          let selectedBenefitIds: number[] = [];
          let selectedBenefits: BenefitModel[] = [];
          // Calculate member join age and current age.
          const joinDate = this.getDate(m.joinDate ? m.joinDate : today);
          const dob = this.getDate(m.person.dateOfBirth);
          const memberAge = this.getMemberAge(dob, today);
          const joinAge = this.getMemberAge(dob, joinDate);
          // Find the benefits already selected for the member
          if (m.benefits && m.benefits.length > 0) {
            selectedBenefits = this.getBenefitsModel(m.benefits);
            selectedBenefitIds = selectedBenefits.map(b => b.benefitId);
          }
          // Load the benefits
          this.benefits.forEach(benefit => {
            if (!this.benefitAlreadyIncluded(m.displayName, memberAge[0], benefit.benefitId)) {
              const selectedBenefit = selectedBenefits.find(b => b.benefitId === benefit.benefitId);
              const roleplayerBenefit = this.getRoleplayerBenefit(benefit, selectedBenefit, m.person, memberAge);
              if (this.isReadOnly) {
                if (selectedBenefit) {
                  this.memberBenefits.push(roleplayerBenefit);
                }
              } else if (this.passesBenefitRules(roleplayerBenefit, memberAge, joinAge)) {
                if (this.coverMemberType === CoverMemberTypeEnum.ExtendedFamily){
                  if (roleplayerBenefit.benefitBaseRateLatest > 0 || roleplayerBenefit.benefitRateLatest > 0){
                    this.memberBenefits.push(roleplayerBenefit);
                  }
                }
                else
                {
                  this.memberBenefits.push(roleplayerBenefit);
                }
              }
            }
          });
          // If there is only one basic benefit, select it
          var basicBenefits = this.memberBenefits.filter(b => b.benefitType === BenefitTypeEnum.Basic);
          if (basicBenefits.length === 1) {
            basicBenefits[0].selected = true;
          }
        }
      }
    );
    // Filter the benefits
    this.enableSelection = true;
    if (this.isReadOnly) {
      this.memberBenefits = this.memberBenefits.filter(b => b.selected);
      this.enableSelection = false;      
    } else if (preventBenefitEdit) {
      this.enableSelection = false;
    }
    // Display the benefits
    this.datasource.getData(this.memberBenefits);
  }

  private getRoleplayerBenefit(benefit: BenefitModel, selectedBenefit: BenefitModel, person: Person, age: any[]): RolePlayerBenefit {
    const rolePlayerBenefit = new RolePlayerBenefit();
    rolePlayerBenefit.id = benefit.benefitId;
    rolePlayerBenefit.name = benefit.benefitName;
    rolePlayerBenefit.benefitName = benefit.benefitName;
    rolePlayerBenefit.code = benefit.benefitCode;
    rolePlayerBenefit.coverMemberType = benefit.coverMemberType;
    rolePlayerBenefit.benefitType = benefit.benefitType;
    rolePlayerBenefit.rolePlayerName = `${person.firstName} ${person.surname}`;
    rolePlayerBenefit.age = age[0];
    rolePlayerBenefit.ageIsYears = age[1];
    rolePlayerBenefit.minAge = benefit.minimumAge;
    rolePlayerBenefit.maxAge = benefit.maximumAge;
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

  private benefitAlreadyIncluded(memberName: string, memberAge: number, benefitId: number): boolean {
    const idx = this.memberBenefits.findIndex((b) => b.id === benefitId && this.namesMatch(b.rolePlayerName, memberName) && b.age === memberAge);
    return idx >= 0;
  }

  private passesBenefitRules(rolePlayerBenefit: RolePlayerBenefit, memberAge: any[], joinAge: any[]): boolean {

    // Subtract one from the minimum age to accommadate "age next birthday" as requested in ASD Ticket 133979
    const minAge = this.isNumber(rolePlayerBenefit.minAge) ? rolePlayerBenefit.minAge - 1 : 0;
    const maxAge = this.isNumber(rolePlayerBenefit.maxAge) ? rolePlayerBenefit.maxAge : 999;

    let testAge = joinAge[1] === true ? joinAge[0] : 0;
    if (testAge >= minAge && testAge <= maxAge) {
      rolePlayerBenefit.age = testAge;
      rolePlayerBenefit.ageIsYears = joinAge[1];
      return true;
    }

    testAge = memberAge[1] === true ? memberAge[0] : 0;
    if (testAge >= minAge && testAge <= maxAge) {
      rolePlayerBenefit.age = testAge;
      rolePlayerBenefit.ageIsYears = memberAge[1];
      return true;
    }

    return false;
  }

  private isNumber(value: any): boolean {
    if (value === null) { return false; }
    if (value === undefined) { return false; }
    if (isNaN(value)) { return false; }
    return Number(value) >= 0;
  }

  private getBenefitsModel(benefits: RolePlayerBenefit[]): BenefitModel[] {
    const list: BenefitModel[] = [];
    for (const benefit of benefits) {
      if (benefit) {
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
    }
    return list;
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

    model.mainMember.policies[0].insuredLives = model.mainMember.policies[0].insuredLives.filter(l => l.rolePlayerTypeId !== rolePlayerTypeId);
    const selectedBenefits = this.memberBenefits.filter(sb => sb.selected);

    members.forEach(
      m => {
        m.benefits = [];
        const memberBenefits = selectedBenefits.filter(mb => this.namesMatch(mb.rolePlayerName, m.displayName));
        memberBenefits.forEach(
          mb => {
            const endDate = m.endDate ? new Date(m.endDate) : null;
            // Add the insured life
            const insuredLife = new PolicyInsuredLife();
            insuredLife.policyId = policyId;
            insuredLife.rolePlayerId = m.rolePlayerId;
            insuredLife.rolePlayerTypeId = rolePlayerTypeId;
            insuredLife.insuredLifeStatus = m.endDate ? InsuredLifeStatusEnum.Cancelled : InsuredLifeStatusEnum.Active;
            insuredLife.statedBenefitId = mb.id;
            insuredLife.startDate = m.joinDate;
            insuredLife.endDate = endDate && endDate.getFullYear() > 0 ? endDate.getCorrectUCTDate() : null;
            model.mainMember.policies[0].insuredLives.push(insuredLife);
            // Add the benefit
            const benefit = this.benefits.find(b => b.benefitId === mb.id);
            let benefitExists: Benefit = null;

            if (model.mainMember.policies &&
              model.mainMember.policies.length > 0 &&
              model.mainMember.policies[0].benefits &&
              model.mainMember.policies[0].benefits.length > 0 &&
              model.mainMember.policies[0].benefits[0]
            ) {
              benefitExists = model.mainMember.policies[0].benefits.find(b => b.id === benefit.benefitId);
            }

            if (!benefitExists) {
              model.mainMember.policies[0].benefits.push(this.getBenefit(benefit));
            }
            m.benefits.push(mb);
          }
        );
      }
    );
    return members;
  }

  private getBenefit(model: BenefitModel): Benefit {
    const benefit = new Benefit();
    benefit.id = model.benefitId;
    benefit.name = model.benefitName;
    benefit.code = model.benefitCode;
    benefit.benefitType = model.benefitType;
    benefit.coverMemberType = model.coverMemberType;
    benefit.statusText = 'Current';
    benefit.benefitRateLatest = model.baseRate;
    benefit.benefitBaseRateLatest = model.benefitAmount;
    benefit.minAge = model.minimumAge;
    benefit.maxAge = model.maximumAge;
    return benefit;
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

  private getDate(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  getBenefitType(id: number): string {
    return BenefitTypeEnum[id];
  }

  getCoverMemberType(id: number): string {
    return CoverMemberTypeEnum[id].replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  updateBenefit(event: any, benefit: RolePlayerBenefit) {
    benefit.selected = event.checked;
    if (event.checked && benefit.benefitType === 1) {
      this.memberBenefits.forEach(
        mb => {
          if (mb.id !== benefit.id && this.namesMatch(mb.rolePlayerName, benefit.rolePlayerName)) {
            if (mb.benefitType === 1 && mb.selected) {
              mb.selected = false;
            }
          }
        }
      );
    }
    this.datasource.dataChange.next(this.memberBenefits);
  }

  private namesMatch(name1: string, name2: string): boolean {
    name1 = name1.toLowerCase().replaceAll('  ', ' ');
    name2 = name2.toLowerCase().replaceAll('  ', ' ');
    return name1 === name2;
  }
}
