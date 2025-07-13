import { Injectable } from '@angular/core';
import { PensionGazetteResult } from 'projects/shared-models-lib/src/lib/gazette/pension/pension-gazette-result';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GazetteService {
  private apiUrl = 'mdm/api/Gazette';

  constructor(
    private readonly commonService: CommonService) {
  }

  getPensionGazettesAsOfEffectiveDate(effectiveFromDate: string): Observable<PensionGazetteResult[]> {
    return this.commonService.postGeneric<string, PensionGazetteResult[]>(`${this.apiUrl}/GetPensionGazettesAsOfEffectiveDate`, effectiveFromDate);
  }
}
