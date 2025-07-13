export class PreAuthTreatmentBasket
{
    createdBy: string;
    createdDate: Date;
    isAuthorised: boolean;
    isClinicalUpdate: boolean;
    modifiedBy: string;
    modifiedDate: Date;
    preAuthTreatmentBasketId: number;
    treatmentBasketId: number;
    description:string;
    icd10CodeId:number;
    preAuthId?: number;
    updateSequenceNo: number;
}