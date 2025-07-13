import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Service } from 'projects/medicare/src/app/pmp-manager/models/service';
import { PensionClaim } from 'projects/shared-components-lib/src/lib/models/pension-case.model';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { ClinicVenue } from '../models/clinic-venue';

@Injectable({
  providedIn: 'root'
})
export class PMPService {
  private apiUrl = 'pen/api/pmp';
  private apiUrlService = 'med/api/medical';

  constructor(
    private readonly commonService: CommonService) {
  }

  searchPensionCase(pensionCaseNumber: string, claimId: number): Observable<PensionClaim> {
    return this.commonService.getAll<PensionClaim>(this.apiUrl + `/SearchPensionCase/${pensionCaseNumber}/${claimId}`);
  }

  getPagedPensionCase(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<PensionClaim>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<PensionClaim>>(`${this.apiUrl}/GetPagedPensionCase/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getServices(): Observable<Service[]> {
    return this.commonService.getAll<Service[]>(`${this.apiUrlService}/GetServices`);
  }
  
  getClinicVenue(): Observable<ClinicVenue[]> {
    return this.commonService.getAll<ClinicVenue[]>(`${this.apiUrlService}/GetClinicVenue`);
  }
}
