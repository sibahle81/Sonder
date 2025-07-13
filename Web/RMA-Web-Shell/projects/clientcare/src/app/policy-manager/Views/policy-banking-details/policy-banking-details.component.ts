import { Component, OnInit } from '@angular/core';
import { RolePlayerBankingDetailComponent } from 'projects/shared-components-lib/src/lib/role-player-banking-detail/role-player-banking-detail.component';
import { WizardComponentInterface } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component.interface';
import { Case } from '../../shared/entities/case';
import { UntypedFormBuilder } from '@angular/forms';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { RolePlayerBankingDetailDataSource } from 'projects/shared-components-lib/src/lib/role-player-banking-detail/role-player-banking-detail.datasource';
import { IntegrationService } from 'projects/shared-services-lib/src/lib/services/integrations.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { CaseType } from 'projects/shared-models-lib/src/lib/enums/case-type.enum';
import { BankingPurposeEnum } from '../../shared/enums/banking-purpose.enum';
import { PaymentMethodEnum } from 'projects/shared-models-lib/src/lib/enums/payment-method-enum';

@Component({
  selector: 'policy-banking-details',
  templateUrl: '../../../../../../shared-components-lib/src/lib/role-player-banking-detail/role-player-banking-detail.component.html'
})

export class PolicyBankingDetailsComponent extends RolePlayerBankingDetailComponent implements WizardComponentInterface, OnInit {
  firstName: string;
  displayName: string;
  step: string;
  singleDataModel = true;
  case: Case;

  constructor(
    formBuilder: UntypedFormBuilder,
    lookupService: LookupService,
    dataSource: RolePlayerBankingDetailDataSource,
    integrationService: IntegrationService,
    alertService: AlertService
  ) {
    super(formBuilder, lookupService, dataSource, integrationService, alertService);
    this.isWizard = true;
  }

  wizardReadFormData(context: WizardContext): Case {
    const caseModel = context.data[0] as Case;
    caseModel.mainMember.rolePlayerBankingDetails = this.rolePlayerBankAccounts;
    if (caseModel.caseTypeId === CaseType.CancelPolicy) {
      const accountForRefund = caseModel.mainMember.rolePlayerBankingDetails.find(c => c.statusText === 'Current');
      if (accountForRefund) {
        accountForRefund.purposeId = BankingPurposeEnum.Payments;
      }
    } else {
      const accountForCollections = caseModel.mainMember.rolePlayerBankingDetails.find(c => c.statusText === 'Current');
      if (accountForCollections) {
        accountForCollections.purposeId = BankingPurposeEnum.Collections;
      }
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
    this.dataSource.clearData();
    this.dataSource.isLoading = false;

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
