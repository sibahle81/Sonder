import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { CancellationReason } from '../Entities/cancellationReason';

@Injectable()
export class CancellationReasonService {

    private apiCancellation = 'mdm/api/CancellationReason';

    constructor(private readonly commonService: CommonService) {
    }

    getCancellationReasons(): Observable<CancellationReason[]> {
        return this.commonService.getAll<CancellationReason[]>(`${this.apiCancellation}`);
    }

}
