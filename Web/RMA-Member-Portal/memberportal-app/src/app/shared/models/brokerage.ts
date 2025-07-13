import { Bank } from "./bank";
import { BankAccount } from "./bank-account";
import { BankAccountType } from "./bank-account-type";
import { BrokerConsultant } from "./broker-consultant";
import { BrokerageAddress } from "./brokerage-address";
import { BrokerageBankAccount } from "./brokerage-bank-account";
import { BrokerageCategory } from "./brokerage-category";
import { BrokerageContact } from "./brokerage-contact";
import { BrokerageProductOption } from "./brokerage-product-option";
import { Note } from "./note.model";
import { Representative } from "./representative";
import { ValidityCheck } from "./validity-check";


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
  startDate: Date;
  endDate: Date;
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

  // Obsolete?
  bankAccount: BankAccount;
  bankAccountId: number;
  bank: Bank;
  bankAccountType: BankAccountType;
  bankAccountTypeId: number;
  statusText: string;
  isAuthorised: boolean;
}
