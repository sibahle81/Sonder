import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Approval } from './approval';

@Injectable()
export class ApprovalService {

    private apiApprovalUrl = 'bpm/api/Approval';
    constructor(

        private readonly commonService: CommonService) {
    }

    getApproval(id: string): Observable<Approval> {

        return this.commonService.get(id, this.apiApprovalUrl)
    }

    getApprovals(type: string): Observable<Approval[]> {

        return this.commonService.get(type, this.apiApprovalUrl);
    }

    getItemApprovals(itemType: string, itemId: number): Observable<Approval[]> {

        return this.commonService.getAll(`${this.apiApprovalUrl}/${itemType}/${itemId}`);
    }

    addApproval(approval: Approval): Observable<number> {

        return this.commonService.postGeneric<Approval, number>(this.apiApprovalUrl,approval);
    }

    editApprovalData(approval: Approval): Observable<number> {

        return this.commonService.postGeneric<Approval, number>(this.apiApprovalUrl, approval)
    }
}
