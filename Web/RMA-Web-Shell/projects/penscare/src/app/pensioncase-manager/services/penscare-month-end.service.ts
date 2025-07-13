import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { Pagination } from 'projects/shared-models-lib/src/lib/pagination/pagination';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';
import { MonthlyPensionLedger } from '../../shared-penscare/models/monthly-pension-ledger';
import { MonthlyPensionSetting } from '../../shared-penscare/models/monthly-pension-setting.model';
import { MonthlyPension } from '../../shared-penscare/models/monthly-pension.model';
import { ReleaseMonthEndRequest } from '../../shared-penscare/models/release-month-end-request';
import { ScheduleMonthEndRequest } from '../../shared-penscare/models/schedule-month-end-request.model';
import { PensCareResponse } from '../../shared-penscare/models/penscare-response.model';
import { MonthEndDates } from '../../shared-penscare/models/month-end-dates';
import { EmployeeTaxFileInformation } from '../../shared-penscare/models/EmployeeTaxFileInformation';
import { MonthEndRunDateSearchRequest } from '../../shared-penscare/models/month-end-dates-search-request';
import { MonthEndRunLedgerSummary } from '../../shared-penscare/models/month-end-ledger-summary';
import { PagedRequest } from '../../../../../shared-models-lib/src/lib/pagination/PagedRequest';
import { MonthEndDateDetail } from '../../shared-penscare/models/month-end-date-detail';
import { MonthEndRunPensionCaseLedger } from '../../shared-penscare/models/month-end-pensioncase_ledger';

@Injectable({
  providedIn: 'root'
})
export class PenscareMonthEndService {
  
  constructor(
    private commonService: CommonService
  ) { }

  private apiUrl = 'pen/api/PensionMonthEnd';

  public scheduleMonthEnd(scheduleMonthEndRequest: ScheduleMonthEndRequest): Observable<PensCareResponse> {
    return this.commonService.postGeneric<ScheduleMonthEndRequest, PensCareResponse>(`${this.apiUrl}/ScheduleMonthEnd`, scheduleMonthEndRequest);
  }

  public getMonthlyPensionSettings(): Observable<MonthlyPensionSetting> {
    return this.commonService.get<MonthlyPensionSetting>('', `${this.apiUrl}/GetMonthlyPensionSettings`);
  }

  public releaseMonthEndPayments(releaseMonthEndRequest: ReleaseMonthEndRequest): Observable<PensCareResponse> {
    return this.commonService.postGeneric<number, PensCareResponse>(`${this.apiUrl}/ReleaseMonthEndPayments`, releaseMonthEndRequest.monthlyPensionId);
  }

  public getMonthlyPensions(query: string, pagination: Pagination): Observable<PagedRequestResult<MonthlyPension>> {
    const searchTerm = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<MonthlyPension>>(`${this.apiUrl}/GetMonthlyPensions/${pagination.pageNumber}/${pagination.pageSize}/MonthlyPensionId/${!pagination.isAscending ? 'asc' : 'desc'}/${searchTerm}`);
  }

  public getMonthlyPensionLedgersBySearchCriteria(query: string, pagination: Pagination, monthlyPensionId: number): Observable<PagedRequestResult<MonthlyPensionLedger>> {
    const searchTerm = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<MonthlyPensionLedger>>(`${this.apiUrl}/GetMonthlyPensionLedgersBySearchCriteria/${pagination.pageNumber}/${pagination.pageSize}/MonthlyPensionId/${!pagination.isAscending ? 'asc' : 'desc'}/${monthlyPensionId}/${searchTerm}`);
  }

  public updateMonthEndDates(monthEndDatesRequest: MonthEndDates): Observable<MonthEndDates> {
    return this.commonService.postGeneric<MonthEndDates, MonthEndDates>(`${this.apiUrl}/UpdateMonthEndDates`, monthEndDatesRequest);
  }

  public addMonthEndDates(monthEndDatesRequest: MonthEndDates): Observable<MonthEndDates> {
    return this.commonService.postGeneric<MonthEndDates, MonthEndDates>(`${this.apiUrl}/AddMonthEndDates`, monthEndDatesRequest);
  }
  
  public addMonthEndRunDate(monthEndRunDate: MonthEndDates): Observable<number> {
    return this.commonService.postGeneric<MonthEndDates, number>(`${this.apiUrl}/AddMonthEndRunDate`, monthEndRunDate);
  }

  public getPagedMonthEndRunDates(monthEndDateSearchRequest: MonthEndRunDateSearchRequest): Observable<PagedRequestResult<MonthEndDates>> {
    return this.commonService.postGeneric<MonthEndRunDateSearchRequest, PagedRequestResult<MonthEndDates>>(`${this.apiUrl}/GetPagedMonthEndRunDates`, monthEndDateSearchRequest);
  } 

  public getMonthEndRunDateDetail(monthEndDateId: number): Observable<MonthEndDateDetail> {
    return this.commonService.get<MonthEndDateDetail>(monthEndDateId, `${this.apiUrl}/GetMonthEndRunDateDetails`);
  }

  getMonthEndRunPensionCaseLedgers(monthEndDateSearchRequest: MonthEndRunDateSearchRequest): Observable<PagedRequestResult<MonthEndRunPensionCaseLedger>> {
    return this.commonService.postGeneric<MonthEndRunDateSearchRequest, PagedRequestResult<MonthEndRunPensionCaseLedger>>(`${this.apiUrl}/GetPagedMonthEnRunPensionCaseLedgers`, monthEndDateSearchRequest);
  }

  public getMonthEndDatesList(year: number): Observable<MonthEndDates[]> {
    return this.commonService.get<MonthEndDates[]>(year, `${this.apiUrl}/GetMonthEndDates`);
  }

  public getLatestMonthEndRunDate(): Observable<MonthEndDates> {
    return this.commonService.getAll<MonthEndDates>(`${this.apiUrl}/GetLatestMonthEndRunDate`);
  }

  public getEmployeeTaxFileInformation(year: number, indicator: string): Observable<EmployeeTaxFileInformation[]> {
    return this.commonService.getAll<EmployeeTaxFileInformation[]>(`${this.apiUrl}/GetEmployeeTaxFileInformation/${year}/${indicator}`);
  }

  public GetMonthEndRunYears(): Observable<number[]> {
    return this.commonService.getAll<number[]>(`${this.apiUrl}/GetMonthEndRunYears`);
  }

  public queueMonthEndRun(monthEndRunDateId: number): Observable<boolean> {
    return this.commonService.postGeneric<number, boolean>(`${this.apiUrl}/QueueMonthEndRun`, monthEndRunDateId);
  }

  public queueMonthEndRunRelease(monthEndRunDateId: number): Observable<boolean> {
    return this.commonService.postGeneric<number, boolean>(`${this.apiUrl}/QueueMonthEndRunRelease`, monthEndRunDateId);
  }

  public getMonthEndRunLedgerSummary(request: MonthEndRunDateSearchRequest): Observable<PagedRequestResult<MonthEndRunLedgerSummary>> {
    return this.commonService.postGeneric<MonthEndRunDateSearchRequest, PagedRequestResult<MonthEndRunLedgerSummary>>(`${this.apiUrl}/GetPagedMonthEnRunLedgerSummary`, request);
  }
  
}
