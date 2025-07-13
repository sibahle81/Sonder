import { BenefitRate } from "./benefit-benefitRate";
import { Note } from "./note.model";
import { RuleItem } from "./ruleItem";


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
  earningsType: number;
  coverMemberType: number;
  startDate: Date;
  endDate: Date;

  ruleItems: RuleItem[];
  benefitRates: BenefitRate[];
  benefitNotes: Note[];

  beneficiaryTypeIds: number[];
  earningTypeIds: number[];
  medicalReportTypeIds: number[];

  // model binding
  selected: boolean;
  statusText: string;
  benefitRateLatest: number; // premium
  benefitBaseRateLatest: number; // premium

  // age range
  minAge = 0;
  maxAge = 999;
}
