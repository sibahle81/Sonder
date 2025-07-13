import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class ForecastRate extends BaseClass {
  forecastRateId: number;
  forecastRate: number;
  productId: number;
  effectiveFrom: Date;
  effectiveTo: Date;
  createdDate: Date;
}
