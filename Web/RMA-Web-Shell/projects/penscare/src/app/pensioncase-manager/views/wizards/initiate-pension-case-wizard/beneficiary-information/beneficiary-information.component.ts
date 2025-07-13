import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LanguageEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/language-enum';
import { PensCareService } from 'projects/penscare/src/app/pensioncase-manager/services/penscare.service';
import { Person } from 'projects/shared-components-lib/src/lib/models/person.model';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { BenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/benefit-type-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Subscription } from 'rxjs';
import { InitiatePensionCaseData } from '../../../../../shared-penscare/models/initiate-pensioncase-data.model';

@Component({
  selector: 'app-beneficiary-information',
  templateUrl: './beneficiary-information.component.html',
  styleUrls: ['./beneficiary-information.component.css']
})
export class BeneficiaryInformationComponent extends WizardDetailBaseComponent<InitiatePensionCaseData> implements OnInit {

  @Input() isWizard: boolean = true;
  
  viewFormDetailEnabled: boolean;
  beneficiaries: Person[] = [];
  addPersonMode: boolean;
  benefitType = "";
  formLoaded: boolean;
  subscription: Subscription;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private pensCareService: PensCareService) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    this.subscription = this.pensCareService.updateBeneficiaryModelEmmited$.subscribe(model => {
      this.model = model;
      this.pensCareService.setBeneficiaries(this.model.beneficiaries);
    });
  }

  createForm(id: number): void { }
  onLoadLookups(): void {}

  populateModel(): void {
    this.pensCareService.emitUpdateBeneficiaryModel(this.model);
  }

  populateForm(): void {
    let beneficiaries: Person[] = [];

    if (this.model && this.model.beneficiaries) {
      beneficiaries = this.model.beneficiaries.map((beneficiary, index) => {
        const newBeneficiary = beneficiary;
        newBeneficiary.index = index;
        newBeneficiary.language = LanguageEnum.None ? LanguageEnum.English : newBeneficiary.language;
        return newBeneficiary;
      });
      if (this.model.pensionCase) {
        this.benefitType = BenefitTypeEnum[this.model.pensionCase.benefitType];
      }
    }

    this.beneficiaries = beneficiaries;
    const model = this.model;
    model.beneficiaries = this.beneficiaries;
    this.pensCareService.emitUpdateBeneficiaryModel(model);

    this.formLoaded = true;
  }

  isPensionerInBeneficiaryList() {
    const isPensionerInBeneficiaryList = this.model.beneficiaries.find(beneficiary => beneficiary.idNumber === this.model.pensioner.idNumber) !== undefined;
    return isPensionerInBeneficiaryList;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
