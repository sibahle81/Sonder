import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { ApprovalType } from './approvaltype';

@Injectable()
export class ApprovalTypeService {
    private  apiUrl =  'bpm/api/ApprovalType';

    constructor(
        private readonly commonService: CommonService) {
    }

    getApprovalTypes(type: string): Observable<ApprovalType[]> {
        return this.commonService.get(type, `${this.apiUrl}`);
    }
}
