import { MonthEnum } from "../../../../../shared-models-lib/src/lib/enums/month.enum";
import { PagedRequest } from "../../../../../shared-models-lib/src/lib/pagination/PagedRequest";
import { MonthEndRunStatusEnum } from "../enums/mont-end-run-status-enum";

export class MonthEndRunDateSearchRequest {
  runYear?: number;
  runMonth?: MonthEnum;
  monthEndRunStatus?: MonthEndRunStatusEnum;
  monthEndRunDateId?: number;
  pensionCaseId?: number;
  pagedRequest: PagedRequest;
}
