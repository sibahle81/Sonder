import { MedicalInvoiceLineItem } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-item';

export class InvoiceLineDetails extends MedicalInvoiceLineItem {
  tariffBaseUnitCostType: string;
  tariffDescription: string;
  defaultQuantity: number;
  validationMark: string;
//-- include and exclude allocationFields FormArray - FormGroup properties
  exclude?:any;
  include?:any;
  underAssessReason?:string;
}
