export class SmsAudit {
    id: number;
    itemType: string;
    itemId: number | null;
    isSuccess: boolean | null;
    smsNumbers: string;
    message: string;
    isActive: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    processDescription: string;
  }
