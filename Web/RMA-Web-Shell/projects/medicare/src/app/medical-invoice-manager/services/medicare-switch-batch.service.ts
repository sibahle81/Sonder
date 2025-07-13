import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { MedicalSwitch } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-switch';

@Injectable({
  providedIn: 'root'
})
export class MedicareSwitchBatchService {
  private apiUrlSwitchBatch = 'med/api/SwitchBatch';

  constructor(
    private readonly commonService: CommonService) {
  }

  GetSwitchTypes(): Observable<MedicalSwitch[]> {
    return this.commonService.getAll<MedicalSwitch[]>(this.apiUrlSwitchBatch + `/GetActiveSwitches`);
  }

}
