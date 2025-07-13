import { PensionLedger } from "projects/shared-components-lib/src/lib/models/pension-ledger.model";
import { Commutation } from "./commutation.model";


export class CommutationNotification {
    action: string;
    firstName: string;
    lastName: string;
    amountRequested?: number;
    commutation?: Commutation;
    ledger: PensionLedger;
}
