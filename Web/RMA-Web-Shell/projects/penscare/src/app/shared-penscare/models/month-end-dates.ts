import { MonthEnum } from 'projects/shared-models-lib/src/lib/enums/month.enum';
import { MonthEndRunStatusEnum } from '../enums/mont-end-run-status-enum';

export class MonthEndDates {
  monthEndRunDateId: number;
  month: MonthEnum;
  authorizationCloseOfDate: Date;
  authorizationCloseOfTime?: string;
  monthEndCloseOfDate: Date;
  monthEndCloseOfTime?: string;
  paymentDate: Date;
  paymentTime?: string;
  monthEndBalanceAndReleaseDate: Date;
  monthEndBalanceAndReleaseTime?: string;
  pacsCreateDate: Date;
  pacsCreateTime?: string;
  pacsStrikeDate: Date;
  pacsStrikeTime?: string;
  year: number;
  startDate?: Date;
  toDate?: Date;
  monthEndRunStatus: MonthEndRunStatusEnum;
}
