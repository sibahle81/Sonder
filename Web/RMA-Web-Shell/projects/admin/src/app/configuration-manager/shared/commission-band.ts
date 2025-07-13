import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class CommissionBand extends BaseClass {
  commissionBandId: number;
  commissionBandName: string;
  minSalaryBand: number;
  maxSalaryBand: number;
  commissionRate: number;
}