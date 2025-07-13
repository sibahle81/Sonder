import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';

import { WorkItemType } from 'projects/digicare/src/app/work-manager/models/work-item-type';
import { MedicalReportCategory } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-category';

@Injectable({
  providedIn: 'root'
})
export class DigiCareMasterDataService {
  private apiUrl = 'digi/api/masterdata';

  constructor(
    private readonly commonService: CommonService) {
  }

  getWorkItemTypes(): Observable<WorkItemType[]> {
    return this.commonService.getAll<WorkItemType[]>(this.apiUrl + "/GetWorkItemTypes");
  }

  getMedicalReportCategories(): Observable<MedicalReportCategory[]> {
    return this.commonService.getAll<MedicalReportCategory[]>(this.apiUrl + "/GetMedicalReportCategories");
  }
}
