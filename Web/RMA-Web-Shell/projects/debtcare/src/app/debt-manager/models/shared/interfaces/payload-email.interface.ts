export interface payloadEmail {
    Subject: string,
    Recipients: string,
    RecipientsCC: string,
    RecipientsBCC: string,
    Body: string,
    IsHtml: boolean,
    ItemType : string,
    ItemId : number,
    Attachments: { 
      FileName: string,
      AttachmentByteData: string,
      FileType: string }[]
  }