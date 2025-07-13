import { Injectable } from '@angular/core';
import { Observable, observable } from 'rxjs';
import { PagedRequestResult } from 'src/app/core/models/pagination/PagedRequestResult.model';
import { CommonService } from 'src/app/core/services/common/common.service';
import { OneTimePinModel } from '../models/onetimepinmodel';
import { Quote } from '../models/quote';
import { QuoteEmailRequest } from '../models/QuoteEmailRequest';

@Injectable({
  providedIn: 'root'
})

export class QuoteService {
  private apiUrl = 'clc/api/Quote/Quote';

  constructor(
    private readonly commonService: CommonService) {
  }

  getQuote(id: number): Observable<Quote> {
    return this.commonService.get<Quote>(id, `${this.apiUrl}`);
  }

  getQuotes(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Quote>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<Quote>>(`${this.apiUrl}/GetQuotes/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  updateQuote(quote: Quote): Observable<boolean> {
    return this.commonService.edit(quote, `${this.apiUrl}/UpdateQuote`);
  }

  updateQuoteAnon(quote: Quote): Observable<boolean> {
    return this.commonService.edit(quote, `${this.apiUrl}/UpdateQuoteAnon`);
  }

  emailQuote(quoteEmailRequest: QuoteEmailRequest) {
    return this.commonService.edit(quoteEmailRequest, `${this.apiUrl}/EmailQuote`);
  }

  getOneTimePinByQuoteNumber(quoteNumber: string): Observable<OneTimePinModel> {
    return this.commonService.get<OneTimePinModel>(quoteNumber, `${this.apiUrl}/GetOneTimePinByQuoteNumber`);
  }

  getOneTimePinByQuoteNumberViaEmail(quoteNumber: string): Observable<OneTimePinModel> {
    return this.commonService.get<OneTimePinModel>(quoteNumber, `${this.apiUrl}/GetOneTimePinByQuoteNumberViaEmail`);
  }

  getQuoteDetailsByQuoteNumber(quoteNumber: string, oneTimePin: number): Observable<Quote> {
    return this.commonService.getAll<Quote>(`${this.apiUrl}/GetQuoteDetailsByQuoteNumber/${quoteNumber}/${oneTimePin}`);
  }

  generateMemberNumber(memberName: string): Observable<string> {
    const url = `${this.apiUrl}/GenerateMemberNumber/${memberName}`;
    return this.commonService.getString(url);
  }
}
