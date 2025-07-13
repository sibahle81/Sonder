import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { CityRetrieval } from 'projects/shared-models-lib/src/lib/common/city-retrieval.model';
import { RolePlayerAddress } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-address';
@Injectable()
export class AddressService {

  private apiAddress = `mdm/api/City`;

  private addressUpdateSubject = new Subject();
  public addressUpdate$ = this.addressUpdateSubject.asObservable();

  constructor(
    private readonly commonService: CommonService) {
  }

  SearchClientAddress(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<CityRetrieval>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<CityRetrieval>>(`${this.apiAddress}/SearchAddress/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  public addressUpdate(rolePlayerAddresses: RolePlayerAddress[]) {
    this.addressUpdateSubject.next(rolePlayerAddresses);
  }

}

