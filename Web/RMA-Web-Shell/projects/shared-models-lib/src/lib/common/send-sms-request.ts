export class SendSMSRequest {
    message: string;
    whenToSend: Date ;
    lastChangedBy: string;
    smsNumbers: string[];
    itemType: string;
    itemId: number;
  }