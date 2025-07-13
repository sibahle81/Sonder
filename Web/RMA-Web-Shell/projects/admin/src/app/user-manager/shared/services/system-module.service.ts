import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { SystemModule } from '../../../configuration-manager/shared/system-module';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
@Injectable({
  providedIn: 'root'
})
export class SystemModuleService {
  private apiUrl = 'mdm/api/Module';
  constructor(
      private readonly commonService: CommonService) {
  }
  getModules() : Observable<Lookup[]> {
    return this.commonService.getAll<Lookup[]>(this.apiUrl);
  }
  getModule(id: any): Observable<Lookup> {
      return this.commonService.get<Lookup>(id, this.apiUrl);
  }
}