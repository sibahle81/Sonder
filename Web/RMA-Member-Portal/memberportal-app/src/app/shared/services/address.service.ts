import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedRequestResult } from 'src/app/core/models/pagination/PagedRequestResult.model';
import { CommonService } from 'src/app/core/services/common/common.service';
import { ConstantApi } from '../constants/constant';
import { CityRetrieval } from '../models/city-retrieval.model';

@Injectable()
export class AddressService {

  constructor(
    private readonly commonService: CommonService) {
  }

  SearchClientAddress(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<CityRetrieval>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<CityRetrieval>>(`${ConstantApi.MasterDataApiAddress}/SearchAddress/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }
}
