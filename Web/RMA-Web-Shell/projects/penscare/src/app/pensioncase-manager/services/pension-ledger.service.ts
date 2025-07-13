import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';
import { BenefitDetail } from 'projects/shared-components-lib/src/lib/models/pension-case.model';
import { BenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/benefit-type-enum';
import { Pagination } from 'projects/shared-models-lib/src/lib/pagination/pagination';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PensionLedger } from 'projects/shared-components-lib/src/lib/models/pension-ledger.model';
import { ChildToAdultPensionLedger } from '../../shared-penscare/models/child-to-adult-pension-ledger.model';
import { CertificateOfLifeDetail } from '../../shared-penscare/models/certificate-of-life-detail';
import { CorrectiveEntry } from 'projects/shared-components-lib/src/lib/models/corrective-entry.model';

@Injectable({
  providedIn: 'root'
})
export class PensionLedgerService {
  private apiUrl = 'pen/api/PensionLedger';

  constructor(private readonly commonService: CommonService) {}

  public getBenefitDetailList(benefitType: BenefitTypeEnum): Observable<BenefitDetail[]> {
    return this.commonService.getAll<BenefitDetail[]>(`${this.apiUrl}/GetBenefitDetails/${benefitType}`);
  }

  public searchPensionLedgersWithPagingPagedRequestResult(query: string, pagination: Pagination): Observable<PagedRequestResult<PensionLedger>> {
    const searchTerm = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<PensionLedger>>(`${this.apiUrl}/GetLedgers/${pagination.pageNumber}/${pagination.pageSize}/${pagination.orderBy}/${!pagination.isAscending ? 'asc' : 'desc'}/${searchTerm}` );
  }

  public searchChildToAdultPensionLedgersWithPagingPagedRequestResult(query: string, pagination: Pagination): Observable<PagedRequestResult<ChildToAdultPensionLedger>> {
    const searchTerm = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<ChildToAdultPensionLedger>>(`${this.apiUrl}/GetChildToAdultPensionLedgers/${pagination.pageNumber}/${pagination.pageSize}/pensionledgerid/${!pagination.isAscending ? 'asc' : 'desc'}/${searchTerm}` );
  }

  public searchChildExtensionListWithPagingPagedRequestResult(query: string, pagination: Pagination): Observable<PagedRequestResult<ChildToAdultPensionLedger>> {
    const searchTerm = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<ChildToAdultPensionLedger>>(`${this.apiUrl}/GetChildExtensionList/${pagination.pageNumber}/${pagination.pageSize}/pensionledgerid/${!pagination.isAscending ? 'asc' : 'desc'}/${searchTerm}` );
  }

  public searchLedgerCorrectiveEntriesPagingPagedRequestResult(query: string, pagination: Pagination, ledgerId: number): Observable<PagedRequestResult<CorrectiveEntry>> {
    const searchTerm = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<CorrectiveEntry>>(`${this.apiUrl}/GetCorrectiveEntriesByPensionLedger/${pagination.pageNumber}/${pagination.pageSize}/pensionCaseNumber/${!pagination.isAscending ? 'asc' : 'desc'}/${ledgerId}/${searchTerm}` );
  }

  public getPensionLedgerById(pensionLedgerId: number): Observable<PensionLedger> {
    return this.commonService.get<PensionLedger>(pensionLedgerId, `${this.apiUrl}/Read`);
  }

  public getProofOfLifeList(): Observable<CertificateOfLifeDetail[]> {
    return this.commonService.get<CertificateOfLifeDetail[]>(``,`${this.apiUrl}/GetProofOfLifeData`);
  }


  public getProofOfLivesBySearchCriteria(query: string, pagination: Pagination): Observable<PagedRequestResult<CertificateOfLifeDetail[]>> {
    const searchTerm = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<CertificateOfLifeDetail[]>>(`${this.apiUrl}/GetProofOfLivesBySearchCriteria/${pagination.pageNumber}/${pagination.pageSize}/pensionCaseNumber/${!pagination.isAscending ? 'asc' : 'desc'}/${searchTerm}` );
  }
}
