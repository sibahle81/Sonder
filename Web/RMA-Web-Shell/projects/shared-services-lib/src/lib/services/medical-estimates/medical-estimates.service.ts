import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';
import { Icd10CodeEstimateAmount } from '../../../../../shared-models-lib/src/lib/common/icd10-code-estimate-amount';
import { ICD10EstimateFilter } from '../../../../../shared-models-lib/src/lib/common/icd10-estimate-filter';
@Injectable({
  providedIn: 'root'
})
export class MedicalEstimatesService {
  private apiUrl = 'clm/api/MedicalEstimates';

  constructor(
    private readonly commonService: CommonService) {
  }

  getICD10Estimates(icd10EstimateFilter: ICD10EstimateFilter): Observable<Icd10CodeEstimateAmount[]> {
    return this.commonService.postGeneric<ICD10EstimateFilter, Icd10CodeEstimateAmount[]>(`${this.apiUrl}/GetICD10Estimates`, icd10EstimateFilter);
  }
}
