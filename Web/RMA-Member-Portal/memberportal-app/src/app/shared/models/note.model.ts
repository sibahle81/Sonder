export class Note  {
    id: number;
    itemType: string;
    itemId: number;
    text: string;
    reason: string;

    isDeleted: boolean;
    createdBy: string;
    modifiedBy: string;
    createdDate: Date;
    modifiedDate: Date;
    isActive: boolean;
}
