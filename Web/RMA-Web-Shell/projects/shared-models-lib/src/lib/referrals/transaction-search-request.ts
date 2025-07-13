import { TransactionTypeEnum } from "projects/fincare/src/app/shared/enum/transactionTypeEnum";
import { PagedRequest } from "../pagination/PagedRequest";

export class TransactionSearchRequest {

    rolePlayerId: number;
    startDate: Date;
    endDate: Date;
    transactionType: TransactionTypeEnum;

    pagedRequest: PagedRequest;
}
