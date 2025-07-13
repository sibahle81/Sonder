import { StatusType } from 'projects/claimcare/src/app/claim-manager/shared/enums/status.enum';
import { BenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/benefit-type-enum';
import { PensionLedgerStatusEnum } from 'projects/shared-models-lib/src/lib/enums/pension-ledger-status.enum';
import { Person } from './person.model';

export class PensionLedgerResponse {
  pensionLedgerList: PensionLedger[]
}

export class PensionLedgerRequest {
  recipients : Person[];
  beneficiaries : Person[];
}

export class PensionLedger {
  public beneficiaryIdNumber: string;
  public beneficiaryFirstName: string;
  public beneficiarySurname: string;
  public recipientFirstName: string;
  public recipientSurname: string;
  public claimReferenceNumber: string;
  public dateOfAccident: Date;
  public dateOfStabilisation: Date;
  public productOptionName: string;
  public benefitCode: string;
  public benefitId: number;
  public productClassName: string;
  public legislative: string;
  public status: PensionLedgerStatusEnum;
  public statusName: string;
  public normalMonthlyPension: number;
  public capitalValue: number;
  public currentMonthlyPension: number;
  public currentMonthlyPensionPaye: number;
  public currentMonthlyPensionExcludingTax: number;
  public normalMonthlyPensionPaye: number;
  public normalMonthlyPensionPayeExcludingTax: number;
  public additionalTax: number;
  public beneficiaryType: number;
  public beneficiaryAge: number;
  public earnings: number;
  public earningsAllocation: number;
  public beneficiaryPercentage: number;
  public av: number;
  public increasesPerYear: IncreasePerYer[];
  public ageAtDateOfStabilization: number;
  public productCode: string;
  public pensionCaseNumber: string;
  public benefitType: BenefitTypeEnum;
  public industryNumber: string;
  public modifiedDate: Date;
  public pensionCaseId: number;
  public reason: number;
  public id?: number;
  public statusDescription: string;
}

export class IncreasePerYer {
  public year: number;
  public increasePercentage: number;
  public amount: number;
}

