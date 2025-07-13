export class Approval {
    id: number;
    itemId: number;
    itemType: string;
    approvalTypeId: number;
    approved: boolean;
    comment: string;
    approvalDate: Date;
    approvalBy: string;
}
