import { BenefitRate } from './benefit-benefitRate';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { RuleItem } from 'projects/shared-models-lib/src/lib/common/ruleItem';
import { DisabilityBenefitTermEnum } from './disability-benefit-term.enum';
import { BenefitAddBeneficiary } from './benefit-add-beneficiary';
import { BenefitCaptureEarning } from './benefit-capture-earning';
import { BenefitCompensationAmount } from './benefit-compensation-amount';
import { BenefitCoverMemberType } from './benefit-cover-member-type';
import { BenefitMedicalReportRequired } from './benefit-medical-report-required';
import { BenefitGroupEnum } from './benefit-group.enum';

export class Benefit {
  constructor() {
    this.ruleItems = [];
  }

  id: number;
  createdBy: string;
  modifiedBy: string;
  createdDate: Date;
  modifiedDate: Date;
  isDeleted: boolean;

  name: string;
  code: string;

  productStatus: number;
  productClass: number;
  productId: number;
  benefitType: number;
  coverMemberType: number;
  startDate: Date;
  endDate: Date;

  ruleItems: RuleItem[];
  benefitRates: BenefitRate[];
  benefitNotes: Note[];

  beneficiaryTypeIds: number[];
  earningTypeIds: number[];
  medicalReportTypeIds: number[];
  productOptionIds: number[];
  estimateTypeId: number;
  disabilityBenefitTerm: DisabilityBenefitTermEnum;
  benefitGroup: BenefitGroupEnum;

  // model binding
  selected: boolean;
  statusText: string;
  benefitRateLatest: number; // premium
  benefitBaseRateLatest: number; // premium

  // age range
  minAge = 0;
  maxAge = 999;

  excessAmount?: number;

  minCompensationAmount: number;
  maxCompensationAmount: number;

  benefitAddBeneficiaries: BenefitAddBeneficiary[];
  benefitCaptureEarnings: BenefitCaptureEarning[];
  benefitCompensationAmounts: BenefitCompensationAmount[];
  benefitCoverMemberTypes: BenefitCoverMemberType[];
  benefitMedicalReportRequireds: BenefitMedicalReportRequired[];
}
