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
  selector: 'app-recipient-information',
  templateUrl: './recipient-information.component.html',
  styleUrls: ['./recipient-information.component.css']
})
export class RecipientInformationComponent extends WizardDetailBaseComponent<InitiatePensionCaseData> implements OnInit {
  
  @Input() isWizard: boolean = true;

  viewFormDetailEnabled: boolean;
  recipients: Person[] = [];
  addPersonMode: boolean;
  benefitType: string;
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
    this.subscription = this.pensCareService.updateRecipientModelEmmited$.subscribe(model => {
      this.model = model;
      this.pensCareService.setRecipients(this.model.recipients);
    });
  }

  createForm(id: number): void {}

  onLoadLookups(): void {}

  populateModel(): void {
    this.pensCareService.emitUpdateRecipientModel(this.model);
  }

  populateForm(): void {
    if (this.model && this.model['recipients']) {
      this.recipients = this.model['recipients'].map((recipient, index) => {
        const newRecipient = recipient;
        newRecipient.index = index;
        newRecipient.familyUnit = index;
        if (recipient.language == 0) {
          newRecipient.language = LanguageEnum.None ? LanguageEnum.English : newRecipient.language;
        }
        return newRecipient;
      });
      if (this.model.pensionCase) {
        this.benefitType = BenefitTypeEnum[this.model.pensionCase.benefitType];
      }
      const model = this.model;
      model.recipients = this.recipients;
      this.pensCareService.emitUpdateRecipientModel(model);
    }
    this.formLoaded = true;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  onViewFormDetailEnabled(viewFormDetailEnabled: boolean): void {
    this.viewFormDetailEnabled = viewFormDetailEnabled;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
