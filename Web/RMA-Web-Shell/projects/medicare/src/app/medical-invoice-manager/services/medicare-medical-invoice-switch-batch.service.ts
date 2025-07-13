import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { MedicalSwitchBatchInvoice } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-switch-batch-invoice';
import { MedicalSwitchBatch } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-switch-batch';
import { MedicalInvoiceSearchBatchCriteria } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-search-batch-criteria';
import { MiSwitchBatchDeleteReason } from 'projects/medicare/src/app/medical-invoice-manager/models/mi-switch-batch-delete-reason';
import { SwitchBatchDeleteReason } from '../models/switch-batch-delete-reason';
import { MedicalSwitchBatchUnmappedParams } from '../models/medical-switch-batch-unmapped-params';
import { MedicalSwitchBatchSearchPersonEvent } from '../models/medical-switch-batch-search-person-event';
import { SwitchUnderAssessReasonSetting } from '../models/manual-switch-batch-delete-reasons';
import { SwitchBatchInvoiceMapParams } from '../models/switch-batch-invoice-map-params';
import { SwitchBatchInvoiceReinstateParams } from '../models/switch-batch-invoice-reinstate-params';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';

@Injectable({
  providedIn: 'root'
})
export class MedicareMedicalInvoiceSwitchBatchService {

  private apiUrlInvoice = 'med/api/InvoiceMedicalSwitch';

  constructor(
    private readonly commonService: CommonService) {
  }

  getMedicalSwitchBatchList(searchBatchSearchCrateria: MedicalInvoiceSearchBatchCriteria): Observable<MedicalSwitchBatch[]> {
    const url = `${this.apiUrlInvoice}/GetMedicalSwitchBatchList`;
    return this.commonService.postGeneric<MedicalInvoiceSearchBatchCriteria, MedicalSwitchBatch[]>(url, searchBatchSearchCrateria);
  }

 getPagedMedicalSwitchBatchList(searchBatchSearchCrateria: MedicalInvoiceSearchBatchCriteria): Observable<PagedRequestResult<MedicalSwitchBatch>> {
  const url = `${this.apiUrlInvoice}/GetPagedMedicalSwitchBatchList`;
  return this.commonService.postGeneric<MedicalInvoiceSearchBatchCriteria, PagedRequestResult<MedicalSwitchBatch>>(url, searchBatchSearchCrateria);
 }

  getUnmappedMiSwitchRecords(medicalSwitchBatchUnmappedParams: MedicalSwitchBatchUnmappedParams): Observable<MedicalSwitchBatchInvoice[]> {
    const url = `${this.apiUrlInvoice}/GetUnmappedMiSwitchRecords`;
    return this.commonService.postGeneric<MedicalSwitchBatchUnmappedParams, MedicalSwitchBatchInvoice[]>(url, medicalSwitchBatchUnmappedParams);
  }

  getMedicalSwitchBatchInvoices(switchedByID: number): Observable<MedicalSwitchBatchInvoice> {
    return this.commonService.get<MedicalSwitchBatchInvoice>(switchedByID, `${this.apiUrlInvoice}/GetMedicalSwitchBatchInvoices`);
  }

  getMedicalSwitchBatchInvoiceDetails(switchedByID: number): Observable<MedicalSwitchBatchInvoice[]> {
    return this.commonService.get<MedicalSwitchBatchInvoice[]>(switchedByID, `${this.apiUrlInvoice}/GetMedicalSwitchBatchInvoices`);
  }
  
  getSwitchBatchesDeleteReasons(): Observable<MiSwitchBatchDeleteReason[]> {
    return this.commonService.getAll<MiSwitchBatchDeleteReason[]>(this.apiUrlInvoice + `/GetSwitchBatchesDeleteReasons`);
  }

  editSwitchBatchDeleteReason(switchBatchDeleteReason:SwitchBatchDeleteReason): Observable<boolean> {
    return this.commonService.edit( switchBatchDeleteReason, this.apiUrlInvoice + `/EditSwitchBatchDeleteReason`);
  }

  editSwitchBatchAssignToUser(switchBatchInvoice:MedicalSwitchBatch): Observable<boolean> {
    return this.commonService.edit( switchBatchInvoice, this.apiUrlInvoice + `/EditSwitchBatchAssignToUser`);
  }

  validateSwitchBatchInvoicesForRefreshMapping(switchBatchID: number,isRefreshMapping:boolean): Observable<number> {
    return this.commonService.getAll(`${this.apiUrlInvoice}/ValidateSwitchBatchInvoices/${switchBatchID}/${isRefreshMapping}`);
  }

  getManualSwitchBatchDeleteReasons(): Observable<SwitchUnderAssessReasonSetting[]> {
    return this.commonService.getAll<SwitchUnderAssessReasonSetting[]>(this.apiUrlInvoice + `/GetManualSwitchBatchDeleteReasons`);
  }

  SaveManualSwitchBatchDeleteReasonToDB(switchBatchDeleteReason:SwitchBatchDeleteReason): Observable<boolean> {
    return this.commonService.edit( switchBatchDeleteReason, this.apiUrlInvoice + `/SaveManualSwitchBatchDeleteReasonToDB`);
  }

  reinstateSwitchBatchInvoices(switchBatchInvoiceReinstateParams: SwitchBatchInvoiceReinstateParams): Observable<boolean> {
    return this.commonService.edit(switchBatchInvoiceReinstateParams, this.apiUrlInvoice + `/ReinstateSwitchBatchInvoices`);
  }

  mapSwitchBatchInvoice(switchBatchInvoiceMapParams: SwitchBatchInvoiceMapParams): Observable<boolean> {
    return this.commonService.edit(switchBatchInvoiceMapParams, this.apiUrlInvoice + `/MapSwitchBatchInvoice`);
  }
}