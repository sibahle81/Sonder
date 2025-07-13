import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AddressTypeEnum } from 'src/app/shared/enums/address-type.enum';
import { BankAccountTypeEnum } from 'src/app/shared/enums/bank-account-type-enum';
import { CategoryInsuredEnum } from 'src/app/shared/enums/categoryInsuredEnum';
import { ClaimLiabilityStatusEnum } from 'src/app/shared/enums/claim-liability-status.enum';
import { ClaimStatusEnum } from 'src/app/shared/enums/claim-status.enum';
import { ClaimTypeEnum } from 'src/app/shared/enums/claim-type-enum';
import { ClientTypeEnum } from 'src/app/shared/enums/client-type-enum';
import { CommunicationTypeEnum } from 'src/app/shared/enums/communication-type.enum';
import { CompanyIdTypeEnum } from 'src/app/shared/enums/company-id-type-enum';
import { CompanyLevelEnum } from 'src/app/shared/enums/company-level-enum';
import { ContactDesignationTypeEnum } from 'src/app/shared/enums/contact-designation-type-enum';
import { DocumentStatusEnum } from 'src/app/shared/enums/document-status.enum';
import { GenderEnum } from 'src/app/shared/enums/gender-enum';
import { IdTypeEnum } from 'src/app/shared/enums/id-type.enum';
import { IndustryClassEnum } from 'src/app/shared/enums/industry-class.enum';
import { InvoiceStatusEnum } from 'src/app/shared/enums/invoice-status-enum';
import { LeadSourceEnum } from 'src/app/shared/enums/lead-source.enum';
import { LeadClientStatusEnum } from 'src/app/shared/enums/leadClientStatusEnum';
import { MaritalStatusEnum } from 'src/app/shared/enums/marital-status-enum';
import { MarriageTypeEnum } from 'src/app/shared/enums/marriage-type-num';
import { PayeeTypeEnum } from 'src/app/shared/enums/payee-type.enum';
import { PaymentFrequencyEnum } from 'src/app/shared/enums/payment-frequency.enum';
import { PaymentMethodEnum } from 'src/app/shared/enums/payment-method-enum';
import { PersonEventStatusEnum } from 'src/app/shared/enums/person-event-status.enum';
import { PolicyCancelReasonEnum } from 'src/app/shared/enums/policy-cancel-reason.enum';
import { PolicyStatus } from 'src/app/shared/enums/policy-status.enum';

import { QuoteStatusEnum } from 'src/app/shared/enums/quote-status.enum';
import { RolePlayerPolicyDeclarationStatusEnum } from 'src/app/shared/enums/role-player-policy-declaration-status.enum';
import { RolePlayerPolicyDeclarationTypeEnum } from 'src/app/shared/enums/role-player-policy-declaration-type.enum';
import { RolePlayerPolicyTransactionStatusEnum } from 'src/app/shared/enums/role-player-policy-transaction-status.enum';
import { RolePlayerBenefitWaitingPeriodEnum } from 'src/app/shared/enums/roleplayer-benefit-waiting-period.enum';
import { RolePlayerIdentificationType } from 'src/app/shared/enums/roleplayer-identification-type-enum';
import { SuspiciousTransactionStatusEnum } from 'src/app/shared/enums/suspicious-transaction-status-enum';
import { TitleEnum } from 'src/app/shared/enums/title-enum';
import { TransactionTypeEnum } from 'src/app/shared/enums/transactionTypeEnum';
import { UserCompanyMapStatusEnum } from 'src/app/shared/enums/user-company-map-status-enum';
import { WorkPoolEnum } from 'src/app/shared/enums/work-pool-enum';
import { Lookup } from 'src/app/shared/models/lookup.model';
import { LookupService } from 'src/app/shared/services/lookup.service';

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
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = PolicyStatus[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'PolicyCancelReason': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = PolicyCancelReasonEnum[+this.propertyValue]) : 'N/A';
        this.isLoading$.next(false);
        break;
      }

      case 'RolePlayerIdentificationTypeEnum': {
        this.convertedPropertyValue = this.propertyValue ? this.formatText(this.convertedPropertyValue = RolePlayerIdentificationType[+this.propertyValue]) : 'N/A';
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
