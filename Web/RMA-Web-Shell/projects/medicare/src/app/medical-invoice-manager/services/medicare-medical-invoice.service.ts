import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Invoice } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice';
import { InvoiceUnderAssessReason } from 'projects/medicare/src/app/medical-invoice-manager/models/invoice-under-assess-reason';
import { PaymentAllocationDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/payment-allocation-details';
import { PaymentDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/payment-details';
import { ModifierInput } from 'projects/medicare/src/app/medical-invoice-manager/models/modifier-input';
import { ModifierOutput } from 'projects/medicare/src/app/medical-invoice-manager/models/modifier-output';
import { Modifier } from 'projects/medicare/src/app/medical-invoice-manager/models/modifier';

@Injectable({
  providedIn: 'root'
})
export class MedicalInvoiceService {
  private apiUrlInvoice = 'med/api/Invoice';
  private apiUrlInvoiceHelper = 'med/api/InvoiceHelper';
  private apiUrlInvoiceCommon = 'med/api/InvoiceCommon';

  constructor(
    private readonly commonService: CommonService) {
  }

  getInvoice(invoiceId: number): Observable<Invoice> {
    return this.commonService.get<Invoice>(invoiceId, `${this.apiUrlInvoice}/GetInvoice`);
  }

  getPaymentAllocationByMedicalInvoiceId(invoiceId: number): Observable<PaymentAllocationDetails> {
    return this.commonService.getAll<PaymentAllocationDetails>(`${this.apiUrlInvoiceCommon}/GetPaymentAllocationByMedicalInvoiceId/${invoiceId}`);
  }

  getPaymentsByMedicalInvoiceId(invoiceId: number): Observable<PaymentDetails[]> {
    return this.commonService.getAll<PaymentDetails[]>(`${this.apiUrlInvoiceCommon}/GetPaymentsByMedicalInvoiceId/${invoiceId}`);
  }

  addInvoice(invoiceModel: Invoice): Observable<number> {
    return this.commonService.postGeneric<Invoice, number>(this.apiUrlInvoiceHelper + `/AddInvoice`, invoiceModel);
  }

  autoPayRun(invoiceId: number, tebaInvoiceId: number): Observable<InvoiceUnderAssessReason> {
    return this.commonService.getAll(`${this.apiUrlInvoiceHelper}/AutoPayRun/${invoiceId}/${tebaInvoiceId}`);
  }

  reinstateMedicalInvoice(invoiceId: number, tebaInvoiceId: number): Observable<InvoiceUnderAssessReason> {
    return this.commonService.getAll(`${this.apiUrlInvoiceHelper}/ReinstateMedicalInvoice/${invoiceId}/${tebaInvoiceId}`);
  }

  forceReinstateMedicalInvoice(invoiceId: number, tebaInvoiceId: number): Observable<InvoiceUnderAssessReason> {
    return this.commonService.getAll(`${this.apiUrlInvoiceHelper}/ForceReinstateMedicalInvoice/${invoiceId}/${tebaInvoiceId}`);
  }


  isModifier(modifierCode: string): Observable<boolean> {
    return this.commonService.getAll<boolean>(`${this.apiUrlInvoiceCommon}/IsModifier/${modifierCode}`);
  }

  getModifier(modifierCode: string): Observable<Modifier> {
    return this.commonService.getAll<Modifier>(`${this.apiUrlInvoiceCommon}/GetModifier/${modifierCode}`);
  }

  calculateModifier(modifierInput: ModifierInput): Observable<ModifierOutput> {
    return this.commonService.postGeneric<ModifierInput, ModifierOutput>(`${this.apiUrlInvoiceCommon}/CalculateModifier`, modifierInput);
  }


  validateInvoiceRun(invoiceId: number, tebaInvoiceId: number): Observable<InvoiceUnderAssessReason[]> {
    return this.commonService.getAll(`${this.apiUrlInvoiceHelper}/ValidateInvoiceRun/${invoiceId}/${tebaInvoiceId}`);
  }


}
