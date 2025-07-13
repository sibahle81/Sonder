import { BenefitPayroll } from "./benefit-payroll";

export class GroupRiskBenefitPayroll {
    public rolePlayerId: number;
    public benefitPayrolls: BenefitPayroll[];
    public groupRiskNotes: number[];
  
    constructor() {
      this.benefitPayrolls = [];
      this.groupRiskNotes = [];
    }
  }