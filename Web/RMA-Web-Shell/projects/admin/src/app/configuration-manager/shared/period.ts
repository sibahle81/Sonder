import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class Period extends BaseClass {
  status: string;
  startDate: Date;
  endDate: Date;
}
