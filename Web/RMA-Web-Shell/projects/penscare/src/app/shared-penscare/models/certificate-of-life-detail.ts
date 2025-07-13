import { IdTypeEnum } from "projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum";
import { CertificateOfLifeStatusEnum } from "projects/shared-models-lib/src/lib/enums/certificate-of-life-status-enum";
import { CommunicationTypeEnum } from "projects/shared-models-lib/src/lib/enums/communication-type-enum";
import { PensionLedgerStatusEnum } from "projects/shared-models-lib/src/lib/enums/pension-ledger-status.enum";

export class CertificateOfLifeDetail {
  pensionCaseNumber: string;
  pensionCaseId: number;
  name: string;
  surname: string;
  dateOfBirth: string;
  idNumber: string;
  idType: IdTypeEnum;
  expiryDate: Date;
  recipientId: number;
  beneficiaryId: number;
  pensionClaimMapId: number;
  ledgerStatusId: PensionLedgerStatusEnum;
  emailAddress: string;
  contactNumber: string;
  communicationTypeId: CommunicationTypeEnum;
  rolePlayerId: number;
  isRecipient?: boolean;
  industryNumber: string;
  certificateOfLifeStatus: CertificateOfLifeStatusEnum;
  processedDate: Date;
  benefitCode: string;
}
