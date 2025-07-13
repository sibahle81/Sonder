import { DebtorStatusEnum } from '../enum/debtor-status.enum';

export class FinPayee {
    rolePlayerId: number;
    finPayeNumber: string;
    isAuthorised: boolean;
    industryId: number;
    authroisedBy: string;
    authorisedDate: Date;
    debtorStatus?: DebtorStatusEnum;
}
