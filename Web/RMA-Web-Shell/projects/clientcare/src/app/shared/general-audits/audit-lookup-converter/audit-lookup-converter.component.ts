import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RolePlayerPolicyTransactionStatusEnum } from '../../../policy-manager/shared/enums/role-player-policy-transaction-status.enum';
import { RolePlayerPolicyDeclarationStatusEnum } from '../../../policy-manager/shared/enums/role-player-policy-declaration-status.enum';
import { RolePlayerPolicyDeclarationTypeEnum } from '../../../policy-manager/shared/enums/role-player-policy-declaration-type.enum';
import { BehaviorSubject } from 'rxjs';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';
import { AddressTypeEnum } from 'projects/shared-models-lib/src/lib/enums/address-type-enum';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { CategoryInsuredEnum } from '../../../policy-manager/shared/enums/categoryInsuredEnum';
import { PaymentFrequencyEnum } from 'projects/shared-models-lib/src/lib/enums/payment-frequency.enum';
import { PaymentMethodEnum } from 'projects/shared-models-lib/src/lib/enums/payment-method-enum';
import { PolicyStatusEnum } from '../../../policy-manager/shared/enums/policy-status.enum';
import { PolicyCancelReasonEnum } from '../../../policy-manager/shared/enums/policy-cancel-reason.enum';
import { RolePlayerBenefitWaitingPeriodEnum } from '../../../policy-manager/shared/enums/roleplayer-benefit-waiting-period.enum';
import { ClientTypeEnum } from '../../../policy-manager/shared/enums/client-type-enum';
import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { ContactDesignationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-designation-type-enum';
import { CompanyIdTypeEnum } from 'projects/shared-models-lib/src/lib/enums/company-id-type-enum';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { CompanyLevelEnum } from 'projects/shared-models-lib/src/lib/enums/company-level-enum';
import { UserCompanyMapStatusEnum } from 'projects/shared-models-lib/src/lib/enums/user-company-map-status-enum';
import { QuoteStatusEnum } from '../../../policy-manager/shared/enums/quote-status.enum';
import { LeadClientStatusEnum } from '../../../policy-manager/shared/enums/leadClientStatusEnum';
import { LeadSourceEnum } from 'projects/shared-models-lib/src/lib/enums/lead-source.enum';
import { GenderEnum } from 'projects/shared-models-lib/src/lib/enums/gender-enum';
import { IdTypeEnum } from '../../../policy-manager/shared/enums/idTypeEnum';
import { TitleEnum } from 'projects/shared-models-lib/src/lib/enums/title-enum';
import { MarriageTypeEnum } from 'projects/shared-models-lib/src/lib/enums/marriage-type-num';
import { MaritalStatusEnum } from 'projects/shared-models-lib/src/lib/enums/marital-status-enum';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { PersonEventStatusEnum } from 'projects/shared-models-lib/src/lib/enums/person-event-status.enum';
import { ClaimTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';
import { SuspiciousTransactionStatusEnum } from 'projects/shared-models-lib/src/lib/enums/suspicious-transaction-status-enum';

@Component({
  selector: 'audit-lookup-converter',
  templateUrl: './audit-lookup-converter.component.html',
  styleUrls: ['./audit-lookup-converter.component.css']
})
export class AuditLookupConverterComponent implements OnChanges {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @Input() propertyName: string;
  @Input() propertyValue: string;

  convertedPropertyValue: string;

  // lookups that are not enums
  designationTypes: Lookup[];

  constructor(
    private readonly lookupService: LookupService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.propertyName && this.propertyValue && this.propertyValue != '[]') {
      this.isLoading$.next(true);
      this.convert();
    }
  }

  convert() { // ENUMS/LOOKUPS MUST BE CATERED FOR IN THIS FUNCTION TO BE CONVERTED ON THE AUDIT DISPLAY
    switch (this.propertyName) {
      case 'RolePlayerPolicyTransactionStatus': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = RolePlayerPolicyTransactionStatusEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'RolePlayerPolicyDeclarationStatus': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = RolePlayerPolicyDeclarationStatusEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'RolePlayerPolicyDeclarationType': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = RolePlayerPolicyDeclarationTypeEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'BankAccountType': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = BankAccountTypeEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'AddressType': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = AddressTypeEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'DocumentStatus': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = DocumentStatusEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'CategoryInsured': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = CategoryInsuredEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'PaymentFrequency': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = PaymentFrequencyEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'PaymentMethod': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = PaymentMethodEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'PolicyStatus': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = PolicyStatusEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'PolicyCancelReason': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = PolicyCancelReasonEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'RolePlayerIdentificationTypeEnum': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = RolePlayerIdentificationTypeEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'RolePlayerBenefitWaitingPeriod': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = RolePlayerBenefitWaitingPeriodEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'ClientType': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = ClientTypeEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'CommunicationType': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = CommunicationTypeEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'ContactDesignationType': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = ContactDesignationTypeEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'CompanyIdType': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = CompanyIdTypeEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'IndustryClass': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = IndustryClassEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'CompanyLevel': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = CompanyLevelEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'UserCompanyMapStatus': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = UserCompanyMapStatusEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'QuoteStatus': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = QuoteStatusEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'LeadClientStatus': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = LeadClientStatusEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'LeadSource': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = LeadSourceEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'Gender': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = GenderEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'IdType': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = IdTypeEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'Title': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = TitleEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'MarriageType': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = MarriageTypeEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'MaritalStatus': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = MaritalStatusEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'MaritalStatus': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = MaritalStatusEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'TransactionType': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = TransactionTypeEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'TotalAmount': {
        this.convertedPropertyValue = (Math.round(+(this.propertyValue.replace(',', '.')) * 100) / 100).toFixed(2);
        this.isLoading$.next(false);
        break;
      }

      case 'ClaimStatus': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = ClaimStatusEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'ClaimType': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = ClaimTypeEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'ClaimLiabilityStatus': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = ClaimLiabilityStatusEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'DesignationTypeId': {
        this.getDesignationTypes();
        break;
      }

      case 'InvoiceStatus': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = InvoiceStatusEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'PayeeTypeId': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = PayeeTypeEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'WorkPool': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = WorkPoolEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'PersonEventStatus': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = PersonEventStatusEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'SuspiciousTransactionStatus': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = SuspiciousTransactionStatusEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }
      
      default: {
        this.convertedPropertyValue = this.propertyName.toLowerCase().includes('premium') ? (Math.round(+(this.propertyValue.replace(',', '.')) * 100) / 100).toFixed(2) : this.propertyValue;
        this.isLoading$.next(false);
        break;
      }
    }
  }

  formatText(text: string) {
    if (!text) { return 'N/A'; }
    const status = text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, '$1').trim();
    return status.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
  }

  getDesignationTypes() {
    this.lookupService.getDesignationTypes('').subscribe(results => {
      this.designationTypes = results;
      const value = this.designationTypes.find(s => s.id == +this.propertyValue);
      this.convertedPropertyValue = value && value.name ? this.formatText(value.name) : 'N/A';
      this.isLoading$.next(false);
    });
  }
}
