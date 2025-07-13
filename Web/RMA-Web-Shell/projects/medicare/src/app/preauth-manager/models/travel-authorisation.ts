import { BaseClass } from "projects/shared-models-lib/src/lib/common/base-class";

export class TravelAuthorisation extends BaseClass {
    travelAuthorisationId: number;
    personEventId: number;
    travelAuthorisedParty: number;
    dateAuthorisedFrom: Date;
    dateAuthorisedTo: Date;
    authorisedKm: number;
    travelRateTypeId: number;
    authorisedRate: number;
    authorisedAmount: number;
    authorisedAmountInclusive: number;
    description: string;
    isPreAuthorised: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    travelAuthNumber: string;
    payeeId: number;
}