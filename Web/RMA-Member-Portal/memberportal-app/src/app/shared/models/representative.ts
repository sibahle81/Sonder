import { BrokerageRepresentative } from "./brokerage-representative";
import { Note } from "./note.model";
import { RepresentativeAddress } from "./representative-address";
import { RepresentativeBankAccount } from "./representative-bank-account";
import { ValidityCheck } from "./validity-check";


export class Representative {
  id: number;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  isDeleted: boolean;

  code: string;
  name: string;
  contactNumber: string;
  email: string;
  idNumber: string;
  idType: number;
  repType: number;
  title: string;
  initials: string;
  firstName: string;
  paymentMethod: number;
  paymentFrequency: number;
  surnameOrCompanyName: string;
  countryOfRegistration: string;
  dateOfBirth: Date;
  medicalAccreditationNo: string;
  dateOfAppointment: Date;
  physicalAddress: RepresentativeAddress;
  activeBrokerage: BrokerageRepresentative;
  brokerageRepresentatives: BrokerageRepresentative[];
  defaultCommissionPercentage: number;
  defaultCommissionPercentageWithholding: number;
  upfrontCommission: boolean;
  representativeChecks: ValidityCheck[];
  representativeNotes: Note[];
  representativeBankAccounts: RepresentativeBankAccount[];
}
