import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { TebaInvoice } from '../models/teba-invoice';
import { TebaTariff } from '../models/teba-tariff';

@Injectable({
  providedIn: 'root'
})
export class TebaInvoiceService {
  private apiUrlInvoiceHelper = 'med/api/InvoiceHelper';
  private apiUrlInvoiceCommon = 'med/api/InvoiceCommon';


  constructor(
    private readonly commonService: CommonService) {
  }

  getPagedTebaInvoiceList(pageNumber: number, pageSize: number, orderBy: string = 'tebaInvoiceId', sortDirection: string = 'asc', query: string): Observable<PagedRequestResult<TebaInvoice>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<TebaInvoice>>(`${this.apiUrlInvoiceCommon}/GetPagedTebaInvoiceList/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  listTebaInvoicesByPersonEventId(personEventId: number): Observable<TebaInvoice[]> {
    return this.commonService.getAll<TebaInvoice[]>(`${this.apiUrlInvoiceCommon}/GetPagedTebaInvoiceDetailsByPersonEventId/${personEventId}`);
  }


  getTebaInvoice(tebaInvoiceId: number): Observable<TebaInvoice> {
    return this.commonService.get<TebaInvoice>(tebaInvoiceId, `${this.apiUrlInvoiceCommon}/GetTebaInvoice`);
  }

  editInvoice(tebaInvoice: TebaInvoice): Observable<boolean> {
    return this.commonService.edit(tebaInvoice, this.apiUrlInvoiceCommon + `/EditTebaInvoice`);
  }

  addInvoice(tebaInvoice: TebaInvoice): Observable<number> {
    return this.commonService.postGeneric<TebaInvoice, number>(this.apiUrlInvoiceHelper + `/AddTebaInvoice`, tebaInvoice);
  }

  GetTebaTariff(rateType: number, serviceDate: Date): Observable<TebaTariff> {
    const isoDate = serviceDate.toISOString();
    const apiParams = `${rateType}/${isoDate}`;
    return this.commonService.get<TebaTariff>(apiParams, `${this.apiUrlInvoiceCommon}/GetTebaTariff`);
  }

  GetTebaTariffs(tebaTariffs: TebaTariff[]): Observable<TebaTariff[]> {
    return this.commonService.postGeneric<TebaTariff[], TebaTariff[]>(this.apiUrlInvoiceCommon + `/GetTebaTariffs`, tebaTariffs);
  }

}
