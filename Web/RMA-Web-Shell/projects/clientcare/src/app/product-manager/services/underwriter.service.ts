import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Underwriter } from '../models/underwriter';

@Injectable()
export class UnderwriterService {
  private api = 'mdm/api/Underwriter';

  constructor(private readonly commonService: CommonService) {
  }

  getUnderwriters(): Observable<Underwriter[]> {
    return this.commonService.getAll<Underwriter[]>(this.api);
  }

  getUnderwriter(underwriterId: number): Observable<Underwriter> {
    return this.commonService.get<Underwriter>(underwriterId, `${this.api}/ById`);
  }
}
