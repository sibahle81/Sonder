import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { CrosswalkSearch } from 'projects/medicare/src/app/medi-manager/models/crosswalk-search';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';

@Injectable({
    providedIn: 'root'
  })

  export class CrosswalkSearchComponentService{
    private apiUrl = 'med/api/medical';
    crosswalkSearch = CrosswalkSearch;

    constructor(
        private readonly commonService: CommonService) {}
    
    search(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<CrosswalkSearch>> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<PagedRequestResult<CrosswalkSearch>>(`${this.apiUrl}/SearchCrosswalk/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
        } 
            
  }