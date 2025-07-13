import { Component, ViewChild } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Case } from '../../shared/entities/case';
import { ProductOption } from '../../../product-manager/models/product-option';
import { Person } from '../../shared/entities/person';
import { Product } from '../../../product-manager/models/product';
import { CoverMemberTypeEnum } from 'projects/shared-models-lib/src/lib/enums/cover-member-type-enum';
import { PersonDetailsComponent } from '../person-details/person-details.component';
import { GroupMemberDetailsComponent } from '../group-members-details/group-member-details.component';
import { PolicyProductOptionsComponent } from '../policy-product-options/policy-product-options.component';
import { PolicyBenefitsComponent } from '../policy-benefits/policy-benefits.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';

@Component({
  selector: 'policy-info-main-member',
  templateUrl: './policy-info-main-member.component.html',
  styleUrls: ['./policy-info-main-member.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class PolicyInfoMainMemberComponent extends WizardDetailBaseComponent<Case> {

  productOptions: ProductOption[] = [];
  person: Person;
  products: Product[];
  selectedProductOption: ProductOption;
  product: Product;
  detailsModel: Case;
  isGroup = false;
  coverMemberType = CoverMemberTypeEnum.MainMember;
  mainMemberAge: number;
  isReadOnly: boolean;

  roleplayerContext: RolePlayerTypeEnum[] = [RolePlayerTypeEnum.MainMemberSelf];

  @ViewChild(PersonDetailsComponent, { static: false }) personalDetailsComponent: PersonDetailsComponent;
  @ViewChild(GroupMemberDetailsComponent, { static: false }) groupMemberDetailsComponent: GroupMemberDetailsComponent;
  @ViewChild(PolicyProductOptionsComponent, { static: false }) policyProductOptionsComponent: PolicyProductOptionsComponent;
  @ViewChild(PolicyBenefitsComponent, { static: true }) mainMemberBenefitsComponent: PolicyBenefitsComponent;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups() { }
  createForm() { }

  populateForm() {
    if (this.model) {
      if (this.model.mainMember.rolePlayerIdentificationType !== RolePlayerIdentificationTypeEnum.Person) {
        this.isGroup = true;
      } else {
        this.isGroup = false;
        this.patchNonGroupValues();
      }
      this.detailsModel = this.model;
      this.mainMemberBenefitsComponent.isReadOnly = this.isDisabled;
      this.mainMemberBenefitsComponent.populateForm(this.model);
      this.setSelectedPolicyBenefits();
    }
    if (this.isDisabled) {
      if (this.policyProductOptionsComponent) {
        if (this.policyProductOptionsComponent.formProducts) {
          this.policyProductOptionsComponent.formProducts.disable();
        }
      }
      if (this.personalDetailsComponent) {
        if (this.personalDetailsComponent.form) {
          this.personalDetailsComponent.form.disable();
        }
      }
      this.mainMemberBenefitsComponent.disable();
    }
  }

  populateModel() {
    return null;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  onAgeChanged(age: number) {
    if (this.mainMemberBenefitsComponent) {
      this.mainMemberBenefitsComponent.mainMemberAge = age;
      if (this.selectedProductOption) {
        this.mainMemberBenefitsComponent.getData(this.selectedProductOption);
      } else if (this.model.mainMember.policies && this.model.mainMember.policies.length > 0 &&
        this.model.mainMember.policies[0].productOption) {
        this.mainMemberBenefitsComponent.getData(this.model.mainMember.policies[0].productOption);
      }
    }
  }
  patchNonGroupValues() {
    if (this.model.mainMember) {
      if (this.model.mainMember.person) {
        this.model.mainMember.person.isAlive = true;
      }
    }
  }

  setSelectedPolicyBenefits() {
    this.selectedProductOption = this.model.mainMember.policies[0].productOption;
    this.mainMemberBenefitsComponent.onSelectedOptionChanged(this.selectedProductOption);
  }
}
