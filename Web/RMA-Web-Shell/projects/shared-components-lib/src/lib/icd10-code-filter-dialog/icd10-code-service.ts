import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';
import { ICD10CodeModel } from './icd10-code-model';

@Injectable({
  providedIn: 'root'
})
export class ICD10CodeService {
  private apiUrl = 'med/api/ICD10Code';

  constructor(
    private readonly commonService: CommonService) {
  }

  filterICD10Code(filter:string):Observable<ICD10CodeModel[]> {
    return this.commonService.getAll<ICD10CodeModel[]>(`${this.apiUrl}/FilterICD10Code/${filter}`);
  }
}
