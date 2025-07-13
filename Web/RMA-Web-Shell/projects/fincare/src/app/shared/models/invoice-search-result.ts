import { InvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-type-enum';
import { SourceModuleEnum, SourceProcessEnum } from 'projects/shared-models-lib/src/lib/enums/source-enums';

export class InvoiceSearchResult {
  rolePlayerId: number;
  firstName: string;
  surname: string;
  dateOfBirth: Date;
  idNumber: string;
  isAlive: boolean;
  dateOfDeath: Date;
  deathCertificateNumber: string;
  isVopdVerified: boolean;
  isStudying: boolean;
  isDisabled: boolean;
  cellNumber: string;
  emailAddress: string;
  preferredCommunicationType: string;
  relation: string;
  policyId: number;
  rolePlayerTypeId: number;
  communicationTypeId: number;
  policyNumber: string;
  industryNumber: string;
  employeeNumber: string;
  invoiceId: number;
  invoiceNumber: string;
  invoiceAmount: number;
  invoiceStatus: string;
  invoiceType: InvoiceTypeEnum;
  invoiceBalance: number;
  sourceModuleId: number;
  sourceProcessId: number;
}
