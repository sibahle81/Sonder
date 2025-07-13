import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { WizardComponentInterface } from 'src/app/shared/components/wizard/sdk/wizard-component.interface';
import { ValidationResult } from 'src/app/shared/components/wizard/shared/models/validation-result';
import { WizardContext } from 'src/app/shared/components/wizard/shared/models/wizard-context';
import { BankingPurposeEnum } from 'src/app/shared/enums/banking-purpose.enum';
import { PaymentMethodEnum } from 'src/app/shared/enums/payment-method-enum';
import { Case } from 'src/app/shared/models/case';
import { AlertService } from 'src/app/shared/services/alert.service';
import { IntegrationService } from 'src/app/shared/services/integrations.service';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { RolePlayerBankingDetailComponent } from '../role-player-banking-detail/role-player-banking-detail.component';

@Component({
  selector: 'policy-banking-details',
  templateUrl: '../role-player-banking-detail/role-player-banking-detail.component.html'
})

export class PolicyBankingDetailsComponent extends RolePlayerBankingDetailComponent implements WizardComponentInterface, OnInit {
  firstName: string;
  displayName: string;
  step: string;
  singleDataModel = true;
  case: Case;

  constructor(
    formBuilder: FormBuilder,
    lookupService: LookupService,
    integrationService: IntegrationService,
    alertService: AlertService
  ) {
    super(formBuilder, lookupService, integrationService, alertService);
    this.isWizard = true;
  }

  wizardReadFormData(context: WizardContext): Case {
    const caseModel = context.data[0] as Case;
    caseModel.mainMember.rolePlayerBankingDetails = this.rolePlayerBankAccounts;

    const accountForCollections = caseModel.mainMember.rolePlayerBankingDetails.find(c => c.statusText === 'Current');
    if (accountForCollections) {
      accountForCollections.purposeId = BankingPurposeEnum.collections;
    }
    this.case = caseModel;
    return caseModel;
  }

  wizardPopulateForm(context: WizardContext): void {
    this.case = context.data[0] as Case;
    if (!this.case.mainMember.company) {
      this.idNumber = this.case.mainMember.person.idNumber;
    } else {
      this.idNumber = this.case.mainMember.company.companyRegNo;
    }
    this.isLoading$.next(false);

    if (this.case !== null && this.case.mainMember != null && this.case.mainMember.rolePlayerBankingDetails != null &&
      this.case.mainMember.rolePlayerBankingDetails.length > 0) {
      this.rolePlayerBankAccounts = this.case.mainMember.rolePlayerBankingDetails;
      this.getData();
    }
  }

  wizardValidateForm(context: WizardContext): ValidationResult {
    this.wizardPopulateForm(context);
    this.displayName = 'Banking Details';
    const validationResult = new ValidationResult(this.displayName);
    const caseModel = context.data[0] as Case;

    if (caseModel.mainMember && caseModel.mainMember.policies && caseModel.mainMember.policies.length > 0 && caseModel.mainMember.policies[0].paymentMethod) {
      if ((caseModel.mainMember.policies[0].paymentMethod === PaymentMethodEnum.DebitOrder as number) && (!caseModel.mainMember.policies[0].parentPolicyId || caseModel.mainMember.policies[0].parentPolicyId == null)) {
        if (!caseModel.mainMember.rolePlayerBankingDetails || caseModel.mainMember.rolePlayerBankingDetails.length === 0) {
          validationResult.errorMessages.push('At least one bank account is required when chosen payment method is debit order');
          validationResult.errors = validationResult.errorMessages.length;
        } else {
          validationResult.errorMessages = [];
          validationResult.errors = validationResult.errors === 0 ? 0 : validationResult.errors--;
        }
      }
    }

    return validationResult;
  }
}
