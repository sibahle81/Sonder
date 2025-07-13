import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { QuoteV2 } from '../models/quoteV2';
import { QuoteEmailRequest } from '../models/quoteEmailRequest';

@Injectable({
  providedIn: 'root'
})

export class QuoteService {
  private apiUrl = 'clc/api/Quote/Quote';

  constructor(
    private readonly commonService: CommonService) {
  }

  getPagedQuotesV2(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<QuoteV2>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<QuoteV2>>(`${this.apiUrl}/GetPagedQuotesV2/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  searchQuotesV2Paged(rolePlayerId: number, quoteStatusId: number, clientTypeId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<QuoteV2>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<QuoteV2>>(`${this.apiUrl}/SearchQuotesV2Paged/${rolePlayerId}/${quoteStatusId}/${clientTypeId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  createQuotes(quotes: QuoteV2[]): Observable<number> {
    return this.commonService.postGeneric<QuoteV2[],number>(`${this.apiUrl}/CreateQuotes`, quotes);
  }

  getQuoteV2(quoteId: number): Observable<QuoteV2> {
    return this.commonService.get<QuoteV2>(quoteId, `${this.apiUrl}/GetQuoteV2`);
  }

  getQuotesV2(leadId: number): Observable<QuoteV2[]> {
    return this.commonService.get<QuoteV2[]>(leadId, `${this.apiUrl}/GetQuotesV2`);
  }

  updateQuote(quote: QuoteV2): Observable<boolean> {
    return this.commonService.edit(quote, this.apiUrl + '/UpdateQuote');
  }

  emailQuote(quoteEmailrequest: QuoteEmailRequest): Observable<number> {
    return this.commonService.postGeneric<QuoteEmailRequest, number>(`${this.apiUrl}/EmailQuote`, quoteEmailrequest);
  }
}
