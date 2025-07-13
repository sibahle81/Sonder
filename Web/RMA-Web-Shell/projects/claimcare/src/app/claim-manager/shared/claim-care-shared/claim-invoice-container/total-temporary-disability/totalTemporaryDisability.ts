import { InvoiceTypeEnum } from "projects/shared-models-lib/src/lib/enums/invoice-type-enum";
import { ClaimInvoice } from "../../../entities/claim-invoice.model";

export class TotalTemporaryDisability{
      claimInvoiceId : number; 
      personEventId : number; 
      dateReceived  : Date;
      authorisedDaysOff : number;
      payeeTypeId : number; 
      payee : string; 
      description : string; 
      memberName : string;  
      otherEmployer : string; 
      daysOffFrom : Date; 
      daysOffTo : Date; 
      totalDaysOff  : number;
      invoiceType : InvoiceTypeEnum;
      finalInvoice :string;
      isDeleted : boolean;
      createdBy : string;
      createdDate : Date;
      modifiedBy : string;
      modifiedDate : Date;
      claimInvoice : ClaimInvoice;
      payeeRolePlayerId: number;
      firstMedicalReportFormId: number;
}