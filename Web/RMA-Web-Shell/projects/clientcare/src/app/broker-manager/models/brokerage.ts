import { BrokerageTypeEnum } from './../../../../../shared-models-lib/src/lib/enums/brokerage-type-enum';
import { BrokerageBankAccount } from './brokerage-bank-account';
import { BankAccount } from './bank-account';
import { Bank } from '../../../../../shared-models-lib/src/lib/lookup/bank';
import { BankAccountType } from '../../../../../shared-models-lib/src/lib/lookup/bank-account-type';
import { ProductOption } from '../../product-manager/models/product-option';
import { Representative } from './representative';
import { BrokerageContact } from './brokerage-contact';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { BrokerageCategory } from '../../product-manager/models/brokerage-category';
import { BrokerConsultant } from './broker-consultant';
import { BrokerageAddress } from './brokerage-address';
import { ValidityCheckSet } from 'projects/shared-models-lib/src/lib/common/validity-checkset';
import { ValidityCheck } from 'projects/shared-models-lib/src/lib/common/validity-check';
import { BrokerageProductOption } from './brokerage-product-option';
import { OrganisationOptionItemValue } from './organisation-option-item-value';

export class Brokerage {
  id: number;
  createdBy: string;
  modifiedBy: string;
  createdDate: Date;
  modifiedDate: Date;
  isDeleted: boolean;

  code: string;
  name: string;
  fspNumber: string;
  defaultCommissionPercentage: number;
  defaultCommissionPercentageWithholding: number;
  paymentMethod: number;
  paymentFrequency: number;
  brokerageTypeId: number;
  brokerHouseTypeId: number;
  startDate: Date; // RMA Contract Start Date
  endDate: Date; // RMA Contract End Date
  fspWebsite: string;
  telNo: string;
  faxNo: string;
  faxNoCode: string;
  finYearEnd: string;
  legalCapacity: string;
  medicalAccreditationNo: string;
  referenceNumber: string;
  registrationNumber: string;
  status: string;
  isActive: boolean;
  tradeName: string;
  regNo: string;
  companyType: string;
  vatRegistrationNumber: string;
  ficaVerified: boolean;
  ficaRiskRating: string;

  brokerageType : BrokerageTypeEnum;

  representatives: Representative[];
  soleProprietors: Representative[];
  keyIndividuals: Representative[];
  categories: BrokerageCategory[];
  brokerageProductOptions: BrokerageProductOption[];
  productOptionsIds: number[];
  addresses: BrokerageAddress[];

  brokerageBankAccounts: BrokerageBankAccount[];
  contacts: BrokerageContact[];
  brokerageBrokerConsultants: BrokerConsultant[];
  brokerageBrokerConsultantIds: number[];
  brokerageNotes: Note[];

  brokerageChecks: ValidityCheck[];

  organisationOptionItemValues: OrganisationOptionItemValue[];

  // Obsolete?
  bankAccount: BankAccount;
  bankAccountId: number;
  bank: Bank;
  bankAccountType: BankAccountType;
  bankAccountTypeId: number;
  statusText: string;
  isAuthorised: boolean;
}
