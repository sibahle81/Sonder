import { BrokerageRepresentative } from './brokerage-representative';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { RepresentativeAddress } from './representative-address';
import { ValidityCheck } from 'projects/shared-models-lib/src/lib/common/validity-check';
import { RepresentativeBankAccount } from './representative-bank-account';
import { RepresentativeTypeEnum } from 'projects/shared-models-lib/src/lib/enums/representative-type-enum';
import { IdTypeEnum } from '../../policy-manager/shared/enums/idTypeEnum';

export class Representative {
  id: number;

  code: string;
  name: string;
  contactNumber: string;
  email: string;
  idNumber: string;
  idType: IdTypeEnum;
  repType: RepresentativeTypeEnum;
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

  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  isDeleted: boolean;

  isLinked?: boolean;
  hashId?: string = null;
}
