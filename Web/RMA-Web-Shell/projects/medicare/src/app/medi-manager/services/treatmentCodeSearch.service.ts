import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { TreatmentCode } from 'projects/medicare/src/app/medi-manager/models/treatmentCode';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';

@Injectable({
    providedIn: 'root'
  })
  
export class TreatmentCodeSearchService {
    private apiUrl = 'med/api/medical';
    treatmentCodeSearch: TreatmentCode;
  
    constructor(
      private readonly commonService: CommonService) {
    }
  
    search(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<TreatmentCode>> {
      const urlQuery = encodeURIComponent(query);
      return this.commonService.getAll<PagedRequestResult<TreatmentCode>>(`${this.apiUrl}/SearchTreatmentCodeDetails/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
    } 
   
  }
